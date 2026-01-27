import { Router } from "express";
import {
  login,
  forgotPassword,
  setPassword,
  refreshAccessToken,
  verifyOTP,
  resendOTP,
  changePassword,
  getAdminProfile,
} from "../../controllers/admin/adminAuth.controller.js";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import {
  userValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
} from "../../validators/userValidator.js";
import { authenticatedUser } from "../../middlewares/adminAuth.middleware.js";

const router = Router();

router.post("/login", validateRequest(loginValidationSchema), login);
router.post(
  "/forgot-password",
  validateRequest(userValidationSchema),
  forgotPassword
);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post(
  "/set-password",
  validateRequest(loginValidationSchema),
  setPassword
);
router.post("/refresh-token", refreshAccessToken);
router.post(
  "/change-password",
  authenticatedUser,
  validateRequest(changePasswordValidationSchema),
  changePassword
);
router.get("/profile",authenticatedUser,getAdminProfile);

export default router;
