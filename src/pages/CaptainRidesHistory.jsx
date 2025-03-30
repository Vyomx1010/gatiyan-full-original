import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Captainnavbar from '../components/Captainnavbar';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaWallet, FaCheckCircle } from 'react-icons/fa';

const CaptainRidesHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view ride history');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(response.data.rides || []);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        setError('Failed to load ride history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const confirmPayment = async (rideId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to confirm payment');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm-payment/${rideId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(rides.map(ride =>
        ride._id === rideId ? { ...ride, isPaymentDone: true } : ride
      ));
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError('Failed to confirm payment. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <Captainnavbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Ride History</h1>
        {rides.length === 0 ? (
          <p>No rides found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rides.map(ride => (
              <div key={ride._id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold">{ride.pickup} to {ride.destination}</h3>
                <p><FaCalendarAlt className="inline mr-2" /> {ride.rideDate} at {ride.rideTime}</p>
                <p><FaMapMarkerAlt className="inline mr-2" /> Status: {ride.status}</p>
                <p><FaWallet className="inline mr-2" /> Fare: ₹{ride.fare}</p>
                {ride.paymentType === 'cash' && (
                  <div className="mt-2">
                    <p>Payment Status: {ride.isPaymentDone ? 'Done' : 'Pending'}</p>
                    {!ride.isPaymentDone && (
                      <button
                        onClick={() => confirmPayment(ride._id)}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                      >
                        <FaCheckCircle className="inline mr-2" /> Confirm Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CaptainRidesHistory;