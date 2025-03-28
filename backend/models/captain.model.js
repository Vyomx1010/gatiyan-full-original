// Backend/models/captain.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, 'Firstname must be at least 3 characters long'],
    },
    lastname: {
      type: String,
      minlength: [3, 'Lastname must be at least 3 characters long'],
    },
  },
  dob:{
    type: String,
  },
  gender:{
    type: String,
  },
  totalearning:{
    type: String,
  },
  isonlinepaymentdone:{
    type: Boolean,
  },
  iscashpaymentdone:{
    type: Boolean,
  },
  todayearning:{
    type: String,
  },
  Monthlyearning:{
    type: String,
  },
  totalrides:{
    type: String,
  },
  totalridescompleted:{
    type: String,
  },
  totalridescancelled:{
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  vehicle: {
    color: {
      type: String,
      required: true,
      minlength: [3, 'Color must be at least 3 characters long'],
    },
    plate: {
      type: String,
      required: true,
      minlength: [3, 'Plate must be at least 3 characters long'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Swift', 'Wagon R', 'Hyundai i20', 'Tiago', 'Swift Dzire', 'XLG', 'Ertiga', 'Toyota Innova'],
    },    
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  drivingLicense: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  emailOTP: {
    type: String,
    select: false,
  },
  mobileOTP: {
    type: String,
    select: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  mobileVerified: {
    type: Boolean,
    default: true,
  },
  lastOtpSent: {
    type: Date,
    default: null, // Tracks the last time an OTP was sent for cooldown
  },
});

captainSchema.index({ location: '2dsphere' });

captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return token;
};

captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;