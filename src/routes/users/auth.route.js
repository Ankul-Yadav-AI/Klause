import { Router } from "express";
import {
  signup,
  verifyOtp,
  resendOTP,
  joinAs,
  createCredential,
  usernameAvailability,
  saveOwnerDetails,
  savenickName,
  saveUserDetails,
  login,
  forgotPassword,
  setPassword,
  refreshAccessToken,
  changePassword,
  getProfile,
} from "../../controllers/users/auth.controller.js";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import {
  createCredentialsValidationSchema,
  nickNameSchema,
  ownerDetailsSchema,
  userDetailsSchema,
  userValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
} from "../../validators/userValidator.js";
import { authenticatedUser } from "../../middlewares/auth.middleware.js";
// import { checkVersion } from "../middlewares/checkVersion.js";

const router = Router();

router.post("/signup", validateRequest(userValidationSchema), signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOTP);
router.post("/joinAs", authenticatedUser, joinAs);
router.post(
  "/create-credientials",
  authenticatedUser,
  validateRequest(createCredentialsValidationSchema),
  createCredential
);
router.get(
  "/username-availability/:username",
  authenticatedUser,
  usernameAvailability
);
router.post(
  "/save-owner-details",
  authenticatedUser,
  validateRequest(ownerDetailsSchema),
  saveOwnerDetails
);
router.post(
  "/set-nickName",
  authenticatedUser,
  validateRequest(nickNameSchema),
  savenickName
);
router.post(
  "/save-personal-details",
  authenticatedUser,
  validateRequest(userDetailsSchema),
  saveUserDetails
);
router.post("/login", validateRequest(loginValidationSchema), login);
router.post(
  "/forgot-password",
  validateRequest(userValidationSchema),
  forgotPassword
);
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
router.get("/profile",authenticatedUser,getProfile);

export default router;
