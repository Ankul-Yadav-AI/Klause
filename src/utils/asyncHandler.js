import fs from "fs";
import { t } from "../i18n/index.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    // file cleanup (tumhara existing code)
    if (req.files) {
      const keyNames = Object.keys(req.files)[0];
      if (keyNames) {
        for (const file of req.files[keyNames]) {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = t(req.lang, "DUPLICATE_DATA");
    }

    res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      data: null,
      message: error.message || t(req.lang, "SERVER_ERROR"),
      success: false,
    });
  }
};

export { asyncHandler };
