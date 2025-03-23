const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const dotenv = require('dotenv');
const { sendEmail } = require('../services/communication.service');
const captainModel = require('../models/captain.model');
const paymentService = require('../services/payment.service'); // Added missing import

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
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Ride Request</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; }
              .email-container { background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
              .email-header { background-color: #2563eb; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
              .email-content { padding: 20px; }
              .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
              .info-label { color: #4b5563; font-weight: 600; }
              .info-value { color: #111827; text-align: right; margin-left: 10px; }
              .fare-row { display: flex; justify-content: space-between; padding: 15px 0; }
              .fare-value { color: #10b981; font-size: 20px; }
              .email-footer { background-color: #f9fafb; text-align: center; padding: 10px; color: #6b7280; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">New Ride Request</div>
              <div class="email-content">
                  <div class="info-row">
                      <span class="info-label">User</span>
                      <span class="info-value">${user.fullname.firstname} ${user.fullname.lastname}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Email</span>
                      <span class="info-value">${user.email}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Phone</span>
                      <span class="info-value">${user.mobileNumber}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Pickup</span>
                      <span class="info-value">${pickup}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Destination</span>
                      <span class="info-value">${destination}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Date:</span>
                      <span class="info-value">${rideDate}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Time:</span>
                      <span class="info-value">${rideTime}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Vehicle Type</span>
                      <span class="info-value">${vehicleType}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label"><strong>Payment Type:</strong></span>
                      <span class="info-value">${ride.paymentType}</span>
                  </div>
                  <div class="fare-row">
                      <span>Fare</span>
                      <span class="fare-value">₹${fareData[vehicleType]}</span>
                  </div>
              </div>
              <div class="email-footer">Ride Request Confirmation</div>
          </div>
      </body>
      </html>
    `;

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
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 25px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .detail-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .detail-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #333;
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
            color: #2e7d32;
          }
          .status-pending {
            color: #c62828;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Ride Confirmation</h1>
          </div>
          <div class="content">
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Passenger Name</div>
                <div class="detail-value">${ride.user.fullname.firstname} ${ride.user.fullname.lastname}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${ride.user.email}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Pickup Location</div>
                <div class="detail-value">${ride.pickup}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Destination</div>
                <div class="detail-value">${ride.destination}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date & Time</div>
                <div class="detail-value">${ride.rideDate} at ${ride.rideTime}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Vehicle Type</div>
                <div class="detail-value">${ride.vehicleType}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fare Amount</div>
                <div class="detail-value">₹${ride.fare}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value">${ride.paymentType}</div>
              </div>
            </div>
            <div class="payment-status">
              <div class="status-label ${isPaymentDone ? 'status-done' : 'status-pending'}">
                Payment Status: ${isPaymentDone ? "Done ✅" : "Not Done ❌"}
              </div>
            </div>
          </div>
          <div class="footer">
            Thank you for choosing our service!
          </div>
        </div>
      </body>
      </html>
    `;

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

module.exports.getUserRideHistory = async (req, res) => {
  try {
    const rides = await rideModel
      .find({ user: req.user._id })
      .populate('captain', 'fullname vehicle')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getCaptainRideHistory = async (req, res) => {
  try {
      const rides = await rideModel.find({ captain: req.captain._id }).sort({ createdAt: -1 });
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

module.exports.getAllRidesForCaptains = async (req, res) => {
  try {
      // console.log("🚀 Fetching pending rides for captains...");

      const rides = await rideModel.find({ status: "pending" })
          .select("pickup destination rideDate rideTime fare status createdAt")
          .sort({ rideDate: -1, rideTime: -1, createdAt: -1 }); // Latest rides first

      // console.log("✅ Total Pending Rides Fetched:", rides.length);
      res.status(200).json(rides);
  } catch (err) {
      console.error("❌ Error fetching rides:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getCaptainEarnings = async (req, res) => {
  try {
    const { captainId } = req.params;

    // Fetch all completed rides for the captain
    const rides = await rideModel.find({ 
      captain: captainId, 
      status: "completed" 
    });

    // Define time boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate earnings
    const todayEarnings = rides
      .filter(ride => new Date(ride.updatedAt) >= today)
      .reduce((sum, ride) => sum + (ride.fare || 0), 0);

    const monthlyEarnings = rides
      .filter(ride => new Date(ride.updatedAt) >= monthStart)
      .reduce((sum, ride) => sum + (ride.fare || 0), 0);

    const totalEarnings = rides
      .reduce((sum, ride) => sum + (ride.fare || 0), 0);

    res.status(200).json({
      success: true,
      earnings: {
        today: todayEarnings,
        monthly: monthlyEarnings,
        total: totalEarnings,
        completedRides: rides.length
      }
    });
  } catch (err) {
    console.error("Error fetching captain earnings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
