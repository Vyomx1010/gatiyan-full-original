const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Import required models and services
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const { sendEmail } = require("../services/communication.service");

const PaymentTransaction = require("../models/PaymentTransaction.model");

// -------------------------------------------
// Helper: HTML Email Template with Styling
// -------------------------------------------
const createEmailTemplate = (heading, messageBody) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f2f2f2; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border: 1px solid #dddddd; }
          .header { background: #007BFF; color: #ffffff; padding: 10px; text-align: center; }
          .content { margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.5; }
          .footer { text-align: center; font-size: 12px; color: #888888; margin-top: 20px; }
          a { color: #007BFF; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${heading}</h2>
          </div>
          <div class="content">
            ${messageBody}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gatiyan. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ------------------------
// Admin Authentication
// ------------------------
router.post("/login", adminController.adminLogin);
router.post("/verify-2sv", adminController.verify2SV);

// ------------------------
// Secure Routes (Admin Only)
// ------------------------
router.get(
  "/dashboard",
  authMiddleware.authAdmin,
  adminController.getDashboardData
);
router.post(
  "/block-user/:id",
  authMiddleware.authAdmin,
  adminController.blockUser
);
router.post(
  "/unblock-user/:id",
  authMiddleware.authAdmin,
  adminController.unblockUser
);

// ------------------------
// Ride Management Endpoints
// ------------------------

// Get all rides
router.get("/rides", authMiddleware.authAdmin, async (req, res) => {
  try {
    const rides = await rideModel
      .find()
      .populate("user", "fullname email mobileNumber")
      .populate("captain", "fullname email");
    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error("Error fetching rides:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get pending rides
router.get("/rides/pending", authMiddleware.authAdmin, async (req, res) => {
  try {
    const rides = await rideModel
      .find({ status: "pending" })
      .populate("user", "fullname email mobileNumber");
    res.status(200).json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update ride status (update only status fields)
// Inside the updateRideStatus route
router.post("/rides/:id/status", authMiddleware.authAdmin, async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === "rejected") {
      updateData.rejectionReason = req.body.reason;
    }

    const ride = await rideModel
      .findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("user", "fullname email mobileNumber socketId")
      .populate("captain", "fullname email");

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // console.log("Updated ride:", ride);

    // Send email notification (existing code remains)
    if (ride.user && ride.user.email) {
      const messageBody = `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ride Status Update</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #fff;
        font-family: Arial, sans-serif;
        color: #000;
      }
      .email-container {
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
      }
      .email-content {
        max-width: 600px;
        margin: 0 auto;
        border: 1px solid #000;
        padding: 30px;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 15px;
      }
      .signature {
        margin-top: 30px;
        font-style: italic;
      }
      @media screen and (max-width: 600px) {
        .email-content {
          padding: 20px;
        }
        h1 {
          font-size: 22px;
        }
        p {
          font-size: 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-content">
        <h1>Hello ${ride.user.fullname.firstname},</h1>
        <!-- Conditional message based on ride status -->
        ${
          req.body.status === "pending"
            ? `
          <p>Your ride request is currently <strong>PENDING</strong>. We are working diligently behind the scenes to find the best match for your journey. We understand that waiting can be challenging, and we truly appreciate your patience as we process your request with care.</p>
        `
            : ""
        }
        ${
          req.body.status === "accepted"
            ? `
          <p>Great news! Your ride request has been <strong>ACCEPTED</strong>. A friendly captain is now on standby and will soon be on their way to ensure you have a comfortable and enjoyable journey. We’re excited to serve you and make your ride experience memorable.</p>
        `
            : ""
        }
        ${
          req.body.status === "ongoing"
            ? `
          <p>Your ride is now <strong>ONGOING</strong>! Our dedicated captain is currently en route to your destination, taking every precaution to ensure a safe and smooth journey. We hope you feel relaxed and cared for throughout your ride.</p>
        `
            : ""
        }
        ${
          req.body.status === "completed"
            ? `
          <p>Thank you for riding with us! Your ride has been <strong>COMPLETED</strong> successfully. We hope the journey was delightful and stress-free. Your trust means the world to us, and we look forward to serving you again in the future.</p>
        `
            : ""
        }
        ${
          req.body.status === "cancelled"
            ? `
          <p>We regret to inform you that your ride request has been <strong>CANCELLED</strong>. We understand how disappointing this can be, and we sincerely apologize for any inconvenience caused. ${
            req.body.reason
              ? `<br /><strong>Reason:</strong> ${req.body.reason}`
              : ""
          } Please know that we are here to assist you and hope to provide a better experience next time.</p>
        `
            : ""
        }
        <p>Thank you for choosing our service and for your continued trust.</p>
        <p class="signature">
          Best regards,<br />
          Gatiyan Team
        </p>
      </div>
    </div>
  </body>
</html>
      `;
      const htmlContent = createEmailTemplate(
        "Ride Status Update",
        messageBody
      );
      try {
        await sendEmail(ride.user.email, "Ride Status Update", htmlContent);
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
      }
    }

    res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error updating ride status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Ride Assignment
router.post("/rides/:id/assign", authMiddleware.authAdmin, async (req, res) => {
  try {
    const ride = await rideModel
      .findById(req.params.id)
      .populate("user captain");
    const captain = await captainModel.findById(req.body.captainId);
    if (!captain)
      return res
        .status(404)
        .json({ success: false, message: "Captain not found" });

    // Assign the captain and update status to "accepted"
    ride.captain = req.body.captainId;
    ride.status = "accepted";

    // If paymentType is missing, set it to a default value
    if (!ride.paymentType) {
      ride.paymentType = "cash";
    }

    await ride.save();

    // Send email notification to the user
    if (ride.user && ride.user.email) {
      const userMessage = `
       <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ride Assignment Notification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        color: #000000;
      }
      .email-container {
        width: 100%;
        padding: 20px;
        background-color: #ffffff;
      }
      .email-content {
        max-width: 600px;
        margin: 0 auto;
        border: 1px solid #000000;
        padding: 30px;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 15px;
      }
      .signature {
        margin-top: 30px;
        font-style: italic;
      }
      .btn {
        display: inline-block;
        background-color: #000000;
        color: #ffffff;
        padding: 10px 20px;
        text-decoration: none;
        margin-top: 20px;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-content">
        <h1>Hello ${ride.user.fullname.firstname} ${ride.user.fullname.lastname},</h1>
        <p>
          Your ride has been assigned to Captain
          <strong>${captain.fullname.firstname} ${captain.fullname.lastname}</strong>.
        </p>
        <p>We will keep you updated with further details. Please feel free to contact us if you have any questions.</p>
        <p>Thank you for choosing our service.</p>
        <p class="signature">Best regards,<br />Gatiyan Team</p>
        <!-- Optionally include a button if needed -->
        <!-- <a href="#" class="btn">View Ride Details</a> -->
      </div>
    </div>
  </body>
</html>

      `;
      await sendEmail(
        ride.user.email,
        "Ride Assigned",
        createEmailTemplate("Ride Assigned", userMessage)
      );
    }
    // Send email notification to the captain
    if (captain.email) {
      const captainMessage = `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Ride Assignment Notification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        color: #000000;
      }
      .email-container {
        width: 100%;
        padding: 20px;
        background-color: #ffffff;
      }
      .email-content {
        max-width: 600px;
        margin: 0 auto;
        border: 1px solid #000000;
        padding: 30px;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 15px;
      }
      .signature {
        margin-top: 30px;
        font-style: italic;
      }
      .btn {
        display: inline-block;
        background-color: #000000;
        color: #ffffff;
        padding: 10px 20px;
        text-decoration: none;
        margin-top: 20px;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-content">
        <h1>Hello ${captain.fullname.firstname},</h1>
        <p>You have a new ride assignment waiting for you.</p>
        <p>
          <strong>Pickup:</strong> ${ride.pickup}<br />
          <strong>Destination:</strong> ${ride.destination}
        </p>
        <p>Please review the details carefully and proceed with the ride at your earliest convenience.</p>
        <p class="signature">
          Best regards,<br />
          Gatiyan Team
        </p>
        <!-- Optionally, include a button for more details -->
        <!-- <a href="#" class="btn">View Ride Details</a> -->
      </div>
    </div>
  </body>
</html>

      `;
      await sendEmail(
        captain.email,
        "New Ride Assignment",
        createEmailTemplate("New Ride Assignment", captainMessage)
      );
    }

    res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error in ride assignment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// End ride
router.post("/rides/:id/end", authMiddleware.authAdmin, async (req, res) => {
  try {
    const ride = await rideModel.findById(req.params.id);
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    ride.status = "completed";
    await ride.save();

    // Email to user
    if (ride.user && ride.user.email) {
      const userMessage = `
        <p>Hello ${ride.user.fullname},</p>
        <p>Your ride has been successfully completed.</p>
        <p>Thank you for riding with us.</p>
      `;
      await sendEmail(
        ride.user.email,
        "Ride Completed",
        createEmailTemplate("Ride Completed", userMessage)
      );
    }
    // Email to captain
    if (ride.captain && ride.captain.email) {
      const captainMessage = `
        <p>Hello ${ride.captain.fullname},</p>
        <p>The ride you were assigned has been marked as completed.</p>
        <p>Thank you for your service.</p>
      `;
      await sendEmail(
        ride.captain.email,
        "Ride Completed",
        createEmailTemplate("Ride Completed", captainMessage)
      );
    }
    res
      .status(200)
      .json({ success: true, message: "Ride ended successfully", ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cancel ride
router.post("/rides/:id/cancel", authMiddleware.authAdmin, async (req, res) => {
  try {
    const ride = await rideModel
      .findById(req.params.id)
      .populate("user captain");
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    ride.status = "cancelled";
    ride.cancellationReason = req.body.reason || "Cancelled by admin";
    await ride.save();

    // Email to user
    if (ride.user && ride.user.email) {
      const userMessage = `
        <p>Hello ${ride.user.fullname},</p>
        <p>Your ride has been cancelled.</p>
        <p>If you have any questions, please contact our support team.</p>
      `;
      await sendEmail(
        ride.user.email,
        "Ride Cancelled",
        createEmailTemplate("Ride Cancelled", userMessage)
      );
    }
    // Email to captain
    if (ride.captain && ride.captain.email) {
      const captainMessage = `
        <p>Hello ${ride.captain.fullname},</p>
        <p>The ride assigned to you has been cancelled.</p>
        <p>Please standby for further assignments.</p>
      `;
      await sendEmail(
        ride.captain.email,
        "Ride Cancelled",
        createEmailTemplate("Ride Cancelled", captainMessage)
      );
    }
    res
      .status(200)
      .json({ success: true, message: "Ride cancelled successfully", ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------
// Payment Management Endpoints
// ------------------------
router.get("/pending-payments", authMiddleware.authAdmin, async (req, res) => {
  try {
    const rides = await rideModel
      .find({ paymentType: "online", isPaymentDone: false })
      .populate("user", "fullname email mobileNumber")
      .populate("captain", "fullname email");
    res.status(200).json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/payments", authMiddleware.authAdmin, async (req, res) => {
  try {
    // First, find all payments and populate the ride field with its user
    let payments = await PaymentTransaction.find().populate({
      path: "ride",
      populate: {
        path: "user",
        select: "fullname email mobileNumber",
      },
    });

    // For payments where ride is null, manually fetch the user details using payment.user
    // (Assuming payment.user is stored as an ObjectId)
    payments = await Promise.all(
      payments.map(async (payment) => {
        if (!payment.ride && payment.user) {
          const userData = await userModel
            .findById(payment.user)
            .select("fullname email mobileNumber");
          // Attach the user data under a new field (or mimic the ride structure)
          // Here, we attach it as payment.userDetails so your frontend can use it.
          payment = payment.toObject();
          payment.userDetails = userData;
        }
        return payment;
      })
    );

    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  "/complete-payment/:rideId",
  authMiddleware.authAdmin,
  async (req, res) => {
    try {
      const ride = await rideModel.findByIdAndUpdate(
        req.params.rideId,
        { isPaymentDone: true },
        { new: true }
      );
      res.status(200).json({ success: true, ride });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ------------------------
// User and Captain Management Endpoints
// ------------------------

// Get all users
router.get("/users", authMiddleware.authAdmin, async (req, res) => {
  try {
    const users = await userModel.find().select("email mobileNumber fullname");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all captains
router.get("/captains", authMiddleware.authAdmin, async (req, res) => {
  try {
    const captains = await captainModel
      .find()
      .select("fullname email status vehicle mobileNumber");
    res.status(200).json({ success: true, captains });
  } catch (err) {
    console.error("Error fetching captains:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Block a captain
router.post(
  "/block-captain/:id",
  authMiddleware.authAdmin,
  async (req, res) => {
    try {
      const captain = await captainModel.findByIdAndUpdate(
        req.params.id,
        { status: "blocked" },
        { new: true }
      );
      if (!captain) {
        return res
          .status(404)
          .json({ success: false, message: "Captain not found" });
      }
      res.status(200).json({ success: true, captain });
    } catch (err) {
      console.error("Error blocking captain:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Unblock a captain
router.post(
  "/unblock-captain/:id",
  authMiddleware.authAdmin,
  async (req, res) => {
    try {
      const captain = await captainModel.findByIdAndUpdate(
        req.params.id,
        { status: "active" },
        { new: true }
      );
      if (!captain) {
        return res
          .status(404)
          .json({ success: false, message: "Captain not found" });
      }
      res.status(200).json({ success: true, captain });
    } catch (err) {
      console.error("Error unblocking captain:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
