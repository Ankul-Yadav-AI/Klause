import { Router } from "express";
import {
  signup,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  // loginValidationSchema,
  userValidationSchema,
} from "../validators/userValidator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { checkVersion } from "../middlewares/checkVersion.js";


const router = Router();

router.route("/signup").post(validateRequest(userValidationSchema), signup);

export default router;
