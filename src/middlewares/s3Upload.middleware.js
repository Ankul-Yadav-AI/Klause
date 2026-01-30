// middleware/s3Upload.middleware.js
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { extname } from "path";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { loadConfig } from "../config/loadConfig.js";
import { Readable } from "stream";

const secret = await loadConfig();

// Initialize S3 Client
const s3Client = new S3Client({
  region: secret.AWS_REGION,
  credentials: {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
  },
});

// File type configurations
const FILE_CONFIGS = {
  image: {
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
    allowedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".heic",
      ".heif",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: "images",
  },
  video: {
    allowedMimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/hevc",
    ],
    allowedExtensions: [".mp4", ".mov", ".avi", ".hevc"],
    maxSize: 100 * 1024 * 1024, // 100MB
    folder: "videos",
  },
  audio: {
    allowedMimeTypes: ["audio/mpeg", "audio/mp4", "audio/aac", "audio/x-m4a"],
    allowedExtensions: [".mp3", ".m4a", ".aac"],
    maxSize: 20 * 1024 * 1024, // 20MB
    folder: "audios",
  },
  document: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: [".pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: "documents",
  },
};

// Magic number validation
const MAGIC_NUMBERS = {
  "image/jpeg": ["ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"],
  "image/png": ["89504e47"],
  "image/gif": ["47494638"],
  "image/webp": ["52494646"],
  "video/mp4": ["66747970"],
  "video/quicktime": ["66747970"],
  "application/pdf": ["25504446"],
  "audio/mpeg": ["494433", "fffb", "fff3", "fff2"],
};

// Validate file signature from buffer
const validateFileSignature = (buffer, mimeType) => {
  const magicNumbers = MAGIC_NUMBERS[mimeType];
  if (!magicNumbers) return true;

  const fileSignature = buffer.toString("hex", 0, 8);

  return magicNumbers.some((magic) => fileSignature.startsWith(magic));
};

// Stream transformer for magic number validation
class MagicNumberValidator extends Readable {
  constructor(originalStream, mimetype, onValidated) {
    super();
    this.originalStream = originalStream;
    this.mimetype = mimetype;
    this.headerBuffer = Buffer.alloc(0);
    this.validated = false;
    this.onValidated = onValidated;
    this.setupListeners();
  }

  setupListeners() {
    this.originalStream.on("data", (chunk) => {
      if (!this.validated && this.headerBuffer.length < 8) {
        this.headerBuffer = Buffer.concat([this.headerBuffer, chunk]);

        if (this.headerBuffer.length >= 8) {
          this.validated = true;

          if (!validateFileSignature(this.headerBuffer, this.mimetype)) {
            this.destroy(
              new ApiError(
                400,
                "File signature does not match declared MIME type. File may be corrupted or spoofed."
              )
            );
            return;
          }

          if (this.onValidated) this.onValidated();
        }
      }
      this.push(chunk);
    });

    this.originalStream.on("end", () => {
      if (!this.validated && this.headerBuffer.length < 8) {
        this.destroy(new ApiError(400, "File too small to validate"));
        return;
      }
      this.push(null);
    });

    this.originalStream.on("error", (error) => {
      this.destroy(error);
    });
  }

  _read() {
    // Required for Readable, handled by listeners
  }
}

// Create S3 upload middleware
export const createS3Upload = (fileType = "image", options = {}) => {
  const config = FILE_CONFIGS[fileType];

  if (!config) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  const {
    maxSize = config.maxSize,
    folder = config.folder,
    validateMagicNumber = true,
  } = options;

  const fileFilter = (req, file, cb) => {
    try {
      // 1. Validate extension
      const ext = extname(file.originalname).toLowerCase();
      if (!config.allowedExtensions.includes(ext)) {
        return cb(
          new ApiError(
            400,
            `Invalid extension. Allowed: ${config.allowedExtensions.join(", ")}`
          )
        );
      }

      //fileTypeFromFile

      // 2. Validate MIME type
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new ApiError(
            400,
            `Invalid MIME type. Allowed: ${config.allowedMimeTypes.join(", ")}`
          )
        );
      }

      // 3. Sanitize filename
      file.originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

      cb(null, true);
    } catch (error) {
      cb(error);
    }
  };

  const storage = multerS3({
    s3: s3Client,
    bucket: secret.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || req.user?._id || "anonymous",
        uploadedAt: new Date().toISOString(),
      });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(16).toString("hex");
      const timestamp = Date.now();
      const ext = extname(file.originalname);
      const filename = `${folder}/${timestamp}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
    ...(validateMagicNumber && {
      shouldTransform: (req, file, cb) => {
        cb(null, MAGIC_NUMBERS[file.mimetype] !== undefined);
      },
      transforms: (req, file, cb) => {
        cb(null, new MagicNumberValidator(file.stream, file.mimetype));
      },
    }),
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: options.maxFiles || 10,
    },
  });
};
