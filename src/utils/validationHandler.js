import { t } from "../i18n/index.js";

const validateSchema = async (schema, data , lang = "en") => {
    try {
      await schema.validateAsync(data, { abortEarly: true }); 
      return null;
    } catch (error) {
      if (error.isJoi) {
        const messageKey = error.details[0].message;
        return t(lang, messageKey);
      }
      throw error;
    }
  };
  
  export { validateSchema };
  