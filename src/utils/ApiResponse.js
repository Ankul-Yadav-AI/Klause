import { t } from "../i18n/index.js";

class ApiResponse {
  constructor(statusCode, messageKey = "SUCCESS", lang, data = {}) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = t(lang, messageKey);
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
