import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Captainnavbar from '../components/Captainnavbar';

const CaptainEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/captains/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEarnings(res.data.earnings);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError(err.response?.data?.message || 'Failed to fetch earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [baseUrl]);

  return (
    <>
      <Captainnavbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Earnings</h1>
        {loading && <p>Loading earnings...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {earnings && (
          <div className="bg-white shadow rounded p-4">
            <p className="text-lg"><strong>Total Earnings:</strong> ₹{earnings.totalEarning}</p>
            <p className="text-lg"><strong>Today's Earnings:</strong> ₹{earnings.todayEarning}</p>
            <p className="text-lg"><strong>Monthly Earnings:</strong> ₹{earnings.monthlyEarning}</p>
            <p className="text-lg"><strong>Yearly Earnings:</strong> ₹{earnings.yearlyEarning}</p>
            <p className="text-lg"><strong>Total Completed Rides:</strong> {earnings.totalCompletedRides}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CaptainEarnings;
