import mongoose from "mongoose";

const restaurantTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const restaurantType = mongoose.model("restaurantType", restaurantTypeSchema);

export default restaurantType;
