import Joi from "joi";

const userValidationSchema = Joi.object({
  // name: Joi.string()
  //   .trim()
  //   .pattern(/^[a-zA-Z\s]+$/)
  //   .min(1)
  //   .max(50)
  //   .required()
  //   .messages({
  //     "string.base": "Name must be a string.",
  //     "string.empty": "Name_Required",
  //     "string.min": "Name must be at least 1 character.",
  //     "string.max": "Name cannot exceed 50 characters.",
  //     "string.pattern.base":
  //       "Name can only contain letters and spaces. Numbers and special characters are not allowed.",
  //     "any.required": "Name is required.",
  //   }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(/^[^\W_][\w.-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.base": "EMAIL_MUST_BE_STRING",
      "string.empty": "EMAIL_IS_REQUIRED",
      "string.email": "EMAIL_MUST_BE_VALID",
      "string.pattern.base":
        "EMAIL_FORMAT_IS_INVALID_IT_SHOULD_NOT_START_WITH_SPECIAL_CHARACTERS",
      "any.required": "EMAIL_IS_REQUIRED",
    }),
  // mobile: Joi.string()
  //   .pattern(/^\+[1-9][0-9]{0,5}[1-9][0-9]{1,20}$/)
  //   .required()
  //   .messages({
  //     "string.base": "Mobile number must be a string.",
  //     "string.empty": "Mobile number is required.",
  //     "string.pattern.base":
  //       "Mobile number must include a valid country code and be in the format: +<country code><number>.",
  //     "any.required": "Mobile number is required.",
  //   }),
  // country: Joi.string().optional().allow("").messages({
  //   "string.base": "Country must be a string.",
  // }),
  // state: Joi.string().optional().allow("").messages({
  //   "string.base": "State must be a string.",
  //   "string.empty": "State is required.",
  //   "any.required": "State is required.",
  // }),
  // city: Joi.string().optional().allow("").messages({
  //   "string.base": "City must be a string.",
  //   "string.empty": "City is required.",
  //   "any.required": "City is required.",
  // }),
  // gender: Joi.string().valid("male", "female", "other").required().messages({
  //   "string.base": "Gender must be a string.",
  //   "string.empty": "Gender is required.",
  //   "any.only": "Gender must be one of male, female, or other.",
  //   "any.required": "Gender is required.",
  // }),
  // password: Joi.string()
  //   .min(8)
  //   .max(15)
  //   .pattern(
  //     new RegExp(
  //       "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,15}$"
  //     )
  //   )
  //   .required()
  //   .messages({
  //     "string.base": "Password must be a string.",
  //     "string.empty": "Password is required.",
  //     "string.min":
  //       "Password must be at least 8 characters.Password must include at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&#).",
  //     "string.max":
  //       "Password cannot exceed 15 characters.Password must include at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&#).",
  //     "string.pattern.base":
  //       "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&#).",
  //     "any.required": "Password is required.",
  //   }),

  // confirm_password: Joi.string()
  //   .valid(Joi.ref("password"))
  //   .required()
  //   .messages({
  //     "string.base": "Password must be a string.",
  //     "string.empty": "Confirm Password is required.",
  //     "any.only": "Password and Confirm Password should be same.",
  //     "any.required": "Confirm Password is required.",
  //   }),
  // otp: Joi.string().optional().allow("").messages({
  //   "string.base": "OTP must be a string.",
  // }),
  // otpExpire: Joi.date().optional().allow("").messages({
  //   "date.base": "OTP Expiry must be a valid date.",
  // }),
  // referralBy: Joi.string().optional().allow("", null).messages({
  //   "string.base": "ReferredBy must be a string.",
  // }),
});


export {
  userValidationSchema,
};
