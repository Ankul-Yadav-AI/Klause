import { t } from "../i18n/index.js";

class ApiError extends Error {
  constructor(
    statusCode,
    messageKey = "SERVER_ERROR",
    lang = "en",
    error = [],
    stack = ""
  ) {
    super(messageKey);
    console.log("Creating ApiError:", {
      statusCode,
      messageKey,
      lang,
      error,
      stack,
    });

    this.statusCode = statusCode;
    this.data = null;
    this.message = t(lang, messageKey);
    this.success = false;
    this.errors = error;
    console.log("ApiError created with message:", this.message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
