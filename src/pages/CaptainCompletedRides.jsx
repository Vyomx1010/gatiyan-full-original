import React, { useState, useEffect } from "react";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";

const CaptainCompletedRides = () => {
  const [completedRides, setCompletedRides] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

  // Fetch completed rides from the backend
  const fetchCompletedRides = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/rides/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Completed rides data:", res.data); // Log to inspect data
      if (Array.isArray(res.data)) {
        setCompletedRides(res.data);
      } else {
        setCompletedRides([]);
      }
    } catch (error) {
      console.error("Error fetching completed rides:", error);
      setCompletedRides([]);
    }
  };

  // Run fetch on component mount
  useEffect(() => {
    fetchCompletedRides();
  }, []);

  return (
    <>
      <Captainnavbar />
      <div className="mt-14 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Completed Rides</h1>
          {completedRides.length === 0 ? (
            <p className="text-gray-500">No completed rides found</p>
          ) : (
            <div className="space-y-3">
              {completedRides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-lg shadow-sm p-4">
                  <p>
                    <strong>Pickup:</strong> {ride.pickup || "N/A"}
                  </p>
                  <p>
                    <strong>Dropoff:</strong> {ride.destination || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {ride.status || "N/A"}
                  </p>
                  <p>
                    <strong>Fare:</strong> {ride.fare ? `₹${ride.fare}` : "N/A"}
                  </p>
                  {ride.completedDate && (
                    <p>
                      <strong>Completed On:</strong>{" "}
                      {new Date(ride.completedDate).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CaptainCompletedRides;