// models/Tournament.js
import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },           // IPL 2026
    short_name: { type: String },                      // IPL
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    venue: { type: String },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);
