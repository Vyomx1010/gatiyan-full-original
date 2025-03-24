const Admin = require('../models/admin.model');

module.exports.createAdmin = async ({ email, password }) => {
  const hashedPassword = await Admin.hashPassword(password);
  return await Admin.create({ email, password: hashedPassword });
};

// Optional: Keep authenticateAdmin if used elsewhere, but it's not needed for 2SV login
module.exports.authenticateAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) throw new Error('Admin not found');

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = admin.generateAuthToken();
  return token;
};