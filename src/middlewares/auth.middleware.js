import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { loadConfig } from "../config/loadConfig.js";

const secret = await loadConfig();

export const authenticatedUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "INVALID_ACCESS_TOKEN", req.lang);
    }

    const decodedToken = jwt.verify(token, secret.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "USER_NOT_FOUND", req.lang);
    }

    if (user.isDeleted) {
      throw new ApiError(
        403,
        "USER_IS_DEACTIVATED",
        req.lang
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "TOKEN_EXPIRED", req.lang);
    }
    throw new ApiError(401, error?.message || "INVALID_TOKEN", req.lang);
  }
});
