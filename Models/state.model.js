import mongoose from "mongoose";

const StateSchema = new mongoose.Schema({
  state_name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  state_image: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("State", StateSchema);

