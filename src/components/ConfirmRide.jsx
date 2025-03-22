import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLocationArrow, FaMoneyBillWave, FaCreditCard, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ConfirmRide = (props) => {
  // Add local state for isSubmitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedRideId, setConfirmedRideId] = useState(null);

  const {
    pickup,
    destination,
    fare,
    vehicleType,
    rideDate,
    rideTime,
    paymentMethod,
    setRideDate,
    setRideTime,
    setPaymentMethod,
    buttonDisabled,
    onConfirmRideSuccess
  } = props;
  
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleConfirmRide = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Save current ride details to restore after login.
      const pendingRide = {
        pickup,
        destination,
        vehicleType,
        fare: fare[vehicleType],
        rideDate,
        rideTime,
        paymentMethod,
      };
      localStorage.setItem("pendingRide", JSON.stringify(pendingRide));
      // Redirect to login with a redirect instruction.
      navigate("/login", { state: { redirectAfterLogin: "/home" } });
      return;
    }
    
    if (!rideDate || !rideTime) {
      alert("Please select both a date and time for your ride.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const rideData = {
        pickup,
        destination,
        vehicleType,
        fare: fare[vehicleType],
        rideDate,
        rideTime,
        paymentType: paymentMethod,
      };
      const createResponse = await axios.post(
        `${baseUrl}/rides/create`,
        rideData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rideId = createResponse.data.ride._id;

      if (paymentMethod === "online") {
        if (!window.Razorpay) {
          alert("Razorpay SDK failed to load. Please check your internet connection.");
          setIsSubmitting(false);
          return;
        }
        const { data } = await axios.post(
          `${baseUrl}/payments/create-order`,
          { amount: fare[vehicleType], rideId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const options = {
          key: razorpayKey,
          amount: data.amount,
          currency: data.currency,
          order_id: data.id,
          name: "My Ride App",
          description: "Ride Payment",
          handler: function (response) {
            axios
              .post(
                `${baseUrl}/payments/verify-payment`,
                {
                  rideId,
                  orderId: data.id,
                  transactionId: response.razorpay_payment_id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then(() => {
                confirmRideAPI(rideId);
              })
              .catch((error) => {
                alert(
                  error.response?.data?.message ||
                    "An error occurred during payment verification."
                );
              });
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        confirmRideAPI(rideId);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred while confirming your ride"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmRideAPI = (rideId) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `${baseUrl}/rides/confirm`,
        { rideId, paymentType: paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setConfirmedRideId(rideId);
        setShowConfirmation(true);
        onConfirmRideSuccess && onConfirmRideSuccess({ rideId });
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred while confirming your ride"
        );
      });
  };

  if (showConfirmation) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg relative max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Ride Confirmed!</h2>
        <p className="text-lg text-gray-700 mb-6">Your ride has been successfully booked. We're looking forward to serving you!</p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-600 mb-1">Ride ID: <span className="font-medium">{confirmedRideId}</span></p>
          <p className="text-gray-600 mb-1">From: <span className="font-medium">{pickup}</span></p>
          <p className="text-gray-600 mb-1">To: <span className="font-medium">{destination}</span></p>
          <p className="text-gray-600 mb-1">Date: <span className="font-medium">{rideDate}</span></p>
          <p className="text-gray-600">Time: <span className="font-medium">{rideTime}</span></p>
        </div>
        <button 
          onClick={() => navigate("/home")} 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg relative max-w-md mx-auto border border-gray-100">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
      
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Book Your Ride</h3>
      
      <div className="w-full space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{pickup}</h3>
              <p className="text-sm text-gray-600">Pickup Location</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FaLocationArrow className="text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{destination}</h3>
              <p className="text-sm text-gray-600">Drop-off Location</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FaCar className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Type</p>
              <h3 className="text-lg font-semibold text-gray-800 capitalize">{vehicleType}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Fare</p>
            <h3 className="text-xl font-bold text-green-600">₹{fare[vehicleType]}</h3>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-semibold mb-3 text-gray-800">Payment Method</h4>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${paymentMethod === "cash" ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="hidden"
              />
              <FaMoneyBillWave className={`${paymentMethod === "cash" ? "text-green-600" : "text-gray-500"}`} />
              <span className={`font-medium ${paymentMethod === "cash" ? "text-green-600" : "text-gray-700"}`}>Cash</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="hidden"
              />
              <FaCreditCard className={`${paymentMethod === "online" ? "text-blue-600" : "text-gray-500"}`} />
              <span className={`font-medium ${paymentMethod === "online" ? "text-blue-600" : "text-gray-700"}`}>Online</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="text-md font-semibold mb-1 text-gray-800">Schedule Your Ride</h4>
          
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Date:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaCalendarAlt className="text-gray-500" />
              </span>
              <input
                className="border border-gray-300 pl-10 pr-3 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="date"
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Time:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaClock className="text-gray-500" />
              </span>
              <input
                className="border border-gray-300 pl-10 pr-3 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="time"
                value={rideTime}
                onChange={(e) => setRideTime(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleConfirmRide}
        disabled={isSubmitting || props.buttonDisabled}
        className={`w-full mt-6 font-bold p-4 rounded-lg text-white transition-all text-lg
          ${isSubmitting || props.buttonDisabled 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"}`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirming...
          </div>
        ) : (
          "Confirm Ride"
        )}
      </button>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        By confirming, you agree to our terms of service and cancellation policy.
      </p>
    </div>
  );
};

export default ConfirmRide;