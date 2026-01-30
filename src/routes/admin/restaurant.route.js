import { Router } from "express";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import { authenticatedUser } from "../../middlewares/adminAuth.middleware.js";
import {
  restaurantTypeValidationSchema,
  updateRestaurantTypeValidationSchema,
  serviceTypeValidationSchema,
  updateServiceTypeValidationSchema,
  businessTypeValidationSchema,
  updateBusinessTypeValidationSchema,
  cuisineValidationSchema,
  updateCuisineValidationSchema,
  dishTypeValidationSchema,
  updateDishTypeValidationSchema,
  dietTypeValidationSchema,
  updateDietTypeValidationSchema,
} from "../../validators/restaurantValidator.js";
import {
  // Restaurant Type
  getRestaurantTypes,
  saveRestuarantType,
  getRestaurantTypeById,
  updateRestaurantType,
  deleteRestaurantType,
  // Service Type
  getServiceTypes,
  saveServiceType,
  getServiceTypeById,
  updateServiceType,
  deleteServiceType,
  // Business Type
  getBusinessTypes,
  saveBusinessType,
  getBusinessTypeById,
  updateBusinessType,
  deleteBusinessType,
  // Cuisine
  getCuisines,
  saveCuisine,
  getCuisineById,
  updateCuisine,
  deleteCuisine,
  // Dish Type
  getDishTypes,
  saveDishType,
  getDishTypeById,
  updateDishType,
  deleteDishType,
  // Diet Type
  getDietTypes,
  saveDietType,
  getDietTypeById,
  updateDietType,
  deleteDietType,
} from "../../controllers/admin/restaurant.controller.js";

const router = Router();

// ==================== RESTAURANT TYPE ROUTES ====================
router.post(
  "/type",
  authenticatedUser,
  validateRequest(restaurantTypeValidationSchema),
  saveRestuarantType
);

router.get("/type", authenticatedUser, getRestaurantTypes);

router.get("/type/:id", authenticatedUser, getRestaurantTypeById);

router.put(
  "/type/:id",
  authenticatedUser,
  validateRequest(updateRestaurantTypeValidationSchema),
  updateRestaurantType
);

router.delete("/type/:id", authenticatedUser, deleteRestaurantType);

// ==================== SERVICE TYPE ROUTES ====================
router.post(
  "/service-type",
  authenticatedUser,
  validateRequest(serviceTypeValidationSchema),
  saveServiceType
);

router.get("/service-type", authenticatedUser, getServiceTypes);

router.get("/service-type/:id", authenticatedUser, getServiceTypeById);

router.put(
  "/service-type/:id",
  authenticatedUser,
  validateRequest(updateServiceTypeValidationSchema),
  updateServiceType
);

router.delete("/service-type/:id", authenticatedUser, deleteServiceType);

// ==================== BUSINESS TYPE ROUTES ====================
router.post(
  "/business-type",
  authenticatedUser,
  validateRequest(businessTypeValidationSchema),
  saveBusinessType
);

router.get("/business-type", authenticatedUser, getBusinessTypes);

router.get("/business-type/:id", authenticatedUser, getBusinessTypeById);

router.put(
  "/business-type/:id",
  authenticatedUser,
  validateRequest(updateBusinessTypeValidationSchema),
  updateBusinessType
);

router.delete("/business-type/:id", authenticatedUser, deleteBusinessType);

// ==================== CUISINE ROUTES ====================
router.post(
  "/cuisine",
  authenticatedUser,
  validateRequest(cuisineValidationSchema),
  saveCuisine
);

router.get("/cuisine", authenticatedUser, getCuisines);

router.get("/cuisine/:id", authenticatedUser, getCuisineById);

router.put(
  "/cuisine/:id",
  authenticatedUser,
  validateRequest(updateCuisineValidationSchema),
  updateCuisine
);

router.delete("/cuisine/:id", authenticatedUser, deleteCuisine);

// ==================== DISH TYPE ROUTES ====================
router.post(
  "/dish-type",
  authenticatedUser,
  validateRequest(dishTypeValidationSchema),
  saveDishType
);

router.get("/dish-type", authenticatedUser, getDishTypes);

router.get("/dish-type/:id", authenticatedUser, getDishTypeById);

router.put(
  "/dish-type/:id",
  authenticatedUser,
  validateRequest(updateDishTypeValidationSchema),
  updateDishType
);

router.delete("/dish-type/:id", authenticatedUser, deleteDishType);

// ==================== DIET TYPE ROUTES ====================
router.post(
  "/diet-type",
  authenticatedUser,
  validateRequest(dietTypeValidationSchema),
  saveDietType
);

router.get("/diet-type", authenticatedUser, getDietTypes);

router.get("/diet-type/:id", authenticatedUser, getDietTypeById);

router.put(
  "/diet-type/:id",
  authenticatedUser,
  validateRequest(updateDietTypeValidationSchema),
  updateDietType
);

router.delete("/diet-type/:id", authenticatedUser, deleteDietType);

export default router;
