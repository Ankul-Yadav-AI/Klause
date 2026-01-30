import Joi from "joi";

// ==================== RESTAURANT TYPE VALIDATION ====================
export const restaurantTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
    "any.required": "TYPE_IS_REQUIRED",
  }),
});

export const updateRestaurantTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);

// ==================== SERVICE TYPE VALIDATION ====================
export const serviceTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
    "any.required": "TYPE_IS_REQUIRED",
  }),
});

export const updateServiceTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);

// ==================== BUSINESS TYPE VALIDATION ====================
export const businessTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
    "any.required": "TYPE_IS_REQUIRED",
  }),
});

export const updateBusinessTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);

// ==================== CUISINE VALIDATION ====================
export const cuisineValidationSchema = Joi.object({
  cuisineName: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
    "any.required": "FIELD_REQUIRED",
  }),
});

export const updateCuisineValidationSchema = Joi.object({
  cuisineName: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "FIELD_MUST_BE_STRING",
    "string.empty":"FIELD_REQUIRED",
    "string.min": "FIELD_MIN_LENGTH",
    "string.max": "FIELD_MAX_LENGTH",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);

// ==================== DISH TYPE VALIDATION ====================
export const dishTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
    "any.required": "TYPE_IS_REQUIRED",
  }),
});

export const updateDishTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);

// ==================== DIET TYPE VALIDATION ====================
export const dietTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
    "any.required": "TYPE_IS_REQUIRED",
  }),
});

export const updateDietTypeValidationSchema = Joi.object({
  type: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "TYPE_MUST_BE_STRING",
    "string.empty": "TYPE_CANNOT_BE_EMPTY",
    "string.min": "TYPE_MIN_LENGTH_2",
    "string.max": "TYPE_MAX_LENGTH_100",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "string.base": "STATUS_MUST_BE_STRING",
    "any.only": "STATUS_MUST_BE_ACTIVE_OR_INACTIVE",
  }),
}).min(1);
