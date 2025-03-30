import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Captainnavbar from '../components/Captainnavbar';

const CaptainEarnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarning: 0,
    todayEarning: 0,
    monthlyEarning: 0,
    totalCompletedRides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view earnings');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Earnings data:', response.data); // Debug
        setEarnings(response.data);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        setError('Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <Captainnavbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Your Earnings</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl">Today’s Earnings</h2>
            <p className="text-2xl font-semibold">₹{earnings.todayEarning}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl">Monthly Earnings</h2>
            <p className="text-2xl font-semibold">₹{earnings.monthlyEarning}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl">Total Earnings</h2>
            <p className="text-2xl font-semibold">₹{earnings.totalEarning}</p>
          </div>
        </div>
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl">Total Completed Rides</h2>
          <p className="text-2xl font-semibold">{earnings.totalCompletedRides}</p>
        </div>
      </div>
    </>
  );
};

export default CaptainEarnings;