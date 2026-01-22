import myUser from "../Models/user.model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Multer middleware
export const uploadMiddleware = upload.single('profile_image');

// API 18: Get profile
export const getProfile = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const user = await myUser.findById(user_id).select('-otp -password');
    
    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Profile fetched",
      data: user
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 19: Update profile
export const updateProfile = async (req, res) => {
  try {
    const { user_id, name, email, profile_image } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profile_image) updateData.profile_image = profile_image;

    const user = await myUser.findByIdAndUpdate(
      user_id,
      updateData,
      { new: true, select: '-otp -password' }
    );

    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 20: Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    console.log("📥 Upload Profile Image:", req.body);
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const uploadedFile = req.file || (req.files && req.files[0]);
    if (!uploadedFile) {
      return res.status(400).json({
        status: false,
        message: "Profile image file is required",
        data: {}
      });
    }

    // Construct image URL (adjust based on your server setup)
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${uploadedFile.filename}`;

    const user = await myUser.findByIdAndUpdate(
      user_id,
      { profile_image: imageUrl },
      { new: true, select: '-otp -password' }
    );

    if (!user) {
      const filePath = path.join(__dirname, "../uploads/profile", uploadedFile.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.json({
        status: false,
        message: "User not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Profile image uploaded successfully",
      data: {
        user,
        image_url: imageUrl
      }
    });
  } catch (error) {
    console.error("Upload Profile Image Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Server error",
      data: {}
    });
  }
};

