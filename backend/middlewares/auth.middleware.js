const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const Admin = require('../models/admin.model');
const blackListTokenModel = require('../models/blackListToken.model');

// Helper function to extract token from cookies or Authorization header
function getTokenFromRequest(req) {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }
  return token;
}

module.exports.authUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
    }
    
    const blacklisted = await blackListTokenModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }
    
    if (token.split('.').length !== 3) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in authUser middleware:", err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
    }
    
    const blacklisted = await blackListTokenModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }
    
    if (token.split('.').length !== 3) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id);
    
    if (!captain) {
      return res.status(401).json({ message: 'Captain not found' });
    }
    
    req.captain = captain;
    // Log after assignment to verify correct value
    console.log('Auth Captain:', req.captain);
    console.log('Querying rides for captain ID:', req.captain._id);
    
    next();
  } catch (err) {
    console.error("Error in authCaptain middleware:", err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports.authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
    }
    
    const blacklisted = await blackListTokenModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }
    
    if (token.split('.').length !== 3) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized: Admin not found' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    console.error("Error in authAdmin middleware:", err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
