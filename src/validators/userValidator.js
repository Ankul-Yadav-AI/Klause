import Joi from "joi";

const userValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(/^[^\W_][\w.-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.base": "FIELD_MUST_BE_STRING",
      "string.empty": "FIELD_REQUIRED",
      "string.email": "EMAIL_MUST_BE_VALID",
      "string.pattern.base":
        "EMAIL_FORMAT_IS_INVALID_IT_SHOULD_NOT_START_WITH_SPECIAL_CHARACTERS",
      "any.required": "FIELD_REQUIRED",
    }),
});

const createCredentialsValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),
  password: Joi.string()
    .min(8)
    .max(15)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,15}$"
      )
    )
    .required()
    .messages({
      "string.base": "PASSWORD_MUST_BE_STRING",
      "string.empty": "PASSWORD_IS_REQUIRED",
      "string.min":
        "PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.max":
        "PASSWORD_CANNOT_EXCEED_15_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.pattern.base":
        "PASSWORD_MUST_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "any.required": "PASSWORD_IS_REQUIRED",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.base": "CONFIRM_PASSWORD_MUST_BE_STRING",
    "string.empty": "CONFIRM_PASSWORD_IS_REQUIRED",
    "any.only": "PASSWORD_AND_CONFIRM_PASSWORD_MUST_MATCH",
    "any.required": "CONFIRM_PASSWORD_IS_REQUIRED",
  }),
});

const ownerDetailsSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(250).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  firstName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  lastName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "INVALID_GENDER",
    "any.required": "FIELD_REQUIRED",
  }),

  country: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  descriptionOfCompany: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      "string.base": "FIELD_MUST_BE_STRING",
      "string.empty": "FIELD_REQUIRED",
      "string.min": "FIELD_MIN_LENGTH",
      "string.max": "FIELD_MAX_LENGTH",
      "any.required": "FIELD_REQUIRED",
    }),

  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.empty": "FIELD_REQUIRED",
      "string.pattern.base": "PHONE_NUMBER_IS_INVALID",
      "any.required": "FIELD_REQUIRED",
    }),

  alternatePhone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "PHONE_NUMBER_IS_INVALID",
    }),

  mainAddressStreet: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  mainAddressNo: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  mainAddressPostCode: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  mainAddressCity: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  billingAddressStreet: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  billingAddressNo: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  billingAddressPostCode: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  billingAddressCity: Joi.string().trim().allow("").optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
  }),

  VATId: Joi.string()
    .trim()
    .pattern(/^[A-Z0-9\-]{5,20}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "VAT_ID_IS_INVALID",
    }),

  CountryCode: Joi.string().length(2).uppercase().required().messages({
    "string.empty": "FIELD_REQUIRED",
    "string.length": "COUNTRY_CODE_MUST_BE_ISO_2",
    "any.required": "FIELD_REQUIRED",
  }),
});

const nickNameSchema = Joi.object({
  nickName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),
});

const userDetailsSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  lastName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "INVALID_GENDER",
    "any.required": "FIELD_REQUIRED",
  }),

  country: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.empty": "FIELD_REQUIRED",
      "string.pattern.base": "PHONE_NUMBER_IS_INVALID",
      "any.required": "FIELD_REQUIRED",
    }),
});

const loginValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(/^[^\W_][\w.-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.base": "FIELD_MUST_BE_STRING",
      "string.empty": "FIELD_REQUIRED",
      "string.email": "EMAIL_MUST_BE_VALID",
      "string.pattern.base":
        "EMAIL_FORMAT_IS_INVALID_IT_SHOULD_NOT_START_WITH_SPECIAL_CHARACTERS",
      "any.required": "FIELD_REQUIRED",
    }),
  password: Joi.string()
    .min(8)
    .max(15)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,15}$"
      )
    )
    .required()
    .messages({
      "string.base": "PASSWORD_MUST_BE_STRING",
      "string.empty": "PASSWORD_IS_REQUIRED",
      "string.min":
        "PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.max":
        "PASSWORD_CANNOT_EXCEED_15_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.pattern.base":
        "PASSWORD_MUST_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "any.required": "PASSWORD_IS_REQUIRED",
    }),
});

const changePasswordValidationSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.base": "PASSWORD_MUST_BE_STRING",
    "string.empty": "PASSWORD_IS_REQUIRED",
    "any.required": "PASSWORD_IS_REQUIRED",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(15)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,15}$"
      )
    )
    .required()
    .messages({
      "string.base": "PASSWORD_MUST_BE_STRING",
      "string.empty": "PASSWORD_IS_REQUIRED",
      "string.min":
        "PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.max":
        "PASSWORD_CANNOT_EXCEED_15_CHARACTERS_LONG_AND_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "string.pattern.base":
        "PASSWORD_MUST_INCLUDE_AT_LEAST_ONE_LOWERCASE_LETTER_ONE_UPPERCASE_LETTER_ONE_NUMBER_AND_ONE_SPECIAL_CHARACTER",
      "any.required": "PASSWORD_IS_REQUIRED",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "string.base": "CONFIRM_PASSWORD_MUST_BE_STRING",
      "string.empty": "CONFIRM_PASSWORD_IS_REQUIRED",
      "any.only": "PASSWORD_AND_CONFIRM_PASSWORD_MUST_MATCH",
      "any.required": "CONFIRM_PASSWORD_IS_REQUIRED",
    }),
});

const updateUserProfileValidationSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),

  lastName: Joi.string().trim().min(1).max(50).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),
  
});

export {
  userValidationSchema,
  createCredentialsValidationSchema,
  ownerDetailsSchema,
  nickNameSchema,
  userDetailsSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  updateUserProfileValidationSchema,
};
