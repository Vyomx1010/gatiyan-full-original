const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  try {
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    
    if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
      throw new Error('Invalid response from GoMaps API');
    }
    
    // console.log("Distance & Time Data:", distanceTime); 

    const baseFare = { 
      'Swift': 30, 
      'Wagon R': 25, 
      'Hyundai i20': 35, 
      'Tiago': 35, 
      'Swift Dzire': 35, 
      'XLG': 45, 
      'Ertiga': 42, 
      'Toyota Innova': 55 
    };
    
    const perKmRate = { 
      'Swift': 26, 
      'Wagon R': 24, 
      'Hyundai i20': 27, 
      'Tiago': 27, 
      'Swift Dzire': 27, 
      'XLG': 31.60, 
      'Ertiga': 31, 
      'Toyota Innova': 40
    };
    
    const perMinuteRate = { 
      'Swift': 0.80, 
      'Wagon R': 0.80, 
      'Hyundai i20': 0.80, 
      'Tiago': 0.80, 
      'Swift Dzire': 1.00, 
      'XLG': 1.20, 
      'Ertiga': 1.20, 
      'Toyota Innova': 1.20 
    };
    
    const fare = {};
    for (const vehicle in baseFare) {
      fare[vehicle] = Math.round(
        baseFare[vehicle] +
        ((distanceTime.distance / 1000) * perKmRate[vehicle]) +
        ((distanceTime.duration / 60) * perMinuteRate[vehicle])
      );
    }
    
    // console.log("Calculated Fare:", fare); // Debugging
    return fare;
    
  } catch (error) {
    console.error('Error in fare calculation:', error.message);
    throw new Error('Fare calculation failed');
  }
}

module.exports.getFare = getFare;

function getOtp(num) {
  // Generate a numeric OTP of length `num`
  return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

module.exports.createRide = async ({
  user, pickup, destination, vehicleType, rideDate, rideTime, paymentType, distance, duration
}) => {
  // Ensure all required fields are provided
  if (!user || !pickup || !destination || !vehicleType || !rideDate || !rideTime || !paymentType) {
    throw new Error('All fields are required');
  }
  const distanceTime = await mapService.getDistanceTime(pickup, destination);
    
  if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
    throw new Error('Invalid response from GoMaps API');
  }
  const fare = await getFare(pickup, destination);

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    rideDate,
    rideTime,
    paymentType, 
    otp: getOtp(6),
    distance,
    duration, 
    fare: fare[vehicleType]
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, {
    status: 'accepted',
    captain: captain._id
  });
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error('Ride id and OTP are required');
  }
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'accepted') {
    throw new Error('Ride not accepted');
  }
  if (ride.otp !== otp) {
    throw new Error('Invalid OTP');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'ongoing' });
  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  const ride = await rideModel.findOne({ _id: rideId, captain: captain._id })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'ongoing') {
    throw new Error('Ride not ongoing');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'completed' });
  return ride;
};


