import React, { useState, useEffect } from "react";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";

const CaptainRidesHistory = () => {
  const [rides, setRides] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  // Fetch rides from backend
  const fetchRides = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found, redirecting to login");
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/captain-history`, {
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🚖 Rides History</h1>
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
                {isRefreshing ? "Refreshing..." : cooldown > 0 ? `Wait ${cooldown}s` : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {filteredRides.length === 0 ? (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CaptainRidesHistory;
