import Carbon from "../Models/carbon.model.js";
import { HomeType, TransportType, ElectricityType, FoodType } from "../Models/carbonTypes.model.js";

// API 6: Get home type list
export const getHomeTypeList = async (req, res) => {
  try {
    const homeTypes = await HomeType.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Home type list fetched",
      data: homeTypes
    });
  } catch (error) {
    console.error("Get Home Type List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 7: Get transport type list
export const getTransportTypeList = async (req, res) => {
  try {
    const transportTypes = await TransportType.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Transport type list fetched",
      data: transportTypes
    });
  } catch (error) {
    console.error("Get Transport Type List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 8: Get electricity usage list
export const getElectricityList = async (req, res) => {
  try {
    const electricityTypes = await ElectricityType.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Electricity list fetched",
      data: electricityTypes
    });
  } catch (error) {
    console.error("Get Electricity List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 9: Get food type list
export const getFoodTypeList = async (req, res) => {
  try {
    const foodTypes = await FoodType.find().sort({ name: 1 });
    return res.json({
      status: true,
      message: "Food type list fetched",
      data: foodTypes
    });
  } catch (error) {
    console.error("Get Food Type List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 10: Submit carbon footprint data
export const submitCarbon = async (req, res) => {
  try {
    const { user_id, home_type, transport_type, electricity_type, food_type } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    // Calculate carbon result based on selected types
    let carbonResult = 0;
    
    // Carbon footprint values (in kg CO2 per month)
    const carbonFootprint = {
      // Home types (approximate monthly carbon footprint)
      home: {
        apartment: 200,
        house: 300,
        villa: 500,
        studio: 150
      },
      // Transport types (approximate monthly carbon footprint)
      transport: {
        car: 400,
        bike: 50,
        public_transport: 100,
        walking: 0,
        cycling: 0
      },
      // Electricity types (approximate monthly carbon footprint)
      electricity: {
        low: 150,      // 0-100 units/month
        medium: 300,   // 100-300 units/month
        high: 600      // 300+ units/month
      },
      // Food types (approximate monthly carbon footprint)
      food: {
        vegetarian: 100,
        non_vegetarian: 200,
        vegan: 80
      }
    };

    // Calculate based on selected types
    if (home_type) {
      const homeValue = carbonFootprint.home[home_type] || 0; // Default to apartment
      console.log("homeValue", homeValue);
      carbonResult += homeValue;
    }

    if (transport_type) {
      const transportValue = carbonFootprint.transport[transport_type] || 0; // Default
      console.log("transportValue", transportValue);
      carbonResult += transportValue;
    }

    if (electricity_type) {
      const electricityValue = carbonFootprint.electricity[electricity_type] || 0; // Default
      console.log("electricityValue", electricityValue);
      carbonResult += electricityValue;
    }

    if (food_type) {
      const foodValue = carbonFootprint.food[food_type] || 0; // Default
      console.log("foodValue", foodValue);
      carbonResult += foodValue;
    }
    
    // Round to 2 decimal places
    carbonResult = Math.round(carbonResult * 100) / 100;

    const carbon = await Carbon.create({
      user_id,
      home_type,
      transport_type,
      electricity_type,
      food_type,
      carbon_result: carbonResult
    });

    return res.json({
      status: true,
      message: "Carbon data submitted successfully",
      data: carbon
    });
  } catch (error) {
    console.error("Submit Carbon Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 11: Get carbon result
export const getCarbonResult = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const carbon = await Carbon.findOne({ user_id }).sort({ createdAt: -1 });
    if (!carbon) {
      return res.json({
        status: false,
        message: "No carbon data found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Carbon result fetched",
      data: carbon
    });
  } catch (error) {
    console.error("Get Carbon Result Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API: Add all types in one request (Bulk Add)
export const addAllTypes = async (req, res) => {
  try {
    const { home_types, transport_types, electricity_types, food_types } = req.body;
    
    const results = {
      home_types: [],
      transport_types: [],
      electricity_types: [],
      food_types: [],
      errors: []
    };

    // Add Home Types
    if (home_types && Array.isArray(home_types)) {
      for (const item of home_types) {
        try {
          if (!item.name || !item.value) {
            results.errors.push({ type: 'home_type', error: 'name and value are required', item });
            continue;
          }
          const homeType = await HomeType.create({ name: item.name, value: item.value });
          results.home_types.push(homeType);
        } catch (error) {
          if (error.code === 11000) {
            results.errors.push({ type: 'home_type', error: 'Already exists', item: item.name });
          } else {
            results.errors.push({ type: 'home_type', error: error.message, item });
          }
        }
      }
    }

    // Add Transport Types
    if (transport_types && Array.isArray(transport_types)) {
      for (const item of transport_types) {
        try {
          if (!item.name || !item.value) {
            results.errors.push({ type: 'transport_type', error: 'name and value are required', item });
            continue;
          }
          const transportType = await TransportType.create({ name: item.name, value: item.value });
          results.transport_types.push(transportType);
        } catch (error) {
          if (error.code === 11000) {
            results.errors.push({ type: 'transport_type', error: 'Already exists', item: item.name });
          } else {
            results.errors.push({ type: 'transport_type', error: error.message, item });
          }
        }
      }
    }

    // Add Electricity Types
    if (electricity_types && Array.isArray(electricity_types)) {
      for (const item of electricity_types) {
        try {
          if (!item.name || !item.value) {
            results.errors.push({ type: 'electricity_type', error: 'name and value are required', item });
            continue;
          }
          const electricityType = await ElectricityType.create({ name: item.name, value: item.value });
          results.electricity_types.push(electricityType);
        } catch (error) {
          if (error.code === 11000) {
            results.errors.push({ type: 'electricity_type', error: 'Already exists', item: item.name });
          } else {
            results.errors.push({ type: 'electricity_type', error: error.message, item });
          }
        }
      }
    }

    // Add Food Types
    if (food_types && Array.isArray(food_types)) {
      for (const item of food_types) {
        try {
          if (!item.name || !item.value) {
            results.errors.push({ type: 'food_type', error: 'name and value are required', item });
            continue;
          }
          const foodType = await FoodType.create({ name: item.name, value: item.value });
          results.food_types.push(foodType);
        } catch (error) {
          if (error.code === 11000) {
            results.errors.push({ type: 'food_type', error: 'Already exists', item: item.name });
          } else {
            results.errors.push({ type: 'food_type', error: error.message, item });
          }
        }
      }
    }

    const totalAdded = results.home_types.length + results.transport_types.length + 
                      results.electricity_types.length + results.food_types.length;
    const totalErrors = results.errors.length;

    return res.json({
      status: true,
      message: `Added ${totalAdded} items successfully${totalErrors > 0 ? `, ${totalErrors} errors` : ''}`,
      data: results
    });
  } catch (error) {
    console.error("Add All Types Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
      data: {}
    });
  }
};
