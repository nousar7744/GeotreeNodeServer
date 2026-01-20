import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  team1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  team2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  match_date: {
    type: Date,
    required: true
  },
  match_time: {
    type: String,
    required: false
  },
  venue: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  team1_trees: {
    type: Number,
    default: 0
  },
  team2_trees: {
    type: Number,
    default: 0
  },
  team1_dotball: {
    type: Number,
    default: 0
  },
  team2_dotball: {
    type: Number,
    default: 0
  },
  match_dot_balls: {
    type: Number,
    default: 0
  },
  winner_team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false
  }
}, { timestamps: true });

export default mongoose.model("Match", MatchSchema);
