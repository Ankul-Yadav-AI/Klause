// middleware/errorHandler.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { t } from "../i18n/index.js";
import { cleanupUploadedFiles } from "../utils/asyncHandler.js";
import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  // Cleanup any uploaded files
  cleanupUploadedFiles(req);

  // Get language from request
  const lang =
    req.lang ||
    req.headers["accept-language"]?.split(",")[0]?.split("-")[0] ||
    req.query.lang ||
    req.body.lang ||
    "en";

  let error = err;

  // Log error for debugging
  console.error("Error caught in errorHandler:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    let messageKey = "FILE_UPLOAD_ERROR";

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        messageKey = "FILE_SIZE_LIMIT_EXCEEDED";
        break;
      case "LIMIT_FILE_COUNT":
        messageKey = "FILE_COUNT_LIMIT_EXCEEDED";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        messageKey = "UNEXPECTED_FILE_FIELD";
        break;
      case "LIMIT_PART_COUNT":
        messageKey = "TOO_MANY_PARTS";
        break;
    }

    error = new ApiError(400, messageKey, lang);
  }

  // Handle AWS S3 errors
  else if (err.name === "S3ServiceException" || err.$metadata) {
    const statusCode = err.$metadata?.httpStatusCode || 500;
    error = new ApiError(statusCode, "S3_UPLOAD_FAILED", lang);
  }

  // Handle MongoDB duplicate key error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    error = new ApiError(409, "DUPLICATE_FIELD", lang, [{ field }]);
  }

  // Handle MongoDB CastError
  else if (err.name === "CastError") {
    error = new ApiError(400, "INVALID_ID", lang, [
      { field: err.path, value: err.value },
    ]);
  }

  // Handle validation errors (from express-validator or Joi)
  else if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    error = new ApiError(400, "VALIDATION_ERROR", lang, messages);
  }

  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "INVALID_TOKEN", lang);
  } else if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "TOKEN_EXPIRED", lang);
  }

  // Convert to ApiError if not already
  if (!(error instanceof ApiError)) {
    console.log("error", error);
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "SERVER_ERROR";

    console.log("message", message);
    console.log("lang", lang);
    console.log(t(lang, message));
    // Check if message is a translation key
    const translatedMessage =
      message.includes("_") && message === message.toUpperCase()
        ? t(lang, message)
        : message;

    error = new ApiError(
      statusCode,
      translatedMessage,
      lang,
      error?.errors || []
    );
  }

  // Ensure message is translated
  if (!error.message || error.message.includes("_")) {
    error.message = t(lang, error.message || "SERVER_ERROR");
  }

  // Consistent error response format
  const response = {
    success: false,
    statusCode: error.statusCode,
    data: null,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      originalError: err.message !== error.message ? err.message : undefined,
    }),
  };

  return res.status(error.statusCode).json(response);
};
