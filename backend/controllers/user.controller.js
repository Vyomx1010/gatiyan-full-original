const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP } = require("../services/communication.service");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, mobileNumber } = req.body;
  const profilePhoto = req.file ? req.file.path : "";

  console.log("Registering user with data:", {
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    mobileNumber,
  });

  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith("+91")) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  try {
    // Check if email or mobile already exists
    const existingUserByEmail = await userModel.findOne({ email });
    const existingUserByMobile = await userModel.findOne({ mobileNumber: formattedMobileNumber });
    
    let user;

    if (existingUserByEmail || existingUserByMobile) {
      // If both email and mobile are fully verified, reject duplicate signup
      if (existingUserByEmail?.emailVerified && existingUserByEmail?.mobileVerified) {
        return res.status(400).json({ message: "Account with this email is already fully verified." });
      }
      if (existingUserByMobile?.emailVerified && existingUserByMobile?.mobileVerified) {
        return res.status(400).json({ message: "Account with this mobile number is already fully verified." });
      }

      // Handle partial verification or mismatched data
      user = existingUserByEmail || existingUserByMobile;

      // Update unverified fields if they differ
      if (!user.emailVerified && email !== user.email) {
        user.email = email;
      }
      if (!user.mobileVerified && formattedMobileNumber !== user.mobileNumber) {
        user.mobileNumber = formattedMobileNumber;
      }

      // Generate new OTPs
      const emailOTP = generateOTP();
      console.log("Generated EMAIL OTP:", emailOTP);

      user.emailOTP = emailOTP;
      user.password = await userModel.hashPassword(password); // Update password if changed
      user.fullname = { firstname: fullname.firstname, lastname: fullname.lastname };
      user.profilePhoto = profilePhoto;
      user.lastOtpSent = new Date(); // Track OTP send time

      await user.save();
    } else {
      // New user signup
      const hashedPassword = await userModel.hashPassword(password);
      const emailOTP = generateOTP();
      console.log("Generated EMAIL OTP:", emailOTP);

      user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        profilePhoto,
        mobileNumber: formattedMobileNumber,
        emailOTP,
        lastOtpSent: new Date(), // Track OTP send time
      });
    }

    // Send OTPs
    await sendEmailOTP(user.email, user.emailOTP);

    console.log("OTP sent to email and mobile number");

    res.status(201).json({
      message: "OTP sent to email and mobile number",
      user: { email: user.email, mobileNumber: user.mobileNumber },
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate key error:", error);
      let field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Duplicate value found for ${field}. Please use a different ${field}.`,
      });
    }
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.verifyEmailOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const normalizedOTP = otp.trim();
  const user = await userModel.findOne({ email }).select("+emailOTP");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const storedOTP = user.emailOTP.trim();

  console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (String(storedOTP).trim() !== String(normalizedOTP).trim()) {
    console.log(`Email: ${email}, Entered OTP: ${normalizedOTP}, Stored OTP: ${storedOTP}`);
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.emailVerified = true;
  await user.save();

  console.log("Email verified successfully for:", email);

  res.status(200).json({ message: "Email verified successfully" });
};



module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.emailVerified || !user.mobileVerified) {
    // Trigger verification process
    user.emailOTP = !user.emailVerified ? generateOTP() : user.emailOTP;
    user.lastOtpSent = new Date();

    if (!user.emailVerified) await sendEmailOTP(user.email, user.emailOTP);

    await user.save();

    return res.status(401).json({
      message: "Please verify your email and/or mobile number",
      user: { email: user.email, mobileNumber: user.mobileNumber },
    });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token);

  console.log("User logged in successfully:", email);

  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log("User not found in request.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Fetching user profile for:", req.user.email);

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await blackListTokenModel.create({ token });
  }

  console.log("User logged out successfully");
  return res.status(200).json({ message: "Logged out" });
};

// Resend OTP endpoint
module.exports.resendOTP = async (req, res) => {
  const { email, mobileNumber } = req.body;

  if (!email || !mobileNumber) {
    return res.status(400).json({ message: "Email and mobile number are required" });
  }

  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith("+91")) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  try {
    const user = await userModel.findOne({
      $or: [{ email }, { mobileNumber: formattedMobileNumber }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified && user.mobileVerified) {
      return res.status(400).json({ message: "Account is already fully verified" });
    }

    // Check cooldown (2 minutes = 120 seconds)
    const lastSent = user.lastOtpSent || new Date(0);
    const timeDiff = (new Date() - new Date(lastSent)) / 1000;
    if (timeDiff < 120) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil(120 - timeDiff)} seconds before requesting a new OTP`,
      });
    }

    // Generate and send new OTPs
    if (!user.emailVerified) {
      user.emailOTP = generateOTP();
      await sendEmailOTP(user.email, user.emailOTP);
    }

    user.lastOtpSent = new Date();
    await user.save();

    res.status(200).json({ message: "OTP resent to email and/or mobile number" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add these methods
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email }).select("+emailOTP");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = generateOTP();
  user.emailOTP = otp;
  user.lastOtpSent = new Date();
  await user.save();

  try {
    await sendEmailOTP(email, otp);
    res.status(200).json({ сообщение: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// Verify OTP endpoint
module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+emailOTP +lastOtpSent");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(user.emailOTP).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check OTP expiry (10 minutes)
    const timeDiff = (new Date() - new Date(user.lastOtpSent)) / 1000;
    if (timeDiff > 600) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password endpoint (updated)
module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+emailOTP +password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP again (redundancy for security)
    if (String(user.emailOTP).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const timeDiff = (new Date() - new Date(user.lastOtpSent)) / 1000;
    if (timeDiff > 600) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Reset password
    user.password = await userModel.hashPassword(newPassword);
    user.emailOTP = undefined; // Clear OTP after use
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};