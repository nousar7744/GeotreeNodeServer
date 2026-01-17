import myUser from "../Models/user.model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from 'otp-generator'
import crypto from "crypto";
import axios from "axios";

// In-memory storage for OTP (temporary until OTP is verified)
// Format: { mobile: { otp: number, device_token: string, timestamp: number } }
const otpStorage = new Map();

// API 1: Check mobile number and send OTP (using old signup logic)
export const checkNumber = async (req, res) => {
  console.log('   Request Body:', req.body);
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('   Empty request body');
    return res.status(400).send({
      status: false,
      message: 'Request body required',
      data: {}
    });
  }
  if (!req.body.mobile) {
    return res.status(400).send({
      status: false,
      message: 'Mobile is required in request body',
      data: {}
    });
  }
  try {
    // Convert mobile to number for consistency
    const mobileNumber = Number(req.body.mobile);
    
    // Check with both number and original format
    let IsMobileExist = await myUser.findOne({ 
      $or: [
        { mobile: mobileNumber },
        { mobile: req.body.mobile }
      ]
    });
    let IsDeviceExist = req.body.device_token
      ? await myUser.findOne({ device_token: req.body.device_token })
      : null;
    console.log('   Mobile:', mobileNumber);
    console.log('   IsMobileExist:', IsMobileExist ? 'Found' : 'Not Found');
    console.log('   IsDeviceExist:', IsDeviceExist);

    // If mobile already exists, regenerate OTP and store in memory (don't update user yet)
    if (IsMobileExist) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Store OTP in memory (will be verified in verifyOTP)
      // otpStorage.set(mobileNumber, {
      //   otp: otp,
      //   device_token: req.body.device_token || null,
      //   timestamp: Date.now(),
      //   existingUser: true,
      //   userId: IsMobileExist._id
      // });
      
      // Clear OTP after 10 minutes
      // setTimeout(() => {
      //   otpStorage.delete(mobileNumber);
      // }, 10 * 60 * 1000);  
      const UpdatedUser = await myUser.findByIdAndUpdate(
        IsMobileExist._id,
        {
          otp: otp,
          device_token: req.body.device_token || null,
          timestamp: Date.now(),
          existingUser: true,
          userId: IsMobileExist._id
        },
        { new: true }
      );
      const safeUpdatedUser = UpdatedUser.toObject ? UpdatedUser.toObject() : JSON.parse(JSON.stringify(UpdatedUser));
      delete safeUpdatedUser.password;
      delete safeUpdatedUser.otp;
      return res.send({
        status: 'true',
        message: 'Mobile already registered, OTP sent. Please verify OTP.',
        data: safeUpdatedUser,
      });
    }

    // If device token is present and it's registered to a different user, just send OTP (store in memory)
    if (IsDeviceExist && IsDeviceExist.mobile !== mobileNumber && IsDeviceExist.mobile !== req.body.mobile) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Store OTP in memory
      otpStorage.set(mobileNumber, {
        otp: otp,
        device_token: req.body.device_token || null,
        timestamp: Date.now(),
        existingUser: false,
        conflictDeviceToken: true
      });
      
      // Clear OTP after 10 minutes
      setTimeout(() => {
        otpStorage.delete(mobileNumber);
      }, 10 * 60 * 1000);
      
      return res.send({
        status: 'true',
        message: 'OTP sent to mobile. Please verify OTP.',
        data: {
          mobile: mobileNumber,
          otp: otp,  // Return OTP for testing (remove in production)
          message: 'Device already registered with different mobile. Verify OTP to proceed.'
        }
      });
    }

    // For new users, generate OTP and store in memory (don't create user yet)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP in memory (will be verified in verifyOTP, then user will be created)
    otpStorage.set(mobileNumber, {
      otp: otp,
      device_token: req.body.device_token || null,
      timestamp: Date.now(),
      existingUser: false,
      userData: req.body  // Store all user data for later creation
    });
    
    // Clear OTP after 10 minutes
    setTimeout(() => {
      otpStorage.delete(mobileNumber);
    }, 10 * 60 * 1000);

    console.log('   OTP generated for new user, stored in memory. Mobile:', mobileNumber);

    return res.send({
      status: 'true',
      message: 'OTP sent to mobile. Please verify OTP to complete registration.',
      data: {
        mobile: mobileNumber,
        otp: otp  // Return OTP for testing (remove in production)
      }
    });
  } catch (err) {
    console.log('   Error in checkNumber:', err);
    return res.status(500).send({
      status: false,
      msg: "Something wrong with request.",
      data: err
    });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp, privacy_policy, device_token } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        status: false,
        message: "Mobile and OTP are required",
        data: {}
      });
    }

    // Convert mobile to number for consistency
    const mobileNumber = Number(mobile);
    const otpNumber = Number(otp);

    console.log('   verifyOTP - Mobile:', mobileNumber, 'OTP:', otpNumber);

    // Check OTP from in-memory storage
    const storedOtpData = otpStorage.get(mobileNumber);
    
    if (!storedOtpData) {
      return res.send({
        status: false,
        msg: "Invalid Mobile given. Please request OTP first.",
        data: {}
      });
    }

    // Check if OTP matches
    if (storedOtpData.otp !== otpNumber && storedOtpData.otp !== Number(otp)) {
      return res.send({
        status: false,
        msg: "Invalid Otp given.",
        data: {}
      });
    }

    // OTP is valid - now create or update user
    let user;
    
    if (storedOtpData.existingUser) {
      // User already exists - update it
      const updateData = {
        mobile_verified: true,
        number_verified: true,
        otp: undefined  // Clear OTP
      };
      
      if (privacy_policy !== undefined) {
        updateData.privacy_policy = privacy_policy;
      }
      
      // Update device_token if provided
      if (device_token || storedOtpData.device_token) {
        updateData.device_token = device_token || storedOtpData.device_token;
      }
      
      user = await myUser.findByIdAndUpdate(
        storedOtpData.userId,
        updateData,
        { new: true }
      );
      
      console.log('   Updated existing user:', user._id);
    } else {
      // New user - create it now
      const userPayload = {
        mobile: mobileNumber,
        mobile_verified: true,
        number_verified: true,
        device_token: device_token || storedOtpData.device_token || null
      };
      
      if (privacy_policy !== undefined) {
        userPayload.privacy_policy = privacy_policy;
      }
      
      // Add any other user data that was stored
      if (storedOtpData.userData) {
        Object.assign(userPayload, storedOtpData.userData);
        delete userPayload.otp;  // Don't store OTP
      }
      
      user = await myUser.create(userPayload);
      console.log('   Created new user after OTP verification:', user._id);
    }
    
    // Generate token
    const token = await jwt.sign({ time: Date(), user_id: user._id }, process.env.JWT_SECRET || 'Coachinge');
    
    // Update token in user
    user.token = token;
    await myUser.findByIdAndUpdate(user._id, { token: token });
    
    // Remove OTP from memory
    otpStorage.delete(mobileNumber);
    
    // Prepare safe object
    const safe = user.toObject ? user.toObject() : JSON.parse(JSON.stringify(user));
    delete safe.password;
    delete safe.otp;
    
    res.send({
      status: true,
      msg: "Otp Verified succesfully. User registered.",
      data: {
        ...safe,
        token,
        user_id: user._id
      }
    });
  } catch (err) {
    console.log('   Error in verifyOTP:', err);
    res.status(500).send({
      status: false,
      msg: "Something wrong with request.",
      data: err
    });
  }
};






  




