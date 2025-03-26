import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader";

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [assignments, setAssignments] = useState({}); // rideId -> captainId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For filtering rides by search term and status tab
  const [rideSearch, setRideSearch] = useState("");
  const [rideFilter, setRideFilter] = useState("All"); // "All", "pending", "ongoing", "completed", "cancelled", "accepted"

  // For filtering captains in assignment per ride (rideId -> search term)
  const [assignmentSearch, setAssignmentSearch] = useState({});

  // For individual button loading states: object keyed by rideId then action
  const [actionLoading, setActionLoading] = useState({});

  // Helper: update loading for a specific ride and action
  const updateActionLoading = (rideId, action, value) => {
    setActionLoading(prev => ({
      ...prev,
      [rideId]: { ...prev[rideId], [action]: value },
    }));
  };

  useEffect(() => {
    fetchRides();
    fetchCaptains();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(res.data.rides || []);
    } catch (err) {
      setError("Failed to fetch rides. Please try again.");
      toast.error("Error fetching rides");
      console.error("Error fetching rides:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaptains = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/captains`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptains(res.data.captains || []);
    } catch (err) {
      toast.error("Error fetching captains");
      console.error("Error fetching captains:", err);
    }
  };

  const updateRideStatus = async (rideId, newStatus) => {
    updateActionLoading(rideId, newStatus, true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides/${rideId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(rides.map(ride => (ride._id === rideId ? { ...ride, status: newStatus } : ride)));
      toast.success(`Ride marked as ${newStatus}`);
    } catch (err) {
      toast.error(`Failed to update ride status to ${newStatus}`);
      console.error("Error updating ride status:", err);
    } finally {
      updateActionLoading(rideId, newStatus, false);
    }
  };

  const assignCaptain = async (rideId) => {
    updateActionLoading(rideId, "assign", true);
    try {
      const token = localStorage.getItem("adminToken");
      const captainId = assignments[rideId];
      if (!captainId) {
        toast.error("Please select a captain.");
        updateActionLoading(rideId, "assign", false);
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides/${rideId}/assign`,
        { captainId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(rides.map(ride => ride._id === rideId ? res.data.ride : ride));
      setAssignments(prev => ({ ...prev, [rideId]: "" }));
      toast.success("Captain assigned successfully");
    } catch (err) {
      toast.error("Error assigning captain");
      console.error("Error assigning captain:", err);
    } finally {
      updateActionLoading(rideId, "assign", false);
    }
  };

  // Helper to get a color badge for ride status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter rides based on search text and selected ride filter tab
  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.user?.fullname?.firstname.toLowerCase().includes(rideSearch.toLowerCase()) ||
      ride.user?.fullname?.lastname.toLowerCase().includes(rideSearch.toLowerCase()) ||
      ride.user?.email.toLowerCase().includes(rideSearch.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(rideSearch.toLowerCase()) ||
      ride.destination.toLowerCase().includes(rideSearch.toLowerCase()) ||
      (ride.status && ride.status.toLowerCase().includes(rideSearch.toLowerCase()));
    const matchesFilter =
      rideFilter === "All" || ride.status.toLowerCase() === rideFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Available status tabs (customize as needed)
  const statusTabs = ["All", "pending", "accepted", "ongoing", "completed", "cancelled"];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ride Management</h1>
          
          {/* Global Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
            <input
              type="text"
              value={rideSearch}
              onChange={(e) => setRideSearch(e.target.value)}
              placeholder="Search rides by name, email, pickup, destination, status..."
              className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-4 mb-6">
            {statusTabs.map((status) => (
              <button
                key={status}
                onClick={() => setRideFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  rideFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ScaleLoader color="#4F46E5" height={35} width={5} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center text-gray-500">No rides available</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{ride.user?.email}</p>
                  </div>

                  <div className="p-4 flex-1">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                      <p className="text-gray-700">{ride.pickup}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-500">Destination</p>
                      <p className="text-gray-700">{ride.destination}</p>
                    </div>
                    
                    {/* Captain Assignment Section */}
                    {!ride.captain && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-medium text-gray-500 mb-2">Assign Captain</p>
                        {/* Search box for captains */}
                        <input
                          type="text"
                          value={assignmentSearch[ride._id] || ""}
                          onChange={(e) =>
                            setAssignmentSearch((prev) => ({ ...prev, [ride._id]: e.target.value }))
                          }
                          placeholder="Search captain by name or email..."
                          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {/* Select dropdown with filtered captains */}
                        <select
                          value={assignments[ride._id] || ""}
                          onChange={(e) =>
                            setAssignments((prev) => ({ ...prev, [ride._id]: e.target.value }))
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select a captain</option>
                          {captains
                            .filter((captain) => {
                              const searchStr = assignmentSearch[ride._id] || "";
                              const fullName = `${captain.fullname.firstname} ${captain.fullname.lastname}`.toLowerCase();
                              return fullName.includes(searchStr.toLowerCase()) || captain.email.toLowerCase().includes(searchStr.toLowerCase());
                            })
                            .map((captain) => (
                              <option key={captain._id} value={captain._id}>
                                {captain.fullname.firstname} {captain.fullname.lastname} (
                                {captain.vehicle?.vehicleType}) - {captain.email}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => assignCaptain(ride._id)}
                          className="mt-2 w-full flex justify-center items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
                        >
                          {actionLoading[ride._id]?.assign ? (
                            <ScaleLoader color="#ffffff" height={20} width={4} />
                          ) : (
                            "Assign"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRideStatus(ride._id, "ongoing")}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        {actionLoading[ride._id]?.ongoing ? (
                          <ScaleLoader color="#ffffff" height={20} width={4} />
                        ) : (
                          "Ongoing"
                        )}
                      </button>
                      <button
                        onClick={() => updateRideStatus(ride._id, "completed")}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        {actionLoading[ride._id]?.completed ? (
                          <ScaleLoader color="#ffffff" height={20} width={4} />
                        ) : (
                          "Complete"
                        )}
                      </button>
                      <button
                        onClick={() => updateRideStatus(ride._id, "cancelled")}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        {actionLoading[ride._id]?.cancelled ? (
                          <ScaleLoader color="#ffffff" height={20} width={4} />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default RideManagement;
