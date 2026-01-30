import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loadConfig } from "../config/loadConfig.js";

const secret = await loadConfig();

export const authenticatedUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "INVALID_ACCESS_TOKEN", req.lang);
    }

    const decodedToken = jwt.verify(token, secret.ACCESS_TOKEN_SECRET_ADMIN);

    req.user = {
      _id: decodedToken._id,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "TOKEN_EXPIRED", req.lang);
    }
    throw new ApiError(401, error?.message || "INVALID_TOKEN", req.lang);
  }
});
