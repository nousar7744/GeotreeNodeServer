import mongoose from "mongoose";

const PlantationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  trees_count: Number,
  plants: [{
    plant_name: String,
    quantity: Number
  }],
  name: String,
  date: Date,
  message: String,
  location: String
}, { timestamps: true });

export default mongoose.model("Plantation", PlantationSchema);

