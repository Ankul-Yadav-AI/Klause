// utils/asyncHandler.js
import fs from "fs";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    // Cleanup uploaded files in case of error
    cleanupUploadedFiles(req);
    
    // Pass error to global error handler middleware
    next(error);
  }
};

// Helper function to cleanup uploaded files
const cleanupUploadedFiles = (req) => {
  try {
    // Cleanup single file (req.file)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log(`Cleaned up file: ${req.file.path}`);
    }

    // Cleanup multiple files (req.files)
    if (req.files) {
      // Case 1: upload.array() - req.files is an array
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Cleaned up file: ${file.path}`);
          }
        });
      } 
      // Case 2: upload.fields() - req.files is an object
      else if (typeof req.files === "object") {
        Object.keys(req.files).forEach((fieldName) => {
          const filesArray = req.files[fieldName];
          if (Array.isArray(filesArray)) {
            filesArray.forEach((file) => {
              if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log(`Cleaned up file: ${file.path}`);
              }
            });
          }
        });
      }
    }
  } catch (cleanupError) {
    console.error("Error during file cleanup:", cleanupError.message);
  }
};

export { asyncHandler, cleanupUploadedFiles };