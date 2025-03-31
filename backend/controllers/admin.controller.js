const adminService = require('../services/admin.service');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const rideModel = require('../models/ride.model');
const paymentModel = require('../models/PaymentTransaction.model');
const Admin = require('../models/admin.model');
const { generateOTP } = require('../utils/otp.utils');
const { sendEmailOTP } = require('../services/communication.service');

module.exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate and store OTP for 2SV
    const code = generateOTP();
    admin.twoFactorCode = code;
    admin.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await admin.save();

    // Send OTP to admin's email
    await sendEmailOTP(admin.email, code);

    res.status(200).json({ message: '2SV code sent to your email', email });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.verify2SV = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    // Verify OTP
    if (
      admin.twoFactorCode !== code.trim() ||
      Date.now() > admin.twoFactorExpires
    ) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    // OTP is valid, issue token and clear OTP fields (ensures one-time use)
    const token = admin.generateAuthToken();
    admin.twoFactorCode = null;
    admin.twoFactorExpires = null;
    await admin.save();

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalCaptains = await captainModel.countDocuments();
    const pendingRides = await rideModel.countDocuments({ status: 'pending' });
    const completedRides = await rideModel.countDocuments({ status: 'completed' });
    const totalEarnings = await paymentModel.aggregate([
      { $match: { paymentStatus: 'done' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      totalUsers,
      totalCaptains,
      pendingRides,
      completedRides,
      totalEarnings: totalEarnings[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.blockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: 'blocked' },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.unblockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};