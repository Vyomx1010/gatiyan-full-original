const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post(
  "/create",
  authMiddleware.authUser,
  body("pickup").isString().isLength({ min: 3 }).withMessage("Invalid pickup address"),
  body("destination").isString().isLength({ min: 3 }).withMessage("Invalid destination address"),
  body("vehicleType")
    .isString()
    .isIn([
      "Swift", 
      "Wagon R", 
      "Hyundai i20", 
      "Tiago", 
      "Swift Dzire", 
      "XLG", 
      "Ertiga", 
      "Toyota Innova"
    ])
    .withMessage("Invalid vehicle type"),
  body("rideDate").isString().notEmpty().withMessage("Ride date is required"),
  body("rideTime").isString().notEmpty().withMessage("Ride time is required"),
  body("paymentType").isString().isIn(["cash", "online"]).withMessage("Invalid payment type"),
  rideController.createRide
);


router.get('/get-fare',
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
)
  router.get('/captain/all', authMiddleware.authCaptain, rideController.getAllRidesForCaptains);




router.post('/confirm',
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.get('/:rideId', authMiddleware.authUser, rideController.getRideById);

// Backend/routes/ride.routes.js
router.get('/user/history', authMiddleware.authUser, rideController.getUserRideHistory);

// Route to get captain's ride history
router.get('/captain-history', authMiddleware.authCaptain, rideController.getCaptainRidesHistory);
// Route to confirm cash payment for a ride
router.post('/confirm-payment/:rideId', authMiddleware.authCaptain, rideController.confirmCashPayment);

module.exports = router;