const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const dotenv = require('dotenv');
const { sendEmail } = require('../services/communication.service');
const captainModel = require('../models/captain.model');
const paymentService = require('../services/payment.service'); // Added missing import
const blackListTokenModel = require('../models/blackListToken.model'); 
dotenv.config();

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType, rideDate, rideTime, paymentType } = req.body;
  if (!paymentType) {
    return res.status(400).json({ message: "Payment type is required (cash/online)" });
  }

  try {
    // Calculate fare based on pickup and destination
    const fareData = await rideService.getFare(pickup, destination);
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
      throw new Error('Failed to fetch distance and duration');
    }
    // Create the ride in the database with status "pending"
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
      rideDate,
      rideTime,
      paymentType,
      fare: fareData[vehicleType],
      distance: distanceTime.distance,    
      duration: distanceTime.duration,     
      captain: null,
      status: "pending"
    });

    // Get admin email and phone from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE;

    // 🛠 Get all captains and send them a socket event for the new ride
    const captains = await captainModel.find();

    // Retrieve user details for email content
    const user = await userModel.findById(req.user._id);
    // Prepare the email content for the ride request confirmation
    const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Ride Request</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, a { 
            -webkit-text-size-adjust: 100%; 
            -ms-text-size-adjust: 100%; 
        }
        
        /* Prevent Webkit and Windows Mobile platforms from changing default font sizes */
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            min-width: 100% !important; 
            width: 100% !important; 
        }

        /* Responsive container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* Header styles */
        .email-header {
            background-color: #000000;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }

        /* Content styles */
        .email-content {
            padding: 20px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 0;
        }

        .info-label {
            color: #4b5563;
            font-weight: 600;
            flex: 1;
        }

        .info-value {
            color: #111827;
            text-align: right;
            margin-left: 10px;
            flex: 1;
        }

        .fare-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .fare-label {
            color: #4b5563;
            font-weight: 600;
        }

        .fare-value {
            color: #000000;
            font-size: 20px;
            font-weight: bold;
        }

        .email-footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            color: #6b7280;
            font-size: 12px;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                min-width: 100% !important;
            }
            
            .info-row, .fare-row {
                flex-direction: column;
            }
            
            .info-label, .info-value {
                text-align: left;
                margin-left: 0;
                margin-bottom: 5px;
                margin-right: 10px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td class="email-header" align="center">
                            New Ride Request
                        </td>
                    </tr>
                    <tr>
                        <td class="email-content">
                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr class="info-row">
                                    <td class="info-label">User</td>
                                    <td class="info-value" align="right">${user.fullname.firstname} ${user.fullname.lastname}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Email</td>
                                    <td class="info-value" align="right">${user.email}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Phone</td>
                                    <td class="info-value" align="right">${user.mobileNumber}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Pickup</td>
                                    <td class="info-value" align="right">${pickup}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Destination</td>
                                    <td class="info-value" align="right">${destination}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Date</td>
                                    <td class="info-value" align="right">${rideDate}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Time</td>
                                    <td class="info-value" align="right">${rideTime}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Vehicle Type</td>
                                    <td class="info-value" align="right">${vehicleType}</td>
                                </tr>
                                <tr class="info-row">
                                    <td class="info-label">Payment Type</td>
                                    <td class="info-value" align="right">${ride.paymentType}</td>
                                </tr>
                                <tr class="fare-row">
                                    <td class="fare-label">Fare</td>
                                    <td class="fare-value" align="right">₹${fareData[vehicleType]}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="email-footer">
                            Ride Request Confirmation<br> Not a Payment Confirmation
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // Send email to admin and user
    if (adminEmail) {
      await sendEmail(adminEmail, 'New Ride Request', emailContent);
      // console.log(`✅ Confirmation email sent to admin: ${adminEmail}`);
    } else {
      console.error("No admin email provided in environment variables.");
    }

    if (user && user.email) {
      await sendEmail(user.email, 'Thanks for Ride Request', emailContent);
      // console.log(`✅ Confirmation email sent to user: ${user.email}`);
    } else {
      console.error("No recipient email provided for the ride user.");
    }

    res.status(201).json({
      message: "Ride request sent to admin for approval",
      ride
    });

  } catch (err) {
    console.error('Error creating ride:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const { rideId, paymentType } = req.body;

  try {
    const ride = await rideModel.findById(rideId).populate("user");
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    let isPaymentDone = false;

    if (paymentType === "cash") {
      ride.isPaymentDone = false;
      ride.paymentType = "cash";
      await ride.save();
    } else if (paymentType === "online") {
      // For online payments, assume verification was already done via the Razorpay handler.
      ride.isPaymentDone = true;
      ride.paymentType = "online";
      await ride.save();
      isPaymentDone = true;
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    // Prepare confirmation email content
    const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ride Payment Confirmation</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, a { 
            -webkit-text-size-adjust: 100%; 
            -ms-text-size-adjust: 100%; 
        }
        
        /* Prevent Webkit and Windows Mobile platforms from changing default font sizes */
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            min-width: 100% !important; 
            width: 100% !important; 
        }

        /* Responsive container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        /* Header styles */
        .header {
            background-color: #000000;
            color: white;
            padding: 25px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        /* Content styles */
        .content {
            padding: 30px;
        }

        .details-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 10px;
        }

        .detail-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
        }

        .detail-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .detail-value {
            color: #000000;
            font-size: 16px;
            font-weight: 500;
        }

        .payment-status {
            text-align: center;
            padding: 20px;
            margin-top: 20px;
            border-radius: 8px;
            background: #f8f9fa;
        }

        .status-label {
            font-size: 20px;
            font-weight: bold;
        }

        .status-done {
            color: #000000;
        }

        .status-pending {
            color: #666666;
        }

        .footer {
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                min-width: 100% !important;
            }
            
            .details-grid {
                display: block;
                width: 100%;
            }
            
            .detail-item {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td class="header" align="center">
                            <h1>Ride Confirmation</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <table class="details-grid" cellspacing="10" cellpadding="0" border="0">
                                <tr>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Passenger Name</div>
                                        <div class="detail-value">${ride.user.fullname.firstname} ${ride.user.fullname.lastname}</div>
                                    </td>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Email</div>
                                        <div class="detail-value">${ride.user.email}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Pickup Location</div>
                                        <div class="detail-value">${ride.pickup}</div>
                                    </td>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Destination</div>
                                        <div class="detail-value">${ride.destination}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Date & Time</div>
                                        <div class="detail-value">${ride.rideDate} at ${ride.rideTime}</div>
                                    </td>
                                    
                                </tr>
                                <tr>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Fare Amount</div>
                                        <div class="detail-value">₹${ride.fare}</div>
                                    </td>
                                    <td class="detail-item" width="50%">
                                        <div class="detail-label">Payment Method</div>
                                        <div class="detail-value">${ride.paymentType}</div>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td class="payment-status">
                                        <div class="status-label ${isPaymentDone ? 'status-done' : 'status-pending'}">
                                            Payment Status: ${isPaymentDone ? "Done ✅" : "Not Done ❌"}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            Thank you for choosing our service!
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // Send confirmation email to ride user and admin
    if (ride.user && ride.user.email) {
      await sendEmail(ride.user.email, "Ride Confirmation", emailContent);
      // console.log(`✅ Confirmation email sent to user: ${ride.user.email}`);
    } else {
      console.error("No recipient email provided for the ride user.");
    }

    if (process.env.ADMIN_EMAIL) {
      await sendEmail(process.env.ADMIN_EMAIL, "New Ride Payment", emailContent);
      // console.log(`✅ Confirmation email sent to admin: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.error("No admin email provided in environment variables.");
    }

    res.status(200).json({ message: "Ride confirmed successfully", ride });
  } catch (error) {
    console.error("Error confirming ride:", error);
    res.status(500).json({ message: "Error confirming ride" });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
      const ride = await rideService.startRide({ rideId, otp, captain: req.captain });
      // console.log(ride);
      return res.status(200).json(ride);
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
      const ride = await rideService.endRide({ rideId, captain: req.captain });
      return res.status(200).json(ride);
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }
};


module.exports.getPendingRides = async (req, res) => {
  try {
    const pendingRides = await rideModel.find({ status: "pending", captain: null });
    res.status(200).json(pendingRides);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    res.status(500).json({ message: "Error fetching pending rides" });
  }
};

module.exports.getAllAcceptedRides = async (req, res) => {
  try {
    const captainId = req.captain._id; // Assuming req.captain is set by auth middleware
    const rides = await rideModel.find({
      status: { $in: ["accepted", "ongoing", "completed", "cancelled"] },
      captain: captainId
    });
    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
};

module.exports.getCompletedRidesForCaptain = async (req, res) => {
  try {
    const captainId = req.captain._id; // Captain ID from authenticated user (via middleware)
    const completedRides = await rideModel.find({
      captain: captainId,
      status: "completed",
    });
    res.status(200).json(completedRides);
  } catch (error) {
    console.error("Error fetching completed rides:", error);
    res.status(500).json({ message: "Error fetching completed rides" });
  }
};

module.exports.getUserRideHistory = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ user: req.user._id })
      .populate('user', 'fullname profilePhoto')         
      .populate('captain', 'fullname profilePhoto vehicle') 
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports.getRideById = async (req, res) => {
  try {
      const ride = await rideModel.findById(req.params.rideId)
          .populate('user')
          .populate('captain');
      res.status(200).json(ride);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { input } = req.query;

      if (!input || input.length < 3) {
          return res.status(400).json({ message: 'Input must be at least 3 characters long' });
      }

      const suggestions = await mapService.getAutoCompleteSuggestions(input);
      res.status(200).json(suggestions);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
};






