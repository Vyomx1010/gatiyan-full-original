import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ConfirmRide = (props) => {
  // Add local state for isSubmitting
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    buttonDisabled, // received from Home (optional, may be used additionally)
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

  return (
    <div className="bg-white p-4 rounded-lg shadow relative">
      <h3 className="text-2xl font-semibold mb-5 text-center">Confirm your Ride</h3>
      <div className="w-full">
        <div className="p-3 border-b-2">
          <h3 className="text-lg font-medium">{pickup}</h3>
          <p className="text-sm text-gray-600">Pickup Location</p>
        </div>
        <div className="p-3 border-b-2">
          <h3 className="text-lg font-medium">{destination}</h3>
          <p className="text-sm text-gray-600">Drop-off Location</p>
        </div>
        <div className="p-3 border-b-2">
          <h3 className="text-lg font-medium">₹{fare[vehicleType]}</h3>
          <p className="text-sm text-gray-600">{vehicleType}</p>
        </div>

        <div className="p-3 border-b-2">
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              Cash Payment
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Online Payment
            </label>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Select Ride Date:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <FaCalendarAlt className="text-gray-500" />
              </span>
              <input
                className="border border-gray-300 pl-10 pr-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              Select Ride Time:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <FaClock className="text-gray-500" />
              </span>
              <input
                className="border border-gray-300 pl-10 pr-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
        className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg hover:bg-green-700 transition-all"
      >
        {isSubmitting ? "Confirming..." : "Confirm Ride"}
      </button>
    </div>
  );
};

export default ConfirmRide;
