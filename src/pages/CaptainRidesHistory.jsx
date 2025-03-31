import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";

const CaptainRidesHistory = () => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRide, setModalRide] = useState(null);
  const [okDisabled, setOkDisabled] = useState(true);
  const [modalCountdown, setModalCountdown] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const modalTimerRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  // Fetch rides from backend
  const fetchRides = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${baseUrl}/rides/accepted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        const sortedRides = res.data.sort(
          (a, b) =>
            new Date(b.rideDate + " " + b.rideTime) -
            new Date(a.rideDate + " " + a.rideTime)
        );
        setRides(sortedRides);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      setRides([]);
    }
    setIsLoading(false);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRides();
  }, []);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-500",
      accepted: "bg-orange-500",
      ongoing: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return (
      <span
        className={`${statusStyles[status] || "bg-gray-500"} text-white px-2 py-1 rounded-full text-xs font-medium`}
      >
        {status}
      </span>
    );
  };

  // Refresh handler with cooldown
  const handleRefresh = async () => {
    if (cooldown > 0) return;
    setIsRefreshing(true);
    await fetchRides();
    setIsRefreshing(false);
    setCooldown(25);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Filter rides based on search term
  const filteredRides = rides.filter((ride) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ride.pickup.toLowerCase().includes(term) ||
      ride.destination.toLowerCase().includes(term) ||
      (ride.adminEmail && ride.adminEmail.toLowerCase().includes(term)) ||
      (ride.adminPhone && ride.adminPhone.toLowerCase().includes(term)) ||
      (ride.status && ride.status.toLowerCase().includes(term))
    );
  });

  // Apply top filter selection
  const finalRides =
    selectedFilter === "all"
      ? filteredRides
      : filteredRides.filter((ride) => ride.status === selectedFilter);

  // Open modal for cash payment confirmation
  const handleOpenModal = (ride) => {
    setModalRide(ride);
    setModalVisible(true);
    setOkDisabled(true);
    setModalCountdown(2);
    // Start countdown timer for 2 seconds
    modalTimerRef.current = setInterval(() => {
      setModalCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(modalTimerRef.current);
          setOkDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Close the modal and clear any active timers
  const handleCancelModal = () => {
    setModalVisible(false);
    if (modalTimerRef.current) {
      clearInterval(modalTimerRef.current);
    }
  };

  // Confirm cash payment and update backend & UI
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${baseUrl}/rides/${modalRide._id}/cash-payment-done`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the ride in local state
      const updatedRides = rides.map((ride) => {
        if (ride._id === modalRide._id) {
          return { ...ride, isPaymentDone: true };
        }
        return ride;
      });
      setRides(updatedRides);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating cash payment:", error);
      // Optionally handle error (e.g., show notification)
    }
    setIsProcessingPayment(false);
  };

  return (
    <>
      <Captainnavbar />
      <div className="mt-14 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              🚖 Rides History
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rides..."
                className="px-3 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={handleRefresh}
                disabled={cooldown > 0 || isRefreshing}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm flex items-center gap-1 ${
                  cooldown > 0 || isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isRefreshing
                  ? "Refreshing..."
                  : cooldown > 0
                  ? `Wait ${cooldown}s`
                  : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {/* Responsive Filter Section */}
          <div className="flex flex-wrap gap-2 justify-center my-4">
            {["all", "accepted", "ongoing", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded ${
                    selectedFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Loader / Rides List */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
            </div>
          ) : finalRides.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">No rides available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalRides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                  <div className="flex flex-col justify-between gap-2">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">📍</span>
                        <div>
                          <p className="text-xs text-gray-500">From</p>
                          <p className="text-sm font-medium text-gray-800">
                            {ride.pickup}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">🎯</span>
                        <div>
                          <p className="text-xs text-gray-500">To</p>
                          <p className="text-sm font-medium text-gray-800">
                            {ride.destination}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-800">₹{ride.fare}</p>
                        {getStatusBadge(ride.status)}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Cash Payment Confirmation */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-xl font-bold mb-4">Cash Payment Confirmation</h2>
            <p className="mb-4">Is cash payment done?</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmPayment}
                disabled={okDisabled || isProcessingPayment}
                className={`w-full py-2 rounded ${
                  okDisabled || isProcessingPayment
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner-border animate-spin inline-block w-5 h-5 border-2 rounded-full"></span>
                    Processing...
                  </span>
                ) : okDisabled ? (
                  `OK (${modalCountdown}s)`
                ) : (
                  "OK"
                )}
              </button>
              <button
                onClick={handleCancelModal}
                className="w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CaptainRidesHistory;
