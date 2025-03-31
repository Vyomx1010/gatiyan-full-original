import React, { useState, useEffect } from "react";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";

const CaptainHome = () => {
  const [rides, setRides] = useState([]);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loader state
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  // Get current location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCaptainLocation({ lat: latitude, lng: longitude });
      });
    }
  }, []);

  // Function to re-fetch current location on demand.
  const fetchCaptainLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCaptainLocation(newLocation);
        },
        (error) => {
          alert("Error getting current location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Fetch rides from backend
  const fetchRides = async () => {
    setIsLoading(true); // Start loader
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found, redirecting to login");
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/rides/pending`, {
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
    setIsLoading(false); // Stop loader
  };  

  // Initial fetch on mount
  useEffect(() => {
    fetchRides();
  }, []);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Abhi ka hai 🚀";
    if (diffDays === 1) return "1 din Baad";
    if (diffDays < 30) return `${diffDays} din Baad`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mahine Baad`;
    return `${Math.floor(diffDays / 365)} saal Baad`;
  };

  // Helper function to format distance (in meters) to km.
  const formatDistance = (distance) => {
    if (!distance || isNaN(distance)) return "N/A";
    return (distance / 1000).toFixed(2) + " km";
  };

  // Helper function to format duration (in seconds) to hr/min/sec.
  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return "N/A";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remMinutes = minutes % 60;
      return `${hours} hr ${remMinutes} min`;
    }
    return `${minutes} min ${seconds} sec`;
  };

  // Opens Google Maps with directions based on the type.
  // For "from", we use the captain's current location as the origin.
  const handleRouteClick = (type, ride) => {
    let origin, destination;
    if (type === "from") {
      // If captainLocation is missing, attempt to re-fetch it.
      if (!captainLocation) {
        fetchCaptainLocation();
        setTimeout(() => {
          if (!captainLocation) {
            alert("Captain location not available.");
            return;
          }
          // After trying to fetch, re-run the route logic.
          origin = `${captainLocation.lat},${captainLocation.lng}`;
          if (ride.pickupCoords && ride.pickupCoords.ltd && ride.pickupCoords.lng) {
            destination = `${ride.pickupCoords.ltd},${ride.pickupCoords.lng}`;
          } else {
            destination = ride.pickup;
          }
          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            origin
          )}&destination=${encodeURIComponent(destination)}`;
          window.open(url, "_blank");
        }, 1000);
        return;
      } else {
        origin = `${captainLocation.lat},${captainLocation.lng}`;
        if (ride.pickupCoords && ride.pickupCoords.ltd && ride.pickupCoords.lng) {
          destination = `${ride.pickupCoords.ltd},${ride.pickupCoords.lng}`;
        } else {
          destination = ride.pickup;
        }
      }
    } else if (type === "path") {
      // For "path", use pickup as origin and destination as destination.
      if (ride.pickupCoords && ride.pickupCoords.ltd && ride.pickupCoords.lng) {
        origin = `${ride.pickupCoords.ltd},${ride.pickupCoords.lng}`;
      } else {
        origin = ride.pickup;
      }
      if (ride.destinationCoords && ride.destinationCoords.ltd && ride.destinationCoords.lng) {
        destination = `${ride.destinationCoords.ltd},${ride.destinationCoords.lng}`;
      } else {
        destination = ride.destination;
      }
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;
    window.open(url, "_blank");
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-500",
      accepted: "bg-orange-500",
      ongoing: "bg-blue-500",
      completed: "bg-green-500",
      canceled: "bg-red-500",
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

  // Refresh button handler with 25 sec cooldown
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

  // Filter rides based on the search term.
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

  return (
    <>
      <Captainnavbar />
      <div className="mt-14 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2 sm:p-4 ">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🚖 Rides</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rides..."
                className="px-3 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={() => setSearchTerm(searchTerm)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Search
              </button>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Clear
              </button>
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

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">No rides available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">📍</span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">From</p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {ride.pickup}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">🎯</span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">To</p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {ride.destination}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end gap-2">
                      <p className="text-lg sm:text-xl font-bold text-gray-800">₹{ride.fare}</p>
                      {getStatusBadge(ride.status)}
                    </div>
                  </div>

                  <div className="border-t mt-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Schedule</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(ride.rideDate).toLocaleDateString()} • {ride.rideTime}
                        </p>
                        <p className="text-xs text-gray-500">{getTimeAgo(ride.rideDate)}</p>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          🚗
                          <p className="text-gray-700 truncate ml-1">
                            <strong>Distance:</strong> {formatDistance(ride.distance)}
                          </p>
                        </div>
                        <div className="flex items-center mt-1">
                          ⏱️
                          <p className="text-gray-700 truncate ml-1">
                            <strong>Duration:</strong> {formatDuration(ride.duration)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          📧 {ride.adminEmail || "rajvl132011@gmail.com"}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          📱 {ride.adminPhone || "+91 8435061006"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRouteClick("from", ride)}
                      className="flex-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-medium"
                    >
                      From You
                    </button>
                    <button
                      onClick={() => handleRouteClick("path", ride)}
                      className="flex-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded text-xs font-medium"
                    >
                      Path
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CaptainHome;
