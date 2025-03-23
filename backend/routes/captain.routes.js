const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const captainController = require("../controllers/captain.controller");
const upload = require("../utils/multer.config"); // Use the custom multer config
const authMiddleware = require("../middlewares/auth.middleware");

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
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
      body("vehicle.vehicleType")
      .isString()
      .isIn(["Swift", "Wagon R", "Hyundai i20", "Tiago", "Swift Dzire", "XLG", "Ertiga", "Toyota Innova"])
      .withMessage("Invalid vehicle type"),    
    body("mobileNumber")
      .isLength({ min: 10 })
      .withMessage("Mobile number must be at least 10 characters long"),
    body("drivingLicense")
      .isLength({ min: 5 })
      .withMessage("Driving license must be at least 5 characters long"),
  ],
  captainController.registerCaptain
);

router.post(
  "/verify-email-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  ],
  captainController.verifyEmailOTP
);



router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain
);

router.get('/profile', (req, res, next) => {
  // console.log('Route - /captains/profile invoked');
  next();
}, authMiddleware.authCaptain, captainController.getCaptainProfile);
router.get("/logout", authMiddleware.authCaptain, captainController.logoutCaptain);

// router.get("/dashboard/:captainId", captainController.getCaptainDashboard);

router.post(
  "/resend-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
  ],
  captainController.resendOTP
);

// New routes
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Invalid Email"),
  ],
  captainController.forgotPassword
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
  captainController.resetPassword
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  ],
  captainController.verifyOtp
);

module.exports = router;