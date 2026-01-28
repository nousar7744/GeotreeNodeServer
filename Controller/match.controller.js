import mongoose from "mongoose";
import Match from "../Models/match.model.js";
import Team from "../Models/team.model.js";
import Support from "../Models/support.model.js";

const parseMatchDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    const slashMatch = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (slashMatch) {
      const [, year, month, day] = slashMatch;
      const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      return utcDate;
    }
  }
  const parsed = new Date(value);
  return parsed;
};

// API: Get match list
export const getMatchList = async (req, res) => {
  try {
    const basePopulate = (query) => Match.find(query)
      .populate('team1_id', 'team_name team_logo')
      .populate('team2_id', 'team_name team_logo')
      .populate('winner_team_id', 'team_name team_logo')
      .sort({ match_date: 1 });

    const [todayMatches, previousMatches, upcomingMatches] = await Promise.all([
      basePopulate({ status: 'live' }),
      basePopulate({ status: 'completed' }),
      basePopulate({ status: 'upcoming' })
    ]);



    return res.json({
      status: true,
      message: "Match list fetched",
      data: {
        today: todayMatches,
        previous: previousMatches,
        upcoming: upcomingMatches
      }
    });
  } catch (error) {
    console.error("Get Match List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add match
export const addMatch = async (req, res) => {
  try {
    const {
      team1_id,
      team2_id,
      match_date,
      match_time,
      venue,
      match_type,
      team1_dotball,
      team2_dotball,
    } = req.body;

    if (!team1_id || !team2_id || !match_date) {
      return res.status(400).json({
        status: false,
        message: "team1_id, team2_id, and match_date are required",
        data: {}
      });
    }
    const dotBallLimit = 40;
    const isInvalidDotBallValue = (value) =>
      value !== undefined && (Number.isNaN(Number(value)) || Number(value) >= dotBallLimit);
    if (isInvalidDotBallValue(team1_dotball) || isInvalidDotBallValue(team2_dotball)) {
      return res.status(400).json({
        status: false,
        message: `team1 dot ball and team2 dot ball must be numeric values less than ${dotBallLimit}`,
        data: {}
      });
    }



    // Check if teams exist
    const team1 = await Team.findById(team1_id);
    const team2 = await Team.findById(team2_id);
    console.log(team1, team2);
    if (!team1 || !team2) {
      return res.status(404).json({
        status: false,
        message: "One or both teams not found",
        data: {}
      });
    }

    // Map match_type to valid status enum values
    let status = 'upcoming'; // default
    if (match_type) {
      if (match_type === 'previous' || match_type === 'completed') {
        status = 'completed';
      } else if (match_type === 'today' || match_type === 'ongoing' || match_type === 'live') {
        status = 'live';
      } else if (match_type === 'upcoming' || match_type === 'future') {
        status = 'upcoming';
      } else {
        // If match_type is already a valid enum value, use it
        if (['upcoming', 'live', 'completed'].includes(match_type)) {
          status = match_type;
        }
      }
    }

    const isNonZeroDotBall = (value) =>
      value !== undefined && Number(value) !== 0;
    if (status === "upcoming" && (isNonZeroDotBall(team1_dotball) || isNonZeroDotBall(team2_dotball))) {
      return res.status(400).json({
        status: false,
        message: "dotball values must be 0 when match type is upcoming",
        data: {}
      });
    }

    const parsedMatchDate = parseMatchDate(match_date);
    if (!parsedMatchDate || Number.isNaN(parsedMatchDate.getTime())) {
      return res.status(400).json({
        status: false,
        message: "match_date is invalid",
        data: {}
      });
    }

    const match = await Match.create({
      team1_id,
      team2_id,
      match_date: parsedMatchDate,
      match_time: match_time || null,
      venue: venue || null,
      status: status,
      team1_dotball: team1_dotball !== undefined ? Number(team1_dotball) : 0,
      team2_dotball: team2_dotball !== undefined ? Number(team2_dotball) : 0,
      match_dot_balls: team2_dotball !== undefined && team1_dotball !== undefined ? Number(team2_dotball) + Number(team1_dotball) : 0
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('team1_id', 'team_name team_logo')
      .populate('team2_id', 'team_name team_logo');

    return res.json({
      status: true,
      message: "Match added successfully",
      data: populatedMatch
    });
  } catch (error) {
    console.error("Add Match Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Update match
export const updateMatch = async (req, res) => {
  console.log(req.body, 'req.body====>');
  try {
    const matchIdFromParams = req.params.match_id;
    const matchIdFromBody = req.body.match_id;
    const match_id = matchIdFromParams || matchIdFromBody;
    const {
      team1_id,
      team2_id,
      match_date,
      match_time,
      venue,
      match_type,
      status,
      team1_dotball,
      team2_dotball,
      match_dot_balls,
      winner_team_id
    } = req.body;

    if (!match_id) {
      return res.status(400).json({
        status: false,
        message: "match_id is required",
        data: {}
      });
    }
    if (!mongoose.Types.ObjectId.isValid(match_id)) {
      return res.status(400).json({
        status: false,
        message: "match_id is invalid",
        data: {}
      });
    }

    // If team ids are provided, validate they exist
    if (team1_id) {
      const team1 = await Team.findById(team1_id);
      if (!team1) {
        return res.status(404).json({
          status: false,
          message: "team1_id not found",
          data: {}
        });
      }
    }
    if (team2_id) {
      const team2 = await Team.findById(team2_id);
      if (!team2) {
        return res.status(404).json({
          status: false,
          message: "team2_id not found",
          data: {}
        });
      }
    }

    // Map match_type to valid status enum values if provided
    let nextStatus = status;
    if (match_type) {
      if (match_type === "previous" || match_type === "completed") {
        nextStatus = "completed";
      } else if (match_type === "today" || match_type === "ongoing" || match_type === "live") {
        nextStatus = "live";
      } else if (match_type === "upcoming" || match_type === "future") {
        nextStatus = "upcoming";
      } else if (["upcoming", "live", "completed"].includes(match_type)) {
        nextStatus = match_type;
      }
    }

    const updateData = {};
    if (team1_id) updateData.team1_id = team1_id;
    if (team2_id) updateData.team2_id = team2_id;
    if (match_date !== undefined) {
      const parsedUpdateDate = parseMatchDate(match_date);
      if (!parsedUpdateDate || Number.isNaN(parsedUpdateDate.getTime())) {
        return res.status(400).json({
          status: false,
          message: "match_date is invalid",
          data: {}
        });
      }
      updateData.match_date = parsedUpdateDate;
    }
    if (match_time !== undefined) updateData.match_time = match_time;
    if (venue !== undefined) updateData.venue = venue;
    if (nextStatus !== undefined) updateData.status = nextStatus;
    const dotBallLimit = 20;
    const isInvalidDotBallValue = (value) =>
      value !== undefined && (Number.isNaN(Number(value)) || Number(value) >= dotBallLimit);
    if (isInvalidDotBallValue(team1_dotball) || isInvalidDotBallValue(team2_dotball)) {
      return res.status(400).json({
        status: false,
        message: `team1_dotball and team2_dotball must be numeric values less than ${dotBallLimit}`,
        data: {}
      });
    }
    const isNonZeroDotBall = (value) =>
      value !== undefined && Number(value) !== 0;
    if (
      nextStatus === "upcoming" &&
      (isNonZeroDotBall(team1_dotball) ||
        isNonZeroDotBall(team2_dotball) ||
        isNonZeroDotBall(match_dot_balls))
    ) {
      return res.status(400).json({
        status: false,
        message: "dotball values must be 0 when match type is upcoming",
        data: {}
      });
    }
    if (team1_dotball !== undefined) updateData.team1_dotball = Number(team1_dotball);
    if (team2_dotball !== undefined) updateData.team2_dotball = Number(team2_dotball);
    if (match_dot_balls !== undefined) updateData.match_dot_balls = Number(match_dot_balls);
    if (winner_team_id !== undefined) updateData.winner_team_id = winner_team_id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No fields to update",
        data: {}
      });
    }

    const match = await Match.findByIdAndUpdate(match_id, updateData, {
      new: true,
      runValidators: true
    })
      .populate("team1_id", "team_name team_logo")
      .populate("team2_id", "team_name team_logo")
      .populate("winner_team_id", "team_name team_logo");

    if (!match) {
      return res.status(404).json({
        status: false,
        message: "Match not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Match updated successfully",
      data: match
    });
  } catch (error) {
    console.error("Update Match Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Get match details
export const getMatchDetails = async (req, res) => {
  try {
    const { match_id } = req.body;

    if (!match_id) {
      return res.status(400).json({
        status: false,
        message: "match_id is required",
        data: {}
      });
    }

    const match = await Match.findById(match_id)
      .populate('team1_id', 'team_name team_logo')
      .populate('team2_id', 'team_name team_logo')
      .populate('winner_team_id', 'team_name team_logo');

    if (!match) {
      return res.status(404).json({
        status: false,
        message: "Match not found",
        data: {}
      });
    }

    // Get support stats for this match
    const team1Supports = await Support.find({ match_id, team_id: match.team1_id });
    const team2Supports = await Support.find({ match_id, team_id: match.team2_id });

    return res.json({
      status: true,
      message: "Match details fetched",
      data: {
        match,
        stats: {
          team1_supports: team1Supports.length,
          team2_supports: team2Supports.length,
          team1_total_trees: team1Supports.reduce((sum, s) => sum - (s.trees || 0), 0),
          team2_total_trees: team2Supports.reduce((sum, s) => sum - (s.trees || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error("Get Match Details Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Support trees for match
export const supportTrees = async (req, res) => {
  try {
    const { user_id, match_id, dot_ball, amount, team_id } = req.body;

    if (!user_id || !match_id || !dot_ball) {
      return res.status(400).json({
        status: false,
        message: "user_id, match_id, and dot_ball are required",
        data: {}
      });
    }

    // Check if match exists
    const match = await Match.findById(match_id);
    if (!match) {
      return res.status(404).json({
        status: false,
        message: "Match not found",
        data: {}
      });
    }

    // Validate team_id is one of the match teams
    // if (team_id) {
    //   if (match.team1_id.toString() !== team_id && match.team2_id.toString() !== team_id) {
    //     return res.status(400).json({
    //       status: false,
    //       message: "team_id must be one of the match teams",
    //       data: {}
    //     });
    //   }
    // }

    const team1Trees = match.team1_dotball || 0;
    const team2Trees = match.team2_dotball || 0;

    const largerTeam =
      team1Trees > team2Trees ? "team1" :
        team2Trees > team1Trees ? "team2" : "equal";

    const smallerTeam =
      team1Trees < team2Trees ? "team1" :
        team2Trees < team1Trees ? "team2" : "equal";
    console.log(team_id, 'team_id====>');

    let teamIdUsed = null;
    if (team_id) {
      teamIdUsed = team_id;
    } else {
      teamIdUsed = largerTeam === "team1" ? match.team1_id.toString() : match.team2_id.toString();
    }
    // Create support record
    console.log(teamIdUsed, 'teamIdUsed====>');
    const support = await Support.create({
      user_id,
      support_type: 'match',
      match_id,
      team_id: teamIdUsed,
      trees: Number(dot_ball),
      amount: amount ? Number(amount) : 0
    });

    // Update match trees count and reduce dot balls
    const incUpdate = {
      match_dot_balls: -Number(dot_ball)
    };
    if (teamIdUsed === match.team1_id.toString()) {
      incUpdate.team1_dotball = -Number(dot_ball);
    } else if (teamIdUsed === match.team2_id.toString()) {
      incUpdate.team2_dotball = -Number(dot_ball);
    }

    await Match.findByIdAndUpdate(match_id, { $inc: incUpdate });
    console.log(incUpdate, 'incUpdate====>');

    return res.json({
      status: true,
      message: "Tree support added successfully",
      data: support
    });
  } catch (error) {
    console.error("Support Trees Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Dot ball history by user (match supports)
export const getDotBallHistory = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }
   //team and match support_type
  const history = await Support.find({user_id,support_type: { $in: ["team", "match"] },})
.populate({
    path: "match_id",
    select: "match_date match_time venue status match_dot_balls",
    populate: [
      { path: "team1_id", select: "team_name team_logo" },
      { path: "team2_id", select: "team_name team_logo" },
    ],
  })
  .populate("team_id", "team_name team_logo")
  .sort({ createdAt: -1 });

    return res.json({
      status: true,
      message: "Dot ball history fetched",
      data: history
    });
  } catch (error) {
    console.error("Get Dot Ball History Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};
