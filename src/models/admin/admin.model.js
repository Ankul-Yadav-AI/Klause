import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loadConfig } from "../../config/loadConfig.js";

const secret = await loadConfig();

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    default: "admin@gmail.com",
    unique: true,
  },
  name: {
    type: String,
    default: "Admin",
  },
  mobileNo: { type: String, default: null },
  address: { type: String, default: null },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpire: { type: Date },
  refreshToken: { type: String },
});

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    secret.ACCESS_TOKEN_SECRET,
    { expiresIn: secret.ACCESS_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, secret.REFRESH_TOKEN_SECRET, {
    expiresIn: secret.REFRESH_TOKEN_EXPIRY,
  });
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
