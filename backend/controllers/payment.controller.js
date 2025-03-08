const paymentService = require("../services/payment.service");
const { sendEmail } = require("../services/communication.service");

// ✅ Create Order for Payment Gateway
module.exports.createOrder = async (req, res) => {
  const { amount, rideId } = req.body;
  try {
    const order = await paymentService.createOrder(amount, rideId);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating payment order" });
  }
};

// ✅ Verify Payment
module.exports.verifyPayment = async (req, res) => {
  const { rideId, orderId, transactionId } = req.body;
  try {
    const result = await paymentService.verifyPayment(rideId, orderId, transactionId);

    // 📧 Send Payment Confirmation Email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">Ride Confirmation</h2>
      <p style="font-size: 16px;">Dear Customer,</p>
      <p style="font-size: 16px;">Your ride has been confirmed. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Payment Status:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">Done</td>
        </tr>
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Amount:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${result.ride.fare}</td>
        </tr>
      </table>
      <p style="font-size: 16px;">Thank you for choosing our service.</p>
      <p style="font-size: 16px;">Best Regards,</p>
      <p style="font-size: 16px;">The GatiYan Team</p>
      </div>
    `;

    // Check for user email before sending
    if (result.ride.user && result.ride.user.email) {
      await sendEmail(result.ride.user.email, "Payment Confirmation", emailContent);
    } else {
      console.error("No recipient email provided for the ride user.");
    }

    // Check for admin email in environment variables
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(process.env.ADMIN_EMAIL, "New Ride Payment", emailContent);
    } else {
      console.error("No admin email provided in environment variables.");
    }

    res.json({ message: "Payment verified successfully", ride: result.ride });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
