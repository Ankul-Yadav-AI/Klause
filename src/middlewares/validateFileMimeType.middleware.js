import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { ApiError } from "../utils/ApiError.js";

/**
 * Validate all uploaded files (single / array / fields)
 */
export const validateUploadedFiles = (allowedMimeTypes) => {
  return async (req, res, next) => {
    try {
      let files = [];

      // upload.single()
      if (req.file) {
        files = [req.file];
      }

      // upload.array()
      if (req.files && Array.isArray(req.files)) {
        files = req.files;
      }

      // upload.fields()
      if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
        files = Object.values(req.files).flat();
      }

      for (const file of files) {
        const detected = await fileTypeFromFile(file.path);

        if (!detected || !allowedMimeTypes.includes(detected.mime)) {
          fs.unlinkSync(file.path);

          throw new ApiError(
            400,
            "INVALID_FILE_UPLOADED_ALLOWED_TYPES" + allowedMimeTypes.join(", "),
            req.lang
          );
        }
      }

      next();
    } catch (err) {
      // cleanup in case of error
      if (req.file?.path) fs.unlinkSync(req.file.path);

      if (req.files) {
        const allFiles = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        allFiles.forEach(f => {
          if (f.path && fs.existsSync(f.path)) {
            fs.unlinkSync(f.path);
          }
        });
      }

      next(err);
    }
  };
};
