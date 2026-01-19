import mongoose from "mongoose";
import Team from "../Models/team.model.js";
import Support from "../Models/support.model.js";
import Match from "../Models/match.model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for team logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/team');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `team-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Multer middleware for team logo - accepts any field name
export const uploadTeamLogoMiddleware = upload.any();

// API: Get team list
export const getTeamList = async (req, res) => {
  try {
    const teams = await Team.find().sort({ team_name: 1 });
    return res.json({
      status: true,
      message: "Team list fetched",
      data: teams
    });
  } catch (error) {
    console.error("Get Team List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add team
export const addTeam = async (req, res) => {
  try {
    const {
      team_name,
      description,
      team_color,
      team_full_name,
      total_trees,
      total_supporters,
      support_trees,
      supportTrees
    } = req.body;
    const totalDotBalls = req.body.total_dot_balls;
    
    if (!team_name) {
      return res.status(400).json({
        status: false,
        message: "team_name is required",
        data: {}
      });
    }

    const teamData = {
      team_name,
      team_full_name: team_full_name || null,
      description: description || null,
      team_color: team_color || null,
      total_trees: total_trees !== undefined ? Number(total_trees) : 0,
      total_supporters: total_supporters !== undefined ? Number(total_supporters) : 0,
      support_trees: support_trees !== undefined
        ? Number(support_trees)
        : supportTrees !== undefined
          ? Number(supportTrees)
          : 0
    };

    // Add team logo if file was uploaded (handle both req.file and req.files)
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (uploadedFile) {
      teamData.team_logo = `/uploads/team/${uploadedFile.filename}`;
    }

    const team = await Team.create(teamData);
    
    return res.json({
      status: true,
      message: "Team added successfully",
      data: team
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Team already exists",
        data: {}
      });
    }
    console.error("Add Team Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Team preplant support
export const teamPreplantSupport = async (req, res) => {
  try {
    const { team_id, user_id, tree } = req.body;
    
    if (!team_id || !user_id || !tree) {
      return res.status(400).json({
        status: false,
        message: "team_id, user_id, and tree are required",
        data: {}
      });
    }

    // Check if team exists
    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
        data: {}
      });
    }

    // Create support record
    const support = await Support.create({
      user_id,
      support_type: 'team',
      team_id,
      trees: Number(tree),
      amount: 0
    });

    // Update team total trees
    await Team.findByIdAndUpdate(team_id, {
      $inc: { total_trees: Number(tree), total_supporters: 1 }
    });

    return res.json({
      status: true,
      message: "Team support added successfully",
      data: support
    });
  } catch (error) {
    console.error("Team Preplant Support Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Get team details
export const getTeamDetails = async (req, res) => {
  try {
    const { team_id } = req.body;
    
    if (!team_id) {
      return res.status(400).json({
        status: false,
        message: "team_id is required",
        data: {}
      });
    }

    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
        data: {}
      });
    }

    // Get total supports for this team
    const totalSupports = await Support.countDocuments({ team_id, support_type: 'team' });

    return res.json({
      status: true,
      message: "Team details fetched",
      data: {
        ...team.toObject(),
        total_supports: totalSupports
      }
    });
  } catch (error) {
    console.error("Get Team Details Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Update team
export const updateTeam = async (req, res) => {
  try {
    console.log("Request:", req);
    console.log("Request Params:", req.params);
    console.log("Request Query:", req.query);
    const paramTeamId = req.params.team_id;
    const queryTeamId = req.query.team_id;
    const rawTeamId = paramTeamId && paramTeamId !== ":" ? paramTeamId : queryTeamId;
    console.log("Raw Team ID:", rawTeamId);
    console.log("Request Body:", req.body);
    const {
      team_name,
      description,
      team_color,
      team_full_name,
      total_trees,
      total_supporters,
      total_dot_balls
    } = req.body;
    const team_id = typeof rawTeamId === "string" && rawTeamId.startsWith("team_id=")
      ? rawTeamId.slice("team_id=".length)
      : rawTeamId;

    if (!team_id) {
      return res.status(400).json({
        status: false,
        message: "team_id is required",
        data: {}
      });
    }
    if (!mongoose.Types.ObjectId.isValid(team_id)) {
      return res.status(400).json({
        status: false,
        message: "team_id is invalid",
        data: {}
      });
    }

    const updateData = {};
    if (team_name) {
      updateData.team_name = team_name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (team_color !== undefined) {
      updateData.team_color = team_color;
    }
    if (team_full_name !== undefined) {
      updateData.team_full_name = team_full_name;
    }
    if (total_trees !== undefined) {
      updateData.total_trees = Number(total_trees);
    }
    if (total_supporters !== undefined) {
      updateData.total_supporters = Number(total_supporters);
    }
    if (req.body.support_trees !== undefined) {
      updateData.support_trees = Number(req.body.support_trees);
    } else if (req.body.supportTrees !== undefined) {
      updateData.support_trees = Number(req.body.supportTrees);
    }
    if (total_dot_balls !== undefined) {
      updateData.total_dot_balls = Number(total_dot_balls);
    }

    const team = await Team.findByIdAndUpdate(
      team_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
        data: {}
      });
    }
    
    return res.json({
      status: true,
      message: "Team updated successfully",
      data: team
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Team name already exists",
        data: {}
      });
    }
    console.error("Update Team Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Upload/Update team image
export const uploadTeamImage = async (req, res) => {
  try {
    const { team_id } = req.body;
    
    // Handle both req.file and req.files (from upload.any())
    const uploadedFile = req.file || (req.files && req.files[0]);
    
    if (!team_id) {
      // Delete uploaded file if team_id is missing
      if (uploadedFile) {
        const filePath = path.join(__dirname, '../uploads/team', uploadedFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        status: false,
        message: "team_id is required",
        data: {}
      });
    }

    if (!uploadedFile) {
      return res.status(400).json({
        status: false,
        message: "Team image is required. Please upload a file with field name: team_logo, team_image, image, logo, or file",
        data: {}
      });
    }

    // Find team
    const team = await Team.findById(team_id);
    
    if (!team) {
      // Delete uploaded file if team not found
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/team', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        status: false,
        message: "Team not found",
        data: {}
      });
    }

    // Delete old image if exists
    if (team.team_logo) {
      const oldImagePath = path.join(__dirname, '..', team.team_logo);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update team with new image path
    const imagePath = `/uploads/team/${uploadedFile.filename}`;
    const updatedTeam = await Team.findByIdAndUpdate(
      team_id,
      { team_logo: imagePath },
      { new: true, select: '-__v' }
    );

    return res.json({
      status: true,
      message: "Team image uploaded successfully",
      data: {
        team: updatedTeam,
        image_url: imagePath
      }
    });
  } catch (error) {
    // Delete uploaded file on server error
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (uploadedFile) {
      const filePath = path.join(__dirname, '../uploads/team', uploadedFile.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error("Upload Team Image Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Server error",
      data: {}
    });
  }
};

// API: Team challenge (Whole Tournament)
export const teamChallenge = async (req, res) => {
  try {
    // Get all teams with their total trees
    const teams = await Team.find().sort({ total_trees: -1 });
    
    // Get tournament stats
    const totalMatches = await Match.countDocuments();
    const totalSupports = await Support.countDocuments();
    const totalTrees = await Support.aggregate([
      { $group: { _id: null, total: { $sum: "$trees" } } }
    ]);

    return res.json({
      status: true,
      message: "Team challenge data fetched",
      data: {
        teams: teams,
        tournament_stats: {
          total_matches: totalMatches,
          total_supports: totalSupports,
          total_trees: totalTrees[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("Team Challenge Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add/Update team challenge stats
export const addTeamChallenge = async (req, res) => {
  try {
    const {
      team_id,
      team_name,
      total_dot_balls,
      support_trees,
      supportTrees,
      total_trees
    } = req.body;

    if (!team_id && !team_name) {
      return res.status(400).json({
        status: false,
        message: "team_id or team_name is required",
        data: {}
      });
    }

    const updateData = {};
    if (total_dot_balls !== undefined) {
      updateData.total_dot_balls = Number(total_dot_balls);
    }
    if (support_trees !== undefined) {
      updateData.support_trees = Number(support_trees);
    } else if (supportTrees !== undefined) {
      updateData.support_trees = Number(supportTrees);
    }
    if (total_trees !== undefined) {
      updateData.total_trees = Number(total_trees);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: false,
        message: "total_dot_balls, support_trees, or total_trees is required",
        data: {}
      });
    }

    let team;
    if (team_id) {
      team = await Team.findByIdAndUpdate(team_id, updateData, {
        new: true,
        runValidators: true
      });
    } else {
      team = await Team.findOneAndUpdate(
        { team_name },
        updateData,
        {
          new: true,
          runValidators: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
    }

    if (!team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
        data: {}
      });
    }

    // Return updated team challenge data (same shape as teamChallenge)
    const teams = await Team.find().sort({ total_trees: -1 });
    const totalMatches = await Match.countDocuments();
    const totalSupports = await Support.countDocuments();
    const totalTrees = await Support.aggregate([
      { $group: { _id: null, total: { $sum: "$trees" } } }
    ]);

    return res.json({
      status: true,
      message: "Team challenge updated successfully",
      data: {
        teams: teams,
        tournament_stats: {
          total_matches: totalMatches,
          total_supports: totalSupports,
          total_trees: totalTrees[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("Add Team Challenge Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};
