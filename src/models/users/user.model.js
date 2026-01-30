import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { loadConfig } from "../../config/loadConfig.js";
const secret = await loadConfig();

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpire: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "guest"],
      default: "guest",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    username: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      default: undefined,
    },

    password: {
      type: String,
    },

    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    country: { type: String, trim: true },

    companyName: { type: String, trim: true },
    companyDescription: { type: String, trim: true },

    phone: { type: String, trim: true, unique: true },
    alternatePhone: { type: String, trim: true, unique: true },

    mainAddressStreet: { type: String, trim: true },
    mainAddressNo: { type: String, trim: true },
    mainAddressPostCode: { type: String, trim: true },
    mainAddressCity: { type: String, trim: true },

    billingAddressStreet: { type: String, trim: true },
    billingAddressNo: { type: String, trim: true },
    billingAddressPostCode: { type: String, trim: true },
    billingAddressCity: { type: String, trim: true },

    VATId: { type: String, trim: true },
    CountryCode: { type: String, trim: true },
    nickName: { type: String, trim: true },
    profileImage: { type: String, trim: true },

    registrationStep: {
      type: Number,
      default: 1,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    secret.ACCESS_TOKEN_SECRET,
    { expiresIn: secret.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, secret.REFRESH_TOKEN_SECRET, {
    expiresIn: secret.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", userSchema);
