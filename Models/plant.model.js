import mongoose from "mongoose";

const PlantSchema = new mongoose.Schema({
  plant_name: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Plant", PlantSchema);

