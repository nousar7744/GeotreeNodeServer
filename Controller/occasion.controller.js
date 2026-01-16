import Occasion from "../Models/occasion.model.js";

// API 12: Get occasion type list
export const getOccasionTypeList = async (req, res) => {
  try {
    const occasionTypes = [
      { id: 1, name: "Birthday" },
      { id: 2, name: "Anniversary" },
      { id: 3, name: "Wedding" },
      { id: 4, name: "Memorial" },
      { id: 5, name: "Festival" },
      { id: 6, name: "Other" }
    ];
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

