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
    if (ride.paymentType === "online" || (ride.paymentType === "cash" && ride.isPaymentDone)) {
      totalEarning += ride.fare;
      totalCompletedRides += 1;
      
      const rideDate = new Date(ride.completedAt || ride.updatedAt || ride.createdAt);
      console.log(`Ride ${ride._id}: Date=${rideDate}, Fare=${ride.fare}, Payment=${ride.paymentType}, Done=${ride.isPaymentDone}`);

      if (rideDate.toDateString() === now.toDateString()) {
        todayEarning += ride.fare;
      }
      if (rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear()) {
        monthlyEarning += ride.fare;
      }
      if (rideDate.getFullYear() === now.getFullYear()) {
        yearlyEarning += ride.fare;
      }
    }
  });

  console.log(`Earnings for ${captainId}: Total=${totalEarning}, Today=${todayEarning}, Monthly=${monthlyEarning}`);
  return { totalEarning, todayEarning, monthlyEarning, yearlyEarning, totalCompletedRides };
}

module.exports = { calculateCaptainEarnings };
