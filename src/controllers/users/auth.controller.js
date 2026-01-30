import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { loadConfig } from "../../config/loadConfig.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { generateOTP } from "../../utils/helperFunctions.js";
import { emailTamplates } from "../../utils/emailTemplate.js";
import { checkUsernameAvailability } from "../../services/userAvailability.service.js";
import mongoose from "mongoose";
import { deleteObject } from "../../utils/s3.utils.js";

const secret = await loadConfig();

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
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

const signup = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userEmail = email.toLowerCase();

  const registeredUser = await User.findOne({
    email: userEmail,
    isRegistered: true,
  });

  if (registeredUser) {
    throw new ApiError(
      400,
      "EMAIL_IS_ALREADY_REGISTERED_PLEASE_USE_A_DIFFERENT_EMAIL_GO_TO_LOGIN_TO_PROCEED_FURTHER",
      req.lang
    );
  }

  let user = await User.findOne({
    email: userEmail,
    isRegistered: false,
  });

  if (user && user.otpExpire && user.otpExpire > Date.now()) {
    throw new ApiError(
      400,
      "AN_OTP_IS_ALREADY_SHARED_ON_YOUR_EMAIL_KINDLY_TRY_AFTER_SOME_TIME",
      req.lang
    );
  }

  const otp = "123456";
  // const otp = await generateOTP(6);
  // const emailTemplate = emailTamplates.signupOTP(otp);

  // const emailResponse = await sendEmail({
  //   email: userEmail,
  //   subject: emailTemplate.subject,
  //   body: emailTemplate.body,
  // });

  // if (!emailResponse.success) {
  //   throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  // }

  const otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins

  if (user) {
    user.otp = otp;
    user.otpExpire = otpExpire;
    user.registrationStep = 1;
    user.updatedAt = Date.now();
    await user.save({ validateBeforeSave: false });
  } else {
    await User.create({
      email: userEmail,
      otp,
      otpExpire,
      isRegistered: false,
      registrationStep: 1,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, "OTP_SENT_TO_EMAIL_SUCCESSFULLY", req.lang, {
      email: userEmail,
      nextStep: 2,
    })
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, type } = req.body;

  if (!email || !otp || !type) {
    if (!email) {
      throw new ApiError(400, "EMAIL_IS_REQUIRED", req.lang);
    } else if (!otp) {
      throw new ApiError(400, "OTP_IS_REQUIRED", req.lang);
    } else if (!type) {
      throw new ApiError(400, "TYPE_IS_REQUIRED", req.lang);
    } else {
      throw new ApiError(400, "EMAIL_OTP_AND_TYPE_ARE_REQUIRED", req.lang);
    }
  }

  if (!["sign-up", "forgot-password"].includes(type)) {
    throw new ApiError(400, "INVALID_OTP_VERIFICATION_TYPE", req.lang);
  }

  const userEmail = email.toLowerCase();

  const user = await User.findOne({ email: userEmail });

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

  if (type === "sign-up") {
    user.isEmailVerified = true;
    user.registrationStep = 2;

    await user.save({ validateBeforeSave: false });

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
  }

  if (type === "forgot-password") {
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, "OTP_VERIFIED_SUCCESSFULLY", req.lang));
  }
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

  // const otp = await generateOTP(6);
  const otp = "123456";
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // if (user.isRegistered) {
  //   const emailTemplate = emailTamplates.signupOTP(otp);

  //   const emailResponse = await sendEmail({
  //     email: email,
  //     subject: emailTemplate.subject,
  //     body: emailTemplate.body,
  //   });
  //   if (!emailResponse.success) {
  //     throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  //   }
  // } else {
  //   const name =
  //     [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  //   const emailTemplate = emailTamplates.forgotPasswordOTP(name, otp);

  //   const emailResponse = await sendEmail({
  //     email: email,
  //     subject: emailTemplate.subject,
  //     body: emailTemplate.body,
  //   });

  //   if (!emailResponse.success) {
  //     throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  //   }
  // }

  return res.status(200).json(
    new ApiResponse(200, "OTP_SENT_TO_EMAIL_SUCCESSFULLY", req.lang, {
      email,
    })
  );
});

const joinAs = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) {
    throw new ApiError(400, "ROLE_IS_REQUIRED", req.lang);
  }
  if (!["owner", "manager", "guest"].includes(role)) {
    throw new ApiError(400, "INVALID_ROLE", req.lang);
  }
  const registrationStep = 3;
  const user = await User.findById(req.user._id);
  user.role = role;
  user.registrationStep = registrationStep;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "ROLE_JOINED_SUCCESSFULLY", req.lang, {
      role,
      registrationStep,
    })
  );
});

const createCredential = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const registrationStep = 4;

  const user = await User.findById(req.user._id);
  user.username = username;
  user.password = password;
  user.registrationStep = registrationStep;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "CREDENTIALS_CREATED_SUCCESSFULLY", req.lang, {
      username,
      registrationStep,
    })
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

  const user = await User.findById(req.user._id);

  user.companyName = companyName;
  user.firstName = firstName;
  user.lastName = lastName;
  user.gender = gender;
  user.country = country;
  user.companyDescription = descriptionOfCompany;
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
  user.registrationStep = 5;
  user.isRegistered = true;
  user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "USER_DETAILS_SAVED_SUCCESSFULLY", req.lang, user)
    );
});

const savenickName = asyncHandler(async (req, res) => {
  const { nickName } = req.body;
  const user = await User.findById(req.user._id);
  user.nickName = nickName;
  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "NICKNAME_SAVED_SUCESSFULLY", req.lang, user));
});

const saveUserDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, gender, country } = req.body;
  const user = await User.findById(req.user._id);

  user.firstName = firstName;
  user.lastName = lastName;
  user.gender = gender;
  user.phone = phone;
  user.country = country;
  user.isRegistered = true;
  user.registrationStep = 5;
  user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "PERSONAL_DETAILS_SAVED_SUCCESSFULLY",
        req.lang,
        user
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check the user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }
  if (!user.isRegistered) {
    throw new ApiError(
      403,
      "USER_NOT_COMPLETED_THE_REGISTRATION_PROCESS",
      req.lang
    );
  }
  if (user.isDeleted) {
    // Your account has been deleted. Please contact support for more information.
    throw new ApiError(400, "YOUR_ACCOUNT_HAS_BEEN_DELETED", req.lang);
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
      new ApiResponse(200, "USER_LOGGED_IN_SUCCESSFULLY", req.lang, {
        accessToken,
        refreshToken,
      })
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // check user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }
  if (!user.isRegistered) {
    throw new ApiError(
      403,
      "USER_NOT_COMPLETED_THE_REGISTRATION_PROCESS",
      req.lang
    );
  }

  const otp = "123456";
  // const otp = await generateOTP(6);
  // const name =
  //   [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  // const emailTemplate = emailTamplates.forgotPasswordOTP(name, otp);

  // const emailResponse = await sendEmail({
  //   email: email,
  //   subject: emailTemplate.subject,
  //   body: emailTemplate.body,
  // });

  // if (!emailResponse.success) {
  //   throw new ApiError(500, "FAILED_TO_SEND_OTP_TO_EMAIL", req.lang);
  // }

  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000;
  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "AN_OTP_HAS_BEEN_SEND_TO_YOUR_EMAIL", req.lang));
});

const setPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  user.password = password;
  user.save();

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

  const user = await User.findById(decodedToken?._id);
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

  const user = await User.findById(req.user._id);

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

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "INVALID_ACCESS_TOKEN", req.lang);
  }

  const aggregation = [];

  aggregation.push({
    $match: {
      _id: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    },
  });

  aggregation.push({
    $project: {
      _id: 1,
      email: 1,
      isEmailVerified: 1,
      role: 1,
      username: 1,
      CountryCode: 1,
      VATId: 1,
      alternatePhone: 1,
      billingAddressCity: 1,
      billingAddressNo: 1,
      billingAddressPostCode: 1,
      billingAddressStreet: 1,
      companyDescription: 1,
      companyName: 1,
      country: 1,
      firstName: 1,
      gender: 1,
      lastName: 1,
      mainAddressCity: 1,
      mainAddressNo: 1,
      mainAddressPostCode: 1,
      mainAddressStreet: 1,
      phone: 1,
      nickName: 1,
    },
  });

  const user = await User.aggregate(aggregation);

  if (!user || user.length === 0) {
    throw new ApiError(404, "USER_NOT_FOUND", req.lang);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "SUCCESS", req.lang, user[0]));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "INVALID_ACCESS_TOKEN", req.lang);
  }
  const user = await User.findById(userId).select(
    "_id email firstName lastName profileImage"
  );

  if (req.file && user.profileImage) {
    try {
      await deleteObject(user.profileImage);
    } catch (error) {
      console.warn("Failed to delete old profile image:", error.message);
    }
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.profileImage = req.file ? req.file.location : user.profileImage;
  user.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, "USER_DETAILS_UPDATED_SUCCESSFULLY", req.lang, user)
    );
});

export {
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
  updateUserProfile,
};
