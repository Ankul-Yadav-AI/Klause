import { Router } from "express";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import { authenticatedUser } from "../../middlewares/auth.middleware.js";
import { getBusinessTypes, getCuisines, getDietTypes, getDishTypes, getRestaurantTypes, getServiceTypes } from "../../controllers/users/restaurant.controller.js";
// import { checkVersion } from "../middlewares/checkVersion.js";

const router = Router();

router.get('/type',authenticatedUser,getRestaurantTypes);
router.get('/service-type',authenticatedUser,getServiceTypes);
router.get('/business-type',authenticatedUser,getBusinessTypes);
router.get('/cuisine',authenticatedUser,getCuisines);
router.get('/dish-type',authenticatedUser,getDishTypes);
router.get('/diet-type',authenticatedUser,getDietTypes);


export default router;
