// Backend/services/captain.service.js
const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
module.exports.createCaptain = async ({
  firstname,
  lastname,
  email,
  password,
  color,
  plate,
  capacity,
  vehicleType,
  profilePhoto,
  mobileNumber,
  drivingLicense,
  emailOTP,
}) => {
  if (
    !firstname ||
    !email ||
    !password ||
    !color ||
    !plate ||
    !capacity ||
    !vehicleType ||
    !mobileNumber ||
    !drivingLicense
  ) {
    throw new Error("All fields are required");
  }
  const captain = await captainModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password,
    vehicle: {
      color,
      plate,
      capacity,
      vehicleType,
    },
    profilePhoto,
    mobileNumber,
    drivingLicense,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    emailOTP,
  });

  return captain;
};

async function calculateCaptainEarnings(captainId) {
  // Find completed rides for the captain
  const rides = await rideModel.find({
    captain: captainId,
    status: "completed"
  });

  const now = new Date();
  let totalEarning = 0;
  let todayEarning = 0;
  let monthlyEarning = 0;
  let yearlyEarning = 0;
  let totalCompletedRides = 0;

  rides.forEach(ride => {
    // Only add fare if:
    // - Payment type is online OR
    // - Payment type is cash and isPaymentDone is true
    if (ride.paymentType === "online" || (ride.paymentType === "cash" && ride.isPaymentDone)) {
      totalEarning += ride.fare;
      totalCompletedRides += 1;
      
      // Use ride.completedAt if available, else updatedAt/createdAt
      const rideDate = new Date(ride.completedAt || ride.updatedAt || ride.createdAt);

      // Check if ride date is today
      if (rideDate.toDateString() === now.toDateString()) {
        todayEarning += ride.fare;
      }
      // Check if ride date is within current month and year
      if (rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear()) {
        monthlyEarning += ride.fare;
      }
      // Check if ride date is within current year
      if (rideDate.getFullYear() === now.getFullYear()) {
        yearlyEarning += ride.fare;
      }
    }
  });

  return { totalEarning, todayEarning, monthlyEarning, yearlyEarning, totalCompletedRides };
}

module.exports = { calculateCaptainEarnings };
