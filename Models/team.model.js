import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: true,
    unique: true
  },
  team_logo: {
    type: String,
    required: false
  },
  team_full_name: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  team_color: {
    type: String,
    required: false
  },
  total_trees: {
    type: Number,
    default: 0
  },
  total_supporters: {
    type: Number,
    default: 0
  },
  total_dot_balls: {
    type: Number,
    default: 0
  },
  support_trees: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Team", TeamSchema);
