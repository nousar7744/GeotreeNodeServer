import express from "express";
import dotenv from "dotenv";
import {GeoRouter} from "./Routers/route.js"
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

mongoose.set("bufferCommands", true); 

const app = express();

// CORS middleware - Allow all origins (MUST BE FIRST)
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.path} - CORS middleware`);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("OPTIONS preflight request - returning 200");
    return res.status(200).end();
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const startServer = async () => {
  try {
    await connectDB(); 
    app.use("/api", GeoRouter);
    app.get("/api/health", (req, res) => {
      res.json({
        success: true,
        message: "API is healthy",
        timestamp: new Date().toISOString()
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/`);
      console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📍 Test API: http://localhost:${PORT}/api/auth/check-number`);
    });

  } catch (error) {
    console.error("Startup failed ❌", error.message);
    process.exit(1);
  }
};

startServer();
