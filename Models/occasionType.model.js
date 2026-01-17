import mongoose from "mongoose";

const OccasionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  occasion_image: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("OccasionType", OccasionTypeSchema);
