import Match from "../Models/match.model.js";
import Team from "../Models/team.model.js";
import Support from "../Models/support.model.js";

// API: Get match list
export const getMatchList = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const basePopulate = (query) => Match.find(query)
      .populate('team1_id', 'team_name team_logo')
      .populate('team2_id', 'team_name team_logo')
      .populate('winner_team_id', 'team_name team_logo')
      .sort({ match_date: 1 });

    const [todayMatches, previousMatches, upcomingMatches] = await Promise.all([
      basePopulate({
        $or: [
          { status: 'live' },
          { match_date: { $gte: today, $lt: tomorrow } }
        ]
      }),
      basePopulate({ match_date: { $lt: today }, status: 'completed' }),
      basePopulate({ match_date: { $gte: tomorrow }, status: 'upcoming' })
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
    const { team1_id, team2_id, match_date, match_time, venue,match_type} = req.body;
    
    if (!team1_id || !team2_id || !match_date) {
      return res.status(400).json({
        status: false,
        message: "team1_id, team2_id, and match_date are required",
        data: {}
      });
    }

    // Check if teams exist
    const team1 = await Team.findById(team1_id);
    const team2 = await Team.findById(team2_id);
    
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

    const match = await Match.create({
      team1_id,
      team2_id,
      match_date: new Date(match_date),
      match_time: match_time || null,
      venue: venue || null,
      status: status,
      team1_trees: 0,
      team2_trees: 0
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
          team1_total_trees: team1Supports.reduce((sum, s) => sum + (s.trees || 0), 0),
          team2_total_trees: team2Supports.reduce((sum, s) => sum + (s.trees || 0), 0)
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
    const { user_id, match_id, trees, amount, team_id } = req.body;
    
    if (!user_id || !match_id || !trees) {
      return res.status(400).json({
        status: false,
        message: "user_id, match_id, and trees are required",
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
    if (team_id) {
      if (match.team1_id.toString() !== team_id && match.team2_id.toString() !== team_id) {
        return res.status(400).json({
          status: false,
          message: "team_id must be one of the match teams",
          data: {}
        });
      }
    }

    // Create support record
    const support = await Support.create({
      user_id,
      support_type: 'match',
      match_id,
      team_id: team_id || match.team1_id,
      trees: Number(trees),
      amount: amount ? Number(amount) : 0
    });

    // Update match trees count
    if (team_id === match.team1_id.toString()) {
      await Match.findByIdAndUpdate(match_id, {
        $inc: { team1_trees: Number(trees) }
      });
    } else if (team_id === match.team2_id.toString()) {
      await Match.findByIdAndUpdate(match_id, {
        $inc: { team2_trees: Number(trees) }
      });
    }

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
