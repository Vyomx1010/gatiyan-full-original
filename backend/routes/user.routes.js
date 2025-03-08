const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const upload = require("../utils/multer.config"); // Use the custom multer config
const authMiddleware = require("../middlewares/auth.middleware");
const PaymentTransaction = require('../models/PaymentTransaction.model');

router.post(
  "/register",
  upload.single("profilePhoto"), // Use the custom file validation
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("mobileNumber")
      .isLength({ min: 10 })
      .withMessage("Mobile number must be at least 10 characters long"),
  ],
  userController.registerUser
);

router.post(
  "/verify-email-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  ],
  userController.verifyEmailOTP
);

router.post(
  "/verify-mobile-otp",
  [
    body("mobileNumber").isLength({ min: 10 }).withMessage("Invalid Mobile Number"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  ],
  userController.verifyMobileOTP
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);

router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

router.get("/logout", userController.logoutUser);

router.post(
  "/resend-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("mobileNumber").isLength({ min: 10 }).withMessage("Invalid Mobile Number"),
  ],
  userController.resendOTP
);

router.get('/transactions', authMiddleware.authUser, async (req, res) => {
  try {
    const userId = req.user._id; // authUser should attach the user to req.user
    // Find payments and populate the ride field (and within ride, the user)
    let payments = await PaymentTransaction.find()
      .populate({
        path: 'ride',
        match: { user: userId },
        populate: {
          path: 'user',
          select: 'fullname email mobileNumber'
        }
      });
    // Filter out transactions where the ride does not belong to the user
    payments = payments.filter(payment => payment.ride);
    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// Add these new routes
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Invalid Email"),
  ],
  userController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.resetPassword
);

// New verify-otp route
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  ],
  userController.verifyOtp
);

module.exports = router;