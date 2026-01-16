import mongoose from "mongoose";

// Common schema for all carbon types
const carbonTypeSchema = {
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    required: true
  }
};

// Home Type Schema
const HomeTypeSchema = new mongoose.Schema(carbonTypeSchema, { timestamps: true });

// Transport Type Schema
const TransportTypeSchema = new mongoose.Schema(carbonTypeSchema, { timestamps: true });

// Electricity Type Schema
const ElectricityTypeSchema = new mongoose.Schema(carbonTypeSchema, { timestamps: true });

// Food Type Schema
const FoodTypeSchema = new mongoose.Schema(carbonTypeSchema, { timestamps: true });

// Export all models
export const HomeType = mongoose.model("HomeType", HomeTypeSchema);
export const TransportType = mongoose.model("TransportType", TransportTypeSchema);
export const ElectricityType = mongoose.model("ElectricityType", ElectricityTypeSchema);
export const FoodType = mongoose.model("FoodType", FoodTypeSchema);

// Default export (for backward compatibility)
export default {
  HomeType,
  TransportType,
  ElectricityType,
  FoodType
};
