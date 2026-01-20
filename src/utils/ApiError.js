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

    this.statusCode = statusCode;
    this.data = null;
    this.message = t(lang, messageKey);
    this.success = false;
    this.errors = error;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
