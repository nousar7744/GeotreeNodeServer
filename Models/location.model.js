import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  location_name: {
    type: String,
    required: true
  },
  lat: {
    type: Number
  },
  lng: {
    type: Number
  }
}, { timestamps: true });

export default mongoose.model("Location", LocationSchema);

