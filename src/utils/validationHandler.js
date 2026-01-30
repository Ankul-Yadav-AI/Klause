import { t } from "../i18n/index.js";
import { FIELD_LABELS } from "../constants/fieldLabels.js";

const validateSchema = async (schema, data, lang = "en") => {
  try {
    await schema.validateAsync(data, { abortEarly: true, allowUnknown: true });
    return null;
  } catch (error) {
    if (error.isJoi) {
      const detail = error.details[0];
      const messageKey = detail.message;
      const fieldName = detail.path[0];
      const fieldLabelKey = FIELD_LABELS[fieldName] || fieldName;
      return t(lang, messageKey, {
        field: t(lang, fieldLabelKey),
        min: detail.context?.limit,
        max: detail.context?.limit,
      });
    }

    throw error;
  }
};

export { validateSchema };
