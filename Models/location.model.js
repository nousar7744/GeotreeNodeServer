import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  location_name: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Location", LocationSchema);

