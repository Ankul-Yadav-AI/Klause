import { createS3Upload } from "../middlewares/s3Upload.middleware.js";

// Convenience exports for common use cases
export const uploadImage = createS3Upload("image", {
  validateMagicNumber: true,
});

export const uploadVideo = createS3Upload("video", {
  validateMagicNumber: true,
});

export const uploadAudio = createS3Upload("audio", {
  validateMagicNumber: true,
});

export const uploadDocument = createS3Upload("document", {
  validateMagicNumber: true,
});

// Custom upload with specific config
export const uploadProfileImage = createS3Upload("image", {
  maxSize: 1 * 1024 * 1024, // 1MB
  folder: "profiles",
  validateMagicNumber: true,
});
