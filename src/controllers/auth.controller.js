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
import { checkUsernameAvailability } from "../services/userAvailability.service.js";

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

  let nextStep = 2;

  const verifiedEmailUser = await User.findOne({
    email: userEmail,
    isEmailVerified: true,
    isRegistered: false,
  });
  if (!verifiedEmailUser) {
    const otp = await generateOTP(6);

    const emailTemplate = emailTamplates.signupOTP(otp);

    const emailResponse = await sendEmail({
      email: userEmail,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
    });

    if (!emailResponse.success) {
      throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
    }

    // update the OTP and its expiry time in the database
    let existingUser = await User.findOne({
      email: userEmail,
      isRegistered: false,
    });
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpire = Date.now() + 10 * 60 * 1000;
      existingUser.isRegistered = false;
      existingUser.updatedAt = Date.now();
      existingUser.registrationStep = 1;
      await existingUser.save({ validateBeforeSave: false });
    } else {
      const newUser = new User({
        email: userEmail,
        otp: otp,
        otpExpire: Date.now() + 10 * 60 * 1000,
        isRegistered: false,
        registrationStep: 1,
      });
      await newUser.save({ validateBeforeSave: false });
    }
  } else {
    nextStep = 3;
  }

  return res.status(200).json(
    new ApiResponse(200, "OTP_SENT_TO_EMAIL_SUCCESSFULLY", req.lang, {
      email: userEmail,
      nextStep: nextStep,
    })
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, EMAIL_AND_OTP_ARE_REQUIRED, req.lang);
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  if (user.otp != otp) {
    throw new ApiError(400, "INVALID_OTP", req.lang);
  }
  //  check if otp is expired

  if (new Date() > user.otpExpire) {
    throw new ApiError(400, "OTP_EXPIRED", req.lang);
  }

  user.otp = null;
  user.otpExpire = null;
  user.isEmailVerified = true;
  user.registrationStep = 2;
  await user.save();

  // generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res.status(200).json(
    new ApiResponse(200, "OTP_VERIFIED_SUCCESSFULLY", req.lang, {
      accessToken,
      refreshToken,
      nextStep: 3,
    })
  );
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "EMAIL_IS_REQUIRED", req.lang);
  }
  let user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  const otp = await generateOTP(6);
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  const emailTemplate = emailTamplates.signupOTP(otp);

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

const joinAs = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const user = req.user;
  if (!role) {
    throw new ApiError(400, "ROLE_IS_REQUIRED", req.lang);
  }
  if (!["owner", "manager", "guest"].includes(role)) {
    throw new ApiError(400, "INVALID_ROLE", req.lang);
  }

  user.role = role;
  user.registrationStep = 3;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "ROLE_JOINED_SUCCESSFULLY", req.lang, user));
});

const createCredential = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = req.user;

  user.username = username;
  user.password = password;
  user.registrationStep = 4;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "CREDENTIALS_CREATED_SUCCESSFULLY", req.lang, user)
    );
});

const usernameAvailability = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const isUsernameAvailable = await checkUsernameAvailability(username);
  return res.status(200).json(
    new ApiResponse(
      200,
      isUsernameAvailable
        ? "USERNAME_IS_AVAILABLE"
        : "USERNAME_IS_NOT_AVAILABLE",
      req.lang,
      {
        isAvailable: isUsernameAvailable,
      }
    )
  );
});

const saveOwnerDetails = asyncHandler(async (req, res) => {
  const {
    companyName,
    firstName,
    lastName,
    gender,
    country,
    descriptionOfCompany,
    phone,
    alternatePhone,
    mainAddressStreet,
    mainAddressNo,
    mainAddressPostCode,
    mainAddressCity,
    billingAddressStreet,
    billingAddressNo,
    billingAddressPostCode,
    billingAddressCity,
    VATId,
    CountryCode,
  } = req.body;

  const user = req.user;

  user.companyName = companyName;
  user.firstName = firstName;
  user.lastName = lastName;
  user.gender = gender;
  user.country = country;
  user.descriptionOfCompany = descriptionOfCompany;
  user.phone = phone;
  user.alternatePhone = alternatePhone;
  user.mainAddressStreet = mainAddressStreet;
  user.mainAddressNo = mainAddressNo;
  user.mainAddressPostCode = mainAddressPostCode;
  user.mainAddressCity = mainAddressCity;
  user.billingAddressStreet = billingAddressStreet;
  user.billingAddressNo = billingAddressNo;
  user.billingAddressPostCode = billingAddressPostCode;
  user.billingAddressCity = billingAddressCity;
  user.VATId = VATId;
  user.CountryCode = CountryCode;
  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "USER_DETAILS_SAVED_SUCCESSFULLY", req.lang, user));
});

export {
  signup,
  verifyOtp,
  resendOTP,
  joinAs,
  createCredential,
  usernameAvailability,
  saveOwnerDetails,
};
