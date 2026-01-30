import { Router } from "express";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import { authenticatedUser } from "../../middlewares/auth.middleware.js";
import { getRestaurantTypes } from "../../controllers/users/restaurant.controller.js";
// import { checkVersion } from "../middlewares/checkVersion.js";

const router = Router();

router.get('/type',authenticatedUser,getRestaurantTypes);


export default router;
