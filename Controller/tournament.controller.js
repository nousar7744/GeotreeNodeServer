// controllers/tournament.controller.js
import Tournament from "../Models/tournament.model.js";

export const addTournament = async (req, res) => {
  try {
    const { name, short_name, start_date, end_date, venue } = req.body;

    if (!name || !start_date) {
      return res.status(400).json({
        status: false,
        message: "name and start_date are required",
      });
    }

    const tournament = await Tournament.create({
      name,
      short_name,
      start_date,
      end_date,
      venue,
    });

    res.json({
      status: true,
      message: "Tournament created successfully",
      data: tournament,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json({
      status: true,
      message: "Tournaments fetched successfully",
      data: tournaments,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournamentIdFromParams = req.params.tournament_id;
    const tournamentIdFromBody = req.body.tournament_id;
    const tournament_id = tournamentIdFromParams || tournamentIdFromBody;
    const { tournament_id: _, ...updateData } = req.body;

    if (!tournament_id) {
      return res.status(400).json({
        status: false,
        message: "tournament_id is required",
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No fields to update",
      });
    }

    const tournament = await Tournament.findByIdAndUpdate(
      tournament_id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({
        status: false,
        message: "Tournament not found",
      });
    }

    return res.json({
      status: true,
      message: "Tournament updated successfully",
      data: tournament,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};



export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.tournament_id);
    if (!tournament) {
      return res.status(404).json({
        status: false,
        message: "Tournament not found",
      });
    }
    res.json({
      status: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
