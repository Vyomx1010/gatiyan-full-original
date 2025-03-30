const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP } = require("../services/communication.service");
const rideModel = require("../models/ride.model");
const blackListTokenModel = require('../models/blackListToken.model'); // adjust the path as needed


module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    fullname,
    email,
    password,
    vehicle,
    mobileNumber,
    drivingLicense,
    profilePhoto,
  } = req.body;

  if (!profilePhoto) {
    return res.status(400).json({ message: "Profile photo is required" });
  }

  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith("+91")) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  try {
    const existingCaptainByEmail = await captainModel.findOne({ email });
    const existingCaptainByMobile = await captainModel.findOne({
      mobileNumber: formattedMobileNumber,
    });

    let captain;

    if (existingCaptainByEmail || existingCaptainByMobile) {
      captain = existingCaptainByEmail || existingCaptainByMobile;

      if (captain.emailVerified && captain.mobileVerified) {
        return res.status(400).json({
          message: "Account with this email or mobile number is already fully verified.",
        });
      }

      if (!captain.emailVerified && email !== captain.email) {
        captain.email = email;
      }
      if (!captain.mobileVerified && formattedMobileNumber !== captain.mobileNumber) {
        captain.mobileNumber = formattedMobileNumber;
      }

      const emailOTP = generateOTP();
      captain.emailOTP = emailOTP;
      captain.password = await captainModel.hashPassword(password);
      captain.fullname = fullname;
      captain.vehicle = vehicle;
      captain.profilePhoto = profilePhoto;
      captain.drivingLicense = drivingLicense;
      captain.lastOtpSent = new Date();

      await captain.save();
    } else {
      const hashedPassword = await captainModel.hashPassword(password);
      const emailOTP = generateOTP();

      captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
        profilePhoto,
        mobileNumber: formattedMobileNumber,
        drivingLicense,
        emailOTP,
      });
    }

    await sendEmailOTP(captain.email, captain.emailOTP);

    res.status(201).json({
      message: "OTP sent to email and mobile number",
      captain: { email: captain.email, mobileNumber: captain.mobileNumber },
    });
  } catch (error) {
    if (error.code === 11000) {
      let field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `Duplicate value found for ${field}. Please use a different ${field}.`,
      });
    }
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports.verifyEmailOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  // Trim and normalize OTP
  const normalizedOTP = otp.trim();

  const captain = await captainModel.findOne({ email }).select("+emailOTP");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  // Trim and normalize stored OTP
  const storedOTP = captain.emailOTP.trim();

  // Debugging: Log the OTPs
  // console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (String(storedOTP).trim() !== String(normalizedOTP).trim()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({ message: "Email verified successfully" });
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!captain.emailVerified || !captain.mobileVerified) {
    // Trigger verification process
    captain.emailOTP = !captain.emailVerified ? generateOTP() : captain.emailOTP;
    captain.lastOtpSent = new Date();

    if (!captain.emailVerified) await sendEmailOTP(captain.email, captain.emailOTP);

    await captain.save();

    return res.status(401).json({
      message: "Please verify your email and/or mobile number",
      captain: { email: captain.email, mobileNumber: captain.mobileNumber },
    });
  }

  const token = captain.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, captain });
};

module.exports.getCaptainProfile = async (req, res, next) => {
  if (!req.captain) {
    // console.log('No captain found in request');
    return res.status(404).json({ message: 'Captain not found' });
  }

  // console.log('Returning captain profile:', req.captain);
  res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await blackListTokenModel.create({ token });
  }

  // console.log("Captain logged out successfully");
  return res.status(200).json({ message: "Logged out" });
};

// New resend OTP endpoint for captains
module.exports.resendOTP = async (req, res) => {
  const { email } = req.body;  // ✅ Removed mobileNumber

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const captain = await captainModel.findOne({ email });

    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    if (captain.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Check cooldown (2 minutes = 120 seconds)
    const lastSent = captain.lastOtpSent || new Date(0);
    const timeDiff = (new Date() - new Date(lastSent)) / 1000;

    if (timeDiff < 120) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil(120 - timeDiff)} seconds before requesting a new OTP`,
      });
    }

    // ✅ Generate and send new email OTP
    captain.emailOTP = generateOTP();
    await sendEmailOTP(captain.email, captain.emailOTP);

    captain.lastOtpSent = new Date();
    await captain.save();

    res.status(200).json({ message: "OTP resent to email successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const captain = await captainModel.findOne({ email }).select("+emailOTP");

  if (!captain) {
    // console.log("Captain not found for email:", email);
    return res.status(404).json({ message: "Captain not found" });
  }

  const otp = generateOTP();
  captain.emailOTP = otp;
  captain.lastOtpSent = new Date();
  await captain.save();
  // console.log("Generated OTP:", otp, "for email:", email);

  try {
    await sendEmailOTP(email, otp);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
module.exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;

  try {
    const captain = await captainModel.findOne({ email }).select("+emailOTP +lastOtpSent");
    if (!captain) {
      // console.log("Captain not found for email:", email);
      return res.status(404).json({ success: false, message: "Captain not found" });
    }

    // console.log("Stored OTP:", captain.emailOTP, "Entered OTP:", otp);

    if (String(captain.emailOTP).trim() !== String(otp).trim()) {
      // console.log("OTP mismatch");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const timeDiff = (new Date() - new Date(captain.lastOtpSent)) / 1000;
    // console.log("Time since OTP sent:", timeDiff, "seconds");
    if (timeDiff > 600) {
      // console.log("OTP expired");
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Password
module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const captain = await captainModel.findOne({ email }).select("+emailOTP +password");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  if (String(captain.emailOTP).trim() !== String(otp).trim()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const timeDiff = (new Date() - new Date(captain.lastOtpSent)) / 1000;
  if (timeDiff > 600) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  captain.password = await captainModel.hashPassword(newPassword);
  captain.emailOTP = undefined; // Clear OTP after use
  await captain.save();

  res.status(200).json({ message: "Password reset successfully" });
};


module.exports.getCaptainEarnings = async (req, res) => {
  try {
    // You can either use req.params.captainId or req.captain._id if authentication middleware sets it.
    const captainId = req.params.captainId || (req.captain && req.captain._id);
    if (!captainId) {
      return res.status(400).json({ message: "Captain ID not provided" });
    }
    const earnings = await captainService.calculateCaptainEarnings(captainId);
    return res.status(200).json({ success: true, earnings });
  } catch (err) {
    console.error("Error calculating captain earnings:", err);
    return res.status(500).json({ message: err.message });
  }
};