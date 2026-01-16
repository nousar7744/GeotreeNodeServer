import mongoose from "mongoose";

const CarbonSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  home_type: String,
  transport_type: String,
  electricity_type: String,
  food_type: String,
  carbon_result: Number
}, { timestamps: true });

export default mongoose.model("Carbon", CarbonSchema);

