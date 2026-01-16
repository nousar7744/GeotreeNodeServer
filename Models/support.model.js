import mongoose from "mongoose";

const SupportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  support_type: {
    type: String,
    enum: ['team', 'match'],
    required: true
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false
  },
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: false
  },
  trees: {
    type: Number,
    required: true,
    default: 0
  },
  amount: {
    type: Number,
    required: false,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Support", SupportSchema);
