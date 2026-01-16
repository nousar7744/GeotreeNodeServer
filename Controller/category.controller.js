import Category from "../Models/category.model.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for category image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/category');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `category-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Multer middleware for category image
export const uploadCategoryImageMiddleware = upload.single('category_image');

// API 4: Get category list
export const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Category list fetched",
      data: categories
    });
  } catch (error) {
    console.error("Get Category List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add new category
export const addCategory = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    
    // Validate all required fields
    if (!name) {
      return res.status(400).json({
        status: false,
        message: "name is required",
        data: {}
      });
    }

    if (!type) {
      return res.status(400).json({
        status: false,
        message: "type is required",
        data: {}
      });
    }

    if (!['Carbon', 'Plantation', 'Occasion'].includes(type)) {
      return res.status(400).json({
        status: false,
        message: "type must be one of: Carbon, Plantation, Occasion",
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
        message: "category_image is required",
        data: {}
      });
    }

    // Prepare category data (all fields are required)
    const categoryData = {
      name,
      type,
      description,
      category_image: `/uploads/category/${req.file.filename}`
    };

    const category = await Category.create(categoryData);
    
    return res.json({
      status: true,
      message: "Category added successfully",
      data: category
    });
  } catch (error) {
    // Delete uploaded file if category creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/category', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.error("Add Category Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};
