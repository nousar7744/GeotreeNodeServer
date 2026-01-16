import Express from "express";

// Import all controllers
import { checkNumber, verifyOTP } from "../Controller/signup.controller.js";
import { createPhonePePayment, phonePeRedirect, phonePeCallback } from "../Controller/payment.controller.js";
import { getStateList, addState, updateState, uploadStateImage, uploadStateImageMiddleware } from "../Controller/state.controller.js";
import { getCategoryList, addCategory, uploadCategoryImageMiddleware } from "../Controller/category.controller.js";
import {
  getHomeTypeList,
  getTransportTypeList,
  getElectricityList,
  getFoodTypeList,
  addAllTypes,
  submitCarbon,
  getCarbonResult
} from "../Controller/carbon.controller.js";
import { getOccasionTypeList, submitOccasion } from "../Controller/occasion.controller.js";
import { submitPlantation, getPlantList, getLocationList, addPlant, addLocation } from "../Controller/plantation.controller.js";
import {
  getCertificateDetails,
  downloadCertificate,
  verifyCertificate
} from "../Controller/certificate.controller.js";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadMiddleware
} from "../Controller/profile.controller.js";
import {
  getTeamList,
  addTeam,
  updateTeam,
  uploadTeamImage,
  teamPreplantSupport,
  getTeamDetails,
  teamChallenge,
  uploadTeamLogoMiddleware
} from "../Controller/team.controller.js";
import {
  getMatchList,
  addMatch,
  getMatchDetails,
  supportTrees
} from "../Controller/match.controller.js";

const GeoRouter = Express.Router();

// Test route to verify routing works
GeoRouter.get("/test", (req, res) => {
  res.json({
    status: true,
    message: "Routes are working!",
    timestamp: new Date().toISOString()
  });
});

GeoRouter.post("/auth/check-number", checkNumber);
GeoRouter.post("/auth/verify-otp", verifyOTP);
GeoRouter.post("/auth/phonepe/create-payment", createPhonePePayment);
GeoRouter.post("/phonepe/create-payment", createPhonePePayment); // Old format
GeoRouter.post("/auth/phonepe/redirect", phonePeRedirect);
GeoRouter.post("/auth/phonepe/callback", phonePeCallback);
GeoRouter.get("/state/list", getStateList);
GeoRouter.post("/state/add", uploadStateImageMiddleware, addState);
GeoRouter.put("/state/update/:state_id", updateState);// API: Upload/Update state image
GeoRouter.post("/state/upload-image", uploadStateImageMiddleware, uploadStateImage);
GeoRouter.get("/category/list", getCategoryList);
GeoRouter.post("/category/add", uploadCategoryImageMiddleware, addCategory);
GeoRouter.get("/carbon/home-type-list", getHomeTypeList);
GeoRouter.get("/carbon/transport-type-list", getTransportTypeList);
GeoRouter.get("/carbon/electricity-list", getElectricityList);
GeoRouter.get("/carbon/food-type-list", getFoodTypeList);
GeoRouter.post("/carbon/add-all-types", addAllTypes);
GeoRouter.post("/carbon/submit", submitCarbon);
GeoRouter.get("/carbon/result", getCarbonResult);
GeoRouter.get("/occasion/type-list", getOccasionTypeList);
GeoRouter.post("/occasion/submit", submitOccasion);
GeoRouter.get("/plant/list", getPlantList);
GeoRouter.post("/plant/add", addPlant);
GeoRouter.get("/location/list", getLocationList);
GeoRouter.post("/location/add", addLocation);
GeoRouter.post("/plantation/submit", submitPlantation);
GeoRouter.get("/certificate/details", getCertificateDetails);
GeoRouter.get("/certificate/download", downloadCertificate);
GeoRouter.get("/certificate/verify", verifyCertificate);
GeoRouter.get("/profile", getProfile);
GeoRouter.put("/profile/update", updateProfile);
GeoRouter.post("/profile/upload-image", uploadMiddleware, uploadProfileImage);
GeoRouter.get("/team/list", getTeamList);
GeoRouter.post("/team/add", uploadTeamLogoMiddleware, addTeam);
GeoRouter.put("/team/update/:team_id", updateTeam);
GeoRouter.post("/team/upload-image", uploadTeamLogoMiddleware, uploadTeamImage);
GeoRouter.post("/team/preplant/support", teamPreplantSupport);
GeoRouter.get("/team/details", getTeamDetails);
GeoRouter.get("/team/challenge", teamChallenge);
GeoRouter.get("/match/list", getMatchList);
GeoRouter.post("/match/add", addMatch);
GeoRouter.get("/match/details", getMatchDetails);
GeoRouter.post("/support/trees", supportTrees);

export { GeoRouter };




