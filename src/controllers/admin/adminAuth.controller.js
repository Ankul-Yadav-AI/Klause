import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { loadConfig } from "../../config/loadConfig.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { generateOTP } from "../../utils/helperFunctions.js";
import { emailTamplates } from "../../utils/emailTemplate.js";
import Admin from "../../models/admin/admin.model.js";
import mongoose from "mongoose";

const secret = await loadConfig();

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "SOMETHING_WENT_WRONG_WHILE_GENERATING_REFRESH_AND_ACCESS_TOKEN",
      req.lang
    );
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check the user
  const user = await Admin.findOne({ email });

  if (!user) {
    throw new ApiError(404, "INVALID_ADMIN_CREDENTIALS", req.lang);
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(403, "INVALID_PASSWORD", req.lang);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "ADMIN_LOGGED_IN_SUCCESSFULLY", req.lang, {
        accessToken,
        refreshToken,
      })
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // check user
  const user = await Admin.findOne({ email });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  const otp = await generateOTP(6);
  const name = "Admin";

  const emailTemplate = emailTamplates.forgotPasswordOTP(name, otp);

  const emailResponse = await sendEmail({
    email: email,
    subject: emailTemplate.subject,
    body: emailTemplate.body,
  });

  if (!emailResponse.success) {
    throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  }

  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000;
  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "AN_OTP_HAS_BEEN_SEND_TO_YOUR_EMAIL", req.lang));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    throw new ApiError(404, "EMAIL_IS_REQUIRED", req.lang);
  }
  if (!otp) {
    throw new ApiError(404, "OTP_IS_REQUIRED", req.lang);
  }

  const userEmail = email.toLowerCase();

  const user = await Admin.findOne({ email: userEmail });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  if (!user.otp || String(user.otp) !== String(otp)) {
    throw new ApiError(400, "INVALID_OTP", req.lang);
  }

  if (!user.otpExpire || Date.now() > user.otpExpire) {
    throw new ApiError(400, "OTP_EXPIRED", req.lang);
  }

  user.otp = null;
  user.otpExpire = null;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP_VERIFIED_SUCCESSFULLY", req.lang));
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "EMAIL_IS_REQUIRED", req.lang);
  }
  let user = await Admin.findOne({ email: email });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  const otp = await generateOTP(6);
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  const name = "Admin";
  const emailTemplate = emailTamplates.forgotPasswordOTP(name, otp);

  const emailResponse = await sendEmail({
    email: email,
    subject: emailTemplate.subject,
    body: emailTemplate.body,
  });

  if (!emailResponse.success) {
    throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  }

  return res.status(200).json(
    new ApiResponse(200, "OTP_SENT_TO_EMAIL_SUCCESSFULLY", req.lang, {
      email,
    })
  );
});

const setPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Admin.findOne({ email });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  user.password = password;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "PASSWORD_UPDATED_SUCCESSFULLY", req.lang));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(404, "INVALID_TOKEN", req.lang);
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    secret.REFRESH_TOKEN_SECRET
  );

  const user = await Admin.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(404, "INVALID_REFRESH_TOKEN", req.lang);
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(404, "REFRESH_TOKEN_IS_EXPIRED_OR_USED", req.lang);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Access Token refreshed Successfully", req.lang, {
        accessToken,
        refreshToken,
      })
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await Admin.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "INVALID_PASSWORD", req.lang);
  }

  // prevent same password reuse
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "NEW_PASSWORD_CANNOT_BE_SAME_AS_OLD_PASSWORD",
      req.lang
    );
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "PASSWORD_UPDATED_SUCCESSFULLY", req.lang));
});

const getAdminProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "INVALID_ACCESS_TOKEN", req.lang);
  }

  const aggregation = [];

  aggregation.push({
    $match: {
      _id: new mongoose.Types.ObjectId(userId),
    },
  });

  aggregation.push({
    $project: {
      email: 1,
      _id: 1,
      name: 1,
      mobileNo: 1,
      address: 1,
    },
  });

  const user = await Admin.aggregate(aggregation);

  if (!user || user.length === 0) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "SUCCESS", req.lang, user[0]));
});

export {
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  setPassword,
  refreshAccessToken,
  changePassword,
  getAdminProfile,
};
