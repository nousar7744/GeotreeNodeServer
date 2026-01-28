import Carbon from "../Models/carbon.model.js";
import { HomeType, TransportType, ElectricityType, FoodType } from "../Models/carbonTypes.model.js";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const defaultFactors = {
  transport: {
    car_diesel_km: 0.21,
    car_petrol_km: 0.19,
    motorbike_km: 0.1,
    bus_km: 0.08,
    train_km: 0.04,
    flight_short_per_flight: 150,
    flight_long_per_flight: 400
  },
  energy: {
    electricity_kwh: 0.82,
    lpg_kg: 2.98
  },
  waste: {
    waste_kg: 0.5
  },
  food: {
    meat_per_meal: 7
  }
};

const speciesMixConfig = {
  neem: { ids: ["neem"], percent: 0.25 },
  peepal: { ids: ["peepal"], percent: 0.25 },
  mango: { ids: ["mango"], percent: 0.25 },
  banyan: { ids: ["banyan"], percent: 0.25 }
};

const speciesList = [
  {
    id: "neem",
    name: "Neem",
    sequestration_kg_per_year: 20,
    type: "Native, multipurpose",
    note: "Resilient, supports soil"
  },
  {
    id: "peepal",
    name: "Peepal",
    sequestration_kg_per_year: 28,
    type: "Long-lived hardwood",
    note: "High long-term sequestration"
  },
  {
    id: "mango",
    name: "Mango",
    sequestration_kg_per_year: 22,
    type: "Fruit-bearing",
    note: "Long-term sink and livelihood benefits"
  },
  {
    id: "banyan",
    name: "Banyan",
    sequestration_kg_per_year: 30,
    type: "Sacred, shade",
    note: "Large canopy, excellent for carbon"
  }
];

const recommendSpecies = (totalTonnes, list, config = speciesMixConfig) => {
  const totalKg = totalTonnes * 1000;
  const neemKg = totalKg * config.neem.percent;
  const peepalKg = totalKg * config.peepal.percent;
  const mangoKg = totalKg * config.mango.percent;
  const banyanKg = totalKg * config.banyan.percent;

  const result = [];
  config.neem.ids.forEach((id) => {
    const s = list.find((sp) => sp.id === id);
    if (s) {
      let count = Math.ceil(neemKg / s.sequestration_kg_per_year);
      if (count < 1) count = 1;
      result.push({ ...s, count, rationale: "Native, multipurpose" });
    }
  });
  config.peepal.ids.forEach((id) => {
    const s = list.find((sp) => sp.id === id);
    if (s) {
      let count = Math.ceil(peepalKg / s.sequestration_kg_per_year);
      if (count < 1) count = 1;
      result.push({ ...s, count, rationale: "Long-lived, high sequestration" });
    }
  });
  config.mango.ids.forEach((id) => {
    const s = list.find((sp) => sp.id === id);
    if (s) {
      let count = Math.ceil(mangoKg / s.sequestration_kg_per_year);
      if (count < 1) count = 1;
      result.push({ ...s, count, rationale: "Fruit-bearing, long-term" });
    }
  });
  config.banyan.ids.forEach((id) => {
    const s = list.find((sp) => sp.id === id);
    if (s) {
      let count = Math.ceil(banyanKg / s.sequestration_kg_per_year);
      if (count < 1) count = 1;
      result.push({ ...s, count, rationale: "Sacred, large canopy" });
    }
  });
  return result;
};

const normalizeInputs = (raw = {}) => ({
  car_km_week: toNumber(raw.car_km_week),
  car_fuel: raw.car_fuel || "petrol",
  motorbike_km_week: toNumber(raw.motorbike_km_week),
  bus_km_week: toNumber(raw.bus_km_week),
  train_km_week: toNumber(raw.train_km_week),
  flights_short: toNumber(raw.flights_short),
  flights_long: toNumber(raw.flights_long),
  electricity_kwh_month: toNumber(raw.electricity_kwh_month),
  electricity_bill_annual: toNumber(raw.electricity_bill_annual),
  lpg_kg_month: toNumber(raw.lpg_kg_month),
  waste_kg_month: toNumber(raw.waste_kg_month),
  meat_meals_week: toNumber(raw.meat_meals_week),
  dairy_portions_week: toNumber(raw.dairy_portions_week),
  shopping_freq_week: toNumber(raw.shopping_freq_week)
});

const calculateEmissions = (inputs, factors) => {
  let total = 0;
  const breakdown = {
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0
  };
  const transport = factors.transport || {};
  const energy = factors.energy || {};
  const waste = factors.waste || {};
  const food = factors.food || {};

  if (inputs.car_km_week > 0) {
    const perKm = inputs.car_fuel === "diesel"
      ? transport.car_diesel_km || 0
      : transport.car_petrol_km || 0;
    breakdown.transport += inputs.car_km_week * 52 * perKm;
  }
  if (inputs.motorbike_km_week > 0) {
    breakdown.transport += inputs.motorbike_km_week * 52 * (transport.motorbike_km || 0);
  }
  if (inputs.bus_km_week > 0) {
    breakdown.transport += inputs.bus_km_week * 52 * (transport.bus_km || 0);
  }
  if (inputs.train_km_week > 0) {
    breakdown.transport += inputs.train_km_week * 52 * (transport.train_km || 0);
  }
  if (inputs.flights_short > 0) {
    breakdown.transport += inputs.flights_short * (transport.flight_short_per_flight || 0);
  }
  if (inputs.flights_long > 0) {
    breakdown.transport += inputs.flights_long * (transport.flight_long_per_flight || 0);
  }

  if (inputs.electricity_kwh_month > 0) {
    breakdown.energy += inputs.electricity_kwh_month * 12 * (energy.electricity_kwh || 0);
  } else if (inputs.electricity_bill_annual > 0) {
    const kwh = inputs.electricity_bill_annual / 8;
    breakdown.energy += kwh * (energy.electricity_kwh || 0);
  }
  if (inputs.lpg_kg_month > 0) {
    breakdown.energy += inputs.lpg_kg_month * 12 * (energy.lpg_kg || 0);
  }

  if (inputs.waste_kg_month > 0) {
    breakdown.waste += inputs.waste_kg_month * 12 * (waste.waste_kg || 0);
  }

  if (inputs.meat_meals_week > 0) {
    breakdown.food += inputs.meat_meals_week * 52 * (food.meat_per_meal || 0);
  }
  if (inputs.dairy_portions_week > 0) {
    breakdown.food += inputs.dairy_portions_week * 52 * 2.5;
  }
  if (inputs.shopping_freq_week > 0) {
    breakdown.food += inputs.shopping_freq_week * 52 * 10;
  }

  total = breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste;
  return { total, breakdown };
};

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
    const payload = req.body || {};

    const { user_id, home_type, transport_type, electricity_type, food_type } = payload;
    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const inputsPayload = payload.inputs;
    const hasInputs = inputsPayload || Object.prototype.hasOwnProperty.call(payload, "car_km_week");
    if (hasInputs) {
      const factors = payload.factors || defaultFactors;
      const inputs = normalizeInputs(inputsPayload || payload);
      const { total, breakdown } = calculateEmissions(inputs, factors);
      const totalTonnes = total / 1000;
      const breakdownPercent = {
        transport: total ? (breakdown.transport / total) * 100 : 0,
        energy: total ? (breakdown.energy / total) * 100 : 0,
        food: total ? (breakdown.food / total) * 100 : 0,
        waste: total ? (breakdown.waste / total) * 100 : 0
      };
      const speciesRec = recommendSpecies(totalTonnes, speciesList, speciesMixConfig);

      const carbon = await Carbon.create({
        user_id,
        carbon_result: total,
        total,
        total_tonnes: totalTonnes,
        breakdown,
        breakdown_percent: breakdownPercent,
        species_recommendations: speciesRec
      });

      return res.json({
        status: true,
        message: "Carbon data submitted successfully",
        data: {
          user_id: payload.user_id,
          carbon,
          total,
          total_tonnes: totalTonnes,
          breakdown,
          breakdown_percent: breakdownPercent,
          species_recommendations: speciesRec
        }
      });
    }

    const carbonResult = toNumber(home_type)
      + toNumber(transport_type)
      + toNumber(electricity_type)
      + toNumber(food_type);

    const carbon = await Carbon.create({
      user_id,
      home_type,
      transport_type,
      electricity_type,
      food_type,
      carbon_result: Math.round(carbonResult * 100) / 100
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
    const payload = req.body || {};
    const user_id = payload.user_id || req.query?.user_id;
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

    const carbonData = carbon.toObject();
    const total = carbonData.total ?? carbonData.carbon_result ?? 0;
    const totalTonnes = carbonData.total_tonnes ?? (total ? total / 1000 : 0);

    return res.json({
      status: true,
      message: "Carbon result fetched",
      data: {
        ...carbonData,
        total,
        total_tonnes: totalTonnes,
        breakdown: carbonData.breakdown || {},
        breakdown_percent: carbonData.breakdown_percent || {},
        species_recommendations: carbonData.species_recommendations || []
      }
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

// API: Get carbon history by user
export const getCarbonHistory = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "user_id is required",
        data: {}
      });
    }

    const history = await Carbon.find({ user_id }).sort({ createdAt: -1 });

    return res.json({
      status: true,
      message: "Carbon history fetched",
      data: history
    });
  } catch (error) {
    console.error("Get Carbon History Error:", error);
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
