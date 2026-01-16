import mongoose from "mongoose";

const OccasionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  occasion_type: String
}, { timestamps: true });

export default mongoose.model("Occasion", OccasionSchema);

