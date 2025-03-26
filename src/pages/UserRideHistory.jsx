import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaWallet, FaUser, FaSyncAlt } from "react-icons/fa";
import Usersnavbar from "../components/Usersnavbar";

const UserRideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  // New state for image preview
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const statusTabs = [
    { key: "all", label: "All", color: "gray" },
    { key: "pending", label: "Pending", color: "yellow" },
    { key: "accepted", label: "Accepted", color: "purple" },
    { key: "ongoing", label: "Ongoing", color: "blue" },
    { key: "completed", label: "Completed", color: "green" },
    { key: "cancelled", label: "Cancelled", color: "red" },
  ];

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/user/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Fetched Rides:", res.data);
      setRides(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch ride history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const handleRefresh = () => {
    if (refreshCooldown === 0) {
      fetchRideHistory();
      setRefreshCooldown(30);
    }
  };

  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setInterval(() => {
        setRefreshCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [refreshCooldown]);

  const filteredRides = () => {
    if (activeTab === "all") return rides;
    return rides.filter((ride) => ride.status.toLowerCase() === activeTab);
  };

  // Opens ride details modal
  const handleCardClick = (ride) => {
    setSelectedRide(ride);
    setShowModal(true);
  };

  // Opens image preview modal with larger image
  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowImagePreview(true);
  };

  const renderRideCard = (ride) => (
    <motion.div
      key={ride._id}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => handleCardClick(ride)}
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 truncate">
        {ride.pickup} to {ride.destination}
      </h3>
      <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
        <div className="flex items-center">
          <FaCalendarAlt className="text-blue-600 mr-2" />
          <p className="text-gray-700 truncate">
            <strong>Date:</strong> {ride.rideDate}
          </p>
        </div>
        <div className="flex items-center">
          <FaClock className="text-blue-600 mr-2" />
          <p className="text-gray-700 truncate">
            <strong>Time:</strong> {ride.rideTime}
          </p>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-red-600 mr-2" />
          <p className="text-gray-700">
            <strong>Status:</strong>{" "}
            <span
              className={`${
                ride.status === "completed"
                  ? "text-green-600"
                  : ride.status === "ongoing"
                  ? "text-blue-600"
                  : ride.status === "cancelled"
                  ? "text-red-600"
                  : ride.status === "accepted"
                  ? "text-purple-600"
                  : "text-yellow-600"
              }`}
            >
              {ride.status}
            </span>
          </p>
        </div>
        <div className="flex items-center">
          <FaWallet className="text-green-600 mr-2" />
          <p className="text-gray-700">
            <strong>Fare:</strong> ₹{ride.fare}
          </p>
        </div>
        {ride.captain && (
          <div className="flex items-center space-x-2">
            {ride.captain.profilePhoto ? (
              <img
                src={ride.captain.profilePhoto}
                alt={`${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`}
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openImagePreview(ride.captain.profilePhoto);
                }}
              />
            ) : (
              <FaUser className="text-orange-600" />
            )}
            <p className="text-gray-700 truncate">
              <strong>Captain:</strong> {ride.captain.fullname.firstname}{" "}
              {ride.captain.fullname.lastname}
            </p>
          </div>
        )}
        {ride.user && ride.user.profilePhoto && (
          <div className="flex items-center mt-2">
            <img
              src={ride.user.profilePhoto}
              alt="Rider"
              className="w-8 h-8 rounded-full object-cover cursor-pointer mr-2"
              onClick={(e) => {
                e.stopPropagation();
                openImagePreview(ride.user.profilePhoto);
              }}
            />
            <p className="text-gray-700">Rider</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const getStatusMessage = (ride) => {
    if (!ride) return "";
    const { status, pickup, destination, rideDate, rideTime } = ride;
    let message = "";
    switch (status.toLowerCase()) {
      case "pending":
        message = `Your ride from ${pickup} to ${destination} scheduled on ${rideDate} at ${rideTime} is currently pending. Please wait for confirmation.`;
        break;
      case "accepted":
        message = `Great news! Your ride from ${pickup} to ${destination} scheduled on ${rideDate} at ${rideTime} has been accepted. Get ready!`;
        break;
      case "ongoing":
        message = `Your ride from ${pickup} to ${destination} is in progress. Enjoy your journey and stay safe!`;
        break;
      case "completed":
        message = `Thank you for riding with us! Your journey from ${pickup} to ${destination} on ${rideDate} at ${rideTime} has been completed successfully.`;
        break;
      case "cancelled":
        message = `We regret to inform you that your ride from ${pickup} to ${destination} scheduled on ${rideDate} at ${rideTime} has been cancelled. Please contact support for further assistance.`;
        break;
      default:
        message = `Your ride details: From ${pickup} to ${destination} on ${rideDate} at ${rideTime}.`;
        break;
    }
    return message;
  };

  return (
    <>
      <Usersnavbar />
      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ride History</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshCooldown > 0}
              className={`relative flex items-center px-3 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                refreshCooldown > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaSyncAlt className={`mr-2 ${refreshCooldown > 0 ? "" : "animate-spin-slow"}`} />
              {refreshCooldown > 0 ? `Refresh in ${refreshCooldown}s` : "Refresh"}
              {refreshCooldown > 0 && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                  <circle
                    className="stroke-current text-blue-600"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (refreshCooldown / 30) * 100}
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-3 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-600 text-white shadow-md`
                    : `bg-${tab.color}-100 text-${tab.color}-800 hover:bg-${tab.color}-200`
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 bg-${tab.color}-500 ${
                    activeTab === tab.key ? "bg-white" : ""
                  }`}
                ></span>
                {tab.label} (
                {activeTab === tab.key
                  ? filteredRides().length
                  : rides.filter((r) => r.status.toLowerCase() === tab.key).length}
                )
              </button>
            ))}
          </div>

          {/* Ride Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader size={50} color={"#123abc"} loading={loading} />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 text-lg sm:text-xl">{error}</div>
          ) : rides.length === 0 ? (
            <p className="text-center text-gray-600 text-lg sm:text-xl">
              No rides found in your history.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRides().length > 0 ? (
                filteredRides().map(renderRideCard)
              ) : (
                <p className="text-center text-gray-600 text-lg sm:text-xl col-span-full">
                  No {activeTab === "all" ? "" : activeTab} rides found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ride Details Modal */}
      {showModal && selectedRide && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl z-10 max-w-lg mx-4 sm:mx-auto p-6 relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
              Ride Details
            </h2>
            {selectedRide.captain && selectedRide.captain.profilePhoto && (
              <div className="flex items-center mb-4">
                <img
                  src={selectedRide.captain.profilePhoto}
                  alt={`${selectedRide.captain.fullname.firstname} ${selectedRide.captain.fullname.lastname}`}
                  className="w-12 h-12 rounded-full object-cover mr-3 cursor-pointer"
                  onClick={() => openImagePreview(selectedRide.captain.profilePhoto)}
                />
                <p className="text-gray-700 font-semibold">
                  {selectedRide.captain.fullname.firstname} {selectedRide.captain.fullname.lastname}
                </p>
              </div>
            )}
            {selectedRide.user && selectedRide.user.profilePhoto && (
              <div className="flex items-center mb-4">
                <img
                  src={selectedRide.user.profilePhoto}
                  alt="Rider"
                  className="w-12 h-12 rounded-full object-cover mr-3 cursor-pointer"
                  onClick={() => openImagePreview(selectedRide.user.profilePhoto)}
                />
                <p className="text-gray-700 font-semibold">Rider</p>
              </div>
            )}
            <p className="text-gray-700 text-sm sm:text-base mb-4">
              {getStatusMessage(selectedRide)}
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mb-6">
              From <strong>{selectedRide.pickup}</strong> to{" "}
              <strong>{selectedRide.destination}</strong> on{" "}
              <strong>{selectedRide.rideDate}</strong> at{" "}
              <strong>{selectedRide.rideTime}</strong>.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && previewImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setShowImagePreview(false)}
          ></div>
          <div className="relative z-10 p-4">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-200"
            >
              &#x2715;
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for Animation and Scrollbar */}
      <style>{`
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-400 {
          scrollbar-color: #9ca3af #e5e7eb;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          h1 {
            font-size: 1.5rem;
          }
          h2 {
            font-size: 1.75rem;
          }
          p {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
};

export default UserRideHistory;
