import Plantation from "../Models/plantation.model.js";
import Certificate from "../Models/certificate.model.js";
import Plant from "../Models/plant.model.js";
import Location from "../Models/location.model.js";
import crypto from "crypto";

// API 14: Get plant name list
export const getPlantList = async (req, res) => {
  try {
    const plants = await Plant.find().sort({ plant_name: 1 });
    return res.json({
      status: true,
      message: "Plant list fetched",
      data: plants
    });
  } catch (error) {
    console.error("Get Plant List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add plant
export const addPlant = async (req, res) => {
  try {
    const { plant_name } = req.body;
    
    if (!plant_name) {
      return res.status(400).json({
        status: false,
        message: "plant_name is required",
        data: {}
      });
    }

    const plant = await Plant.create({ plant_name });
    
    return res.json({
      status: true,
      message: "Plant added successfully",
      data: plant
    });
  } catch (error) {
    console.error("Add Plant Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 15: Get location list
export const getLocationList = async (req, res) => {
  try {
    const locations = await Location.find().sort({ location_name: 1 });
    return res.json({
      status: true,
      message: "Location list fetched",
      data: locations
    });
  } catch (error) {
    console.error("Get Location List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add location
export const addLocation = async (req, res) => {
  try {
    const { location_name } = req.body;
    
    if (!location_name) {
      return res.status(400).json({
        status: false,
        message: "location_name is required",
        data: {}
      });
    }

    const location = await Location.create({ location_name });
    
    return res.json({
      status: true,
      message: "Location added successfully",
      data: location
    });
  } catch (error) {
    console.error("Add Location Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 16: Submit plantation details
export const submitPlantation = async (req, res) => {
  try {
    const { user_id, trees_count, plants, name, date, message, location, occasion_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    // Parse plants if it's a string (from form-data or query params)
    let plantsArray = plants;
    if (typeof plants === 'string') {
      try {
        plantsArray = JSON.parse(plants);
      } catch (parseError) {
        return res.status(400).json({
          status: false,
          message: "Invalid plants format. Expected JSON array.",
          data: {}
        });
      }
    }

    // Validate plants is an array
    if (plantsArray && !Array.isArray(plantsArray)) {
      return res.status(400).json({
        status: false,
        message: "plants must be an array",
        data: {}
      });
    }

    const plantation = await Plantation.create({
      user_id,
      trees_count,
      plants: plantsArray || [],
      name,
      date: date ? new Date(date) : new Date(),
      message,
      location,
      occasion_id: occasion_id || null
    });

    const populatedPlantation = await Plantation.findById(plantation._id)
      .populate('occasion_id', 'name occasion_image');

    // Generate certificate
    const certificateId = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrCode = `QR-${certificateId}`;

    const certificate = await Certificate.create({
      user_id,
      certificate_id: certificateId,
      qr_code: qrCode,
      plantation_id: plantation._id
    });

    return res.json({
      status: true,
      message: "Plantation submitted successfully",
      data: {
        plantation: populatedPlantation,
        certificate: {
          certificate_id: certificate.certificate_id,
          qr_code: certificate.qr_code
        }
      }
    });
  } catch (error) {
    console.error("Submit Plantation Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Get plantation history by user
export const getPlantationHistory = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const plantations = await Plantation.find({ user_id })
      .populate("occasion_id", "name occasion_image")
      .sort({ createdAt: -1 });

    return res.json({
      status: true,
      message: "Plantation history fetched",
      data: plantations
    });
  } catch (error) {
    console.error("Get Plantation History Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};
