import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLocationArrow, FaMoneyBillWave, 
  FaCreditCard, FaCar, FaReceipt, FaUser, FaShieldAlt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ConfirmRide = (props) => {
  // Existing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedRideId, setConfirmedRideId] = useState(null);
  // State for loader and payment popups
  const [showLoader, setShowLoader] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [pendingConfirmRideId, setPendingConfirmRideId] = useState(null);

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
      navigate("/login", { state: { redirectAfterLogin: "/home" } });
      return;
    }
    
    if (!rideDate || !rideTime) {
      alert("Please select both a date and time for your ride.");
      return;
    }
    
    // Start loader and submission
    setShowLoader(true);
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
          setShowLoader(false);
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
                // Show payment success popup instead of immediately confirming ride
                setPendingConfirmRideId(rideId);
                setShowPaymentSuccess(true);
              })
              .catch((error) => {
                setPaymentError(
                  error.response?.data?.message ||
                  "An error occurred during payment verification."
                );
                setShowPaymentError(true);
                setShowLoader(false);
              });
          },
          modal: {
            ondismiss: function () {
              setPaymentError("Payment cancelled by user");
              setShowPaymentError(true);
              setShowLoader(false);
            },
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        // For cash payments, confirm the ride directly
        confirmRideAPI(rideId);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred while confirming your ride"
      );
      setShowLoader(false);
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
        setShowLoader(false);
        onConfirmRideSuccess && onConfirmRideSuccess({ rideId });
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred while confirming your ride"
        );
        setShowLoader(false);
      });
  };

  // Ride Confirmation Screen with Congratulations message
  if (showConfirmation) {
    return (
      <div className="relative max-w-xl mx-auto my-8 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-fadeIn">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400"></div>
        
        <div className="text-center">
          <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 shadow-md flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse-slow">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 mb-3">
            Awesome!
          </h2>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Your Ride is Confirmed</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">
            We're excited to get you to your destination safely and comfortably. A driver will be assigned shortly.
          </p>
          {/* Ride Details */}
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm mb-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Booking Details</h3>
              <div className="px-3 py-1 text-xs font-bold text-gray-600 border rounded-full border-gray-200">
                Ride #{confirmedRideId?.substring(0, 8)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm font-medium text-gray-800">{pickup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCar className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{vehicleType}</p>
                  </div>
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaCalendarAlt className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-medium text-gray-800">{rideDate} at {rideTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <FaMoneyBillWave className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate("/home")} 
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Return to Home
            </button>
            <button 
              onClick={() => navigate("/rides")} 
              className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              View My Rides
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Payment Error Popup */}
      {showPaymentError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 mx-4 max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Payment Error</h2>
            <p className="mb-4">{paymentError}</p>
            <button 
              onClick={() => setShowPaymentError(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Popup */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 mx-4 max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Payment Successful</h2>
            <p className="mb-4">Your payment was successful. Thanks for Booking.</p>
            <button 
              onClick={() => {
                setShowPaymentSuccess(false);
                confirmRideAPI(pendingConfirmRideId);
              }}
              className="w-full px-4 py-2 bg-green-500 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Global Loader Overlay (render only if no modals are active) */}
      {showLoader && !showPaymentSuccess && !showPaymentError && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-40">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Main Booking Form */}
      <div className="bg-white rounded-3xl shadow-xl relative max-w-xl mx-auto my-8 overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-indigo-100 rounded-full transform translate-x-16 -translate-y-16 opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-full transform -translate-x-16 translate-y-16 opacity-20 pointer-events-none"></div>
        
        <div className="p-7 sm:p-8">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <FaCar className="text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Book Your Ride
            </h3>
          </div>
          
          <div className="w-full space-y-6">
            {/* Locations card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl space-y-4 shadow-sm border border-blue-100/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-inner">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Pickup Location</p>
                  <h3 className="text-base font-semibold text-gray-800">{pickup}</h3>
                </div>
              </div>
              
              <div className="relative pl-5 ml-5">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-indigo-300 rounded-full"></div>
                <div className="w-2 h-2 absolute left-0 top-0 rounded-full bg-blue-400 -translate-x-0.75"></div>
                <div className="w-2 h-2 absolute left-0 top-1/3 rounded-full bg-indigo-400 -translate-x-0.75"></div>
                <div className="w-2 h-2 absolute left-0 top-2/3 rounded-full bg-indigo-400 -translate-x-0.75"></div>
                <div className="w-2 h-2 absolute left-0 bottom-0 rounded-full bg-purple-400 -translate-x-0.75"></div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-inner">
                    <FaLocationArrow className="text-indigo-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Drop-off Location</p>
                  <h3 className="text-base font-semibold text-gray-800">{destination}</h3>
                </div>
              </div>
            </div>

            {/* Vehicle and fare card */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-inner border border-green-200/50">
                  <FaCar className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Vehicle Type</p>
                  <h3 className="text-base font-semibold text-gray-800 capitalize">{vehicleType}</h3>
                </div>
              </div>
              <div className="text-right bg-white py-2 px-4 rounded-xl shadow-sm border border-green-100">
                <p className="text-xs text-green-600 font-medium">Fare</p>
                <h3 className="text-xl font-bold text-green-600">₹{fare[vehicleType]}</h3>
              </div>
            </div>

            {/* Payment method card */}
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50">
              <h4 className="text-md font-semibold mb-4 text-gray-800 flex items-center">
                <FaCreditCard className="mr-2 text-gray-600" />
                Payment Method
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <label className={`group flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${
                  paymentMethod === "cash" 
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 shadow-sm" 
                    : "bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="hidden"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    paymentMethod === "cash" 
                      ? "bg-green-400 text-white" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}>
                    <FaMoneyBillWave className="text-lg" />
                  </div>
                  <span className={`font-medium transition-colors ${paymentMethod === "cash" ? "text-green-700" : "text-gray-700"}`}>Cash</span>
                </label>
                
                <label className={`group flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${
                  paymentMethod === "online" 
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 shadow-sm" 
                    : "bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="hidden"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    paymentMethod === "online" 
                      ? "bg-blue-400 text-white" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}>
                    <FaCreditCard className="text-lg" />
                  </div>
                  <span className={`font-medium transition-colors ${paymentMethod === "online" ? "text-blue-700" : "text-gray-700"}`}>Online</span>
                </label>
              </div>
            </div>

            {/* Schedule card */}
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl space-y-4 shadow-sm border border-gray-200/50">
              <h4 className="text-md font-semibold mb-1 text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-600" /> 
                Schedule Your Ride
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Date:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FaCalendarAlt className="text-blue-500" />
                    </span>
                    <input
                      className="border border-gray-300 pl-11 pr-4 py-3.5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      type="date"
                      value={rideDate}
                      onChange={(e) => setRideDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Time:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FaClock className="text-blue-500" />
                    </span>
                    <input
                      className="border border-gray-300 pl-11 pr-4 py-3.5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      type="time"
                      value={rideTime}
                      onChange={(e) => setRideTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Driver info (decorative) */}
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Your driver will be</p>
                  <p className="text-base font-medium text-gray-800">Assigned after confirmation</p>
                </div>
                <div className="w-24 text-center">
                  <div className="text-xs text-gray-500 mb-1">Estimated ETA</div>
                  <div className="text-sm font-semibold text-blue-600">5-10 mins</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirm Button */}
          <button
            onClick={handleConfirmRide}
            disabled={isSubmitting || props.buttonDisabled}
            className={`w-full mt-7 font-bold p-4 rounded-xl text-white text-lg relative overflow-hidden transition-all
              ${isSubmitting || props.buttonDisabled 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg"}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Your Booking...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2"></span>
                Confirm & Book Now
              </span>
            )}
          </button>
          
          {/* Benefits Section */}
          <div className="mt-6 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start space-x-3">
            <FaShieldAlt className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Ride with confidence</p>
              <p className="text-xs text-blue-600">All rides are insured, and drivers are verified for your safety.</p>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            By confirming, you agree to our <a href="#" className="text-blue-600 hover:underline font-medium">terms of service</a> and <a href="#" className="text-blue-600 hover:underline font-medium">cancellation policy</a>.
          </p>
        </div> 
      </div>
    </>
  );
};

export default ConfirmRide;
