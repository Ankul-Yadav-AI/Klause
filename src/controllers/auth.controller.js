import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { loadConfig } from "../config/loadConfig.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/helperFunctions.js";
import { emailTamplates } from "../utils/emailTemplate.js";
import { verify } from "crypto";

const secret = await loadConfig();

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    let refreshToken = user.refreshToken;
    try {
      jwt.verify(refreshToken, secret.REFRESH_TOKEN_SECRET);
    } catch (error) {
      refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
    }

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const signup = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userEmail = email.toLowerCase();

  const user = await User.findOne({ email: userEmail, isRegistered: true });

  if (user) {
    throw new ApiError(
      400,
      "Email is already registered. Please use a different email. Go to Login to proceed further."
    );
  }
  const otp = await generateOTP(6);
  console.log("Generated OTP:", otp);

  const emailTemplate = emailTamplates.signupOTP(otp);

  const emailResponse = await sendEmail({
    email: userEmail,
    subject: emailTemplate.subject,
    body: emailTemplate.body,
  });

  if (!emailResponse.success) {
    throw new ApiError(500, "FAILED_TO_SEND_OTP_EMAIL", req.lang);
  }

  // update the OTP and its expiry time in the database
  let existingUser = await User.findOne({
    email: userEmail,
    isRegistered: false,
  });
  if (existingUser) {
    existingUser.otp = otp;
    existingUser.otpExpiry = Date.now() + 10 * 60 * 1000;
    existingUser.isRegistered = false;
    existingUser.updatedAt = Date.now();
    existingUser.registrationStep = 1;
    await existingUser.save({ validateBeforeSave: false });
  } else {
    const newUser = new User({
      email: userEmail,
      otp: otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
      isRegistered: false,
      registrationStep: 1,
    });
    await newUser.save({ validateBeforeSave: false });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP_SENT_TO_EMAIL_SUCCESSFULLY", req.lang , { email: userEmail, nextStep: "VERIFY_OTP" }));
});

export { signup };
