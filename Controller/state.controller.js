import State from "../Models/state.model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for state image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/state');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `state-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Multer middleware for state image
export const uploadStateImageMiddleware = upload.single('state_image');

// API 3: Get state list
export const getStateList = async (req, res) => {
  try {
    const states = await State.find().sort({ state_name: 1 });
    return res.json({
      status: true,
      message: "State list fetched",
      data: states
    });
  } catch (error) {
    console.error("Get State List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 5: Add new state
export const addState = async (req, res) => {
  try {
    const { state_name, description } = req.body;
    
    // Validate all required fields
    if (!state_name) {
      return res.status(400).json({
        status: false,
        message: "state_name is required",
        data: {}
      });
    }

    if (!description) {
      return res.status(400).json({
        status: false,
        message: "description is required",
        data: {}
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "state_image is required",
        data: {}
      });
    }

    // Prepare state data (all fields are required)
    const stateData = {
      state_name,
      description,
      state_image: `/uploads/state/${req.file.filename}`
    };

    const state = await State.create(stateData);
    
    return res.json({
      status: true,
      message: "State added successfully",
      data: state
    });
  } catch (error) {
    // Delete uploaded file if state creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/state', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "State already exists",
        data: {}
      });
    }
    console.error("Add State Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Update state
export const updateState = async (req, res) => {
  try {
    const { state_id } = req.params;
    const { state_name, description } = req.body;
    
    if (!state_id) {
      return res.status(400).json({
        status: false,
        message: "state_id is required",
        data: {}
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (state_name) {
      updateData.state_name = state_name;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }

    // Find and update state
    const state = await State.findByIdAndUpdate(
      state_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!state) {
      return res.status(404).json({
        status: false,
        message: "State not found",
        data: {}
      });
    }
    
    return res.json({
      status: true,
      message: "State updated successfully",
      data: state
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "State name already exists",
        data: {}
      });
    }
    console.error("Update State Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Upload/Update state image
export const uploadStateImage = async (req, res) => {
  try {
    const { state_id } = req.body;
    
    if (!state_id) {
      return res.status(400).json({
        status: false,
        message: "state_id is required",
        data: {}
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "State image is required",
        data: {}
      });
    }

    // Find state
    const state = await State.findById(state_id);
    
    if (!state) {
      // Delete uploaded file if state not found
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/state', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        status: false,
        message: "State not found",
        data: {}
      });
    }

    // Delete old image if exists
    if (state.state_image) {
      const oldImagePath = path.join(__dirname, '..', state.state_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update state with new image path
    const imagePath = `/uploads/state/${req.file.filename}`;
    const updatedState = await State.findByIdAndUpdate(
      state_id,
      { state_image: imagePath },
      { new: true }
    );

    return res.json({
      status: true,
      message: "State image uploaded successfully",
      data: {
        state: updatedState,
        image_url: imagePath
      }
    });
  } catch (error) {
    console.error("Upload State Image Error:", error);
    
    // Delete uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/state', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};
