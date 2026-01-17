import Occasion from "../Models/occasion.model.js";
import OccasionType from "../Models/occasionType.model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for occasion type image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/occasion");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `occasion-${uniqueSuffix}${path.extname(file.originalname)}`);
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
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Multer middleware for occasion type image
export const uploadOccasionImageMiddleware = upload.single("occasion_image");

// API 12: Get occasion type list
export const getOccasionTypeList = async (req, res) => {
  try {
    const occasionTypes = await OccasionType.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Occasion type list fetched",
      data: occasionTypes
    });
  } catch (error) {
    console.error("Get Occasion Type List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add occasion type with image
export const addOccasionType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "name is required",
        data: {}
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "occasion_image is required",
        data: {}
      });
    }

    const occasionType = await OccasionType.create({
      name,
      occasion_image: `/uploads/occasion/${req.file.filename}`
    });

    return res.json({
      status: true,
      message: "Occasion type added successfully",
      data: occasionType
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, "../uploads/occasion", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Occasion type already exists",
        data: {}
      });
    }

    console.error("Add Occasion Type Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 13: Submit selected occasion type
export const submitOccasion = async (req, res) => {
  try {
    const { user_id, occasion_type } = req.body;
    
    if (!user_id || !occasion_type) {
      return res.status(400).json({
        status: false,
        message: "user_id and occasion_type are required",
        data: {}
      });
    }

    const occasion = await Occasion.create({
      user_id,
      occasion_type
    });

    return res.json({
      status: true,
      message: "Occasion submitted successfully",
      data: occasion
    });
  } catch (error) {
    console.error("Submit Occasion Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

