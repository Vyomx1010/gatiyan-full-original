import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Captainnavbar from '../components/Captainnavbar';
import { Modal, Button } from 'react-bootstrap';

const CaptainRidesHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  
  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/rides/captain-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(res.data);
      } catch (err) {
        console.error('Error fetching rides:', err);
        setError(err.response?.data?.message || 'Failed to fetch rides');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [baseUrl]);
  
  const handleConfirmClick = (ride) => {
    setSelectedRide(ride);
    setShowModal(true);
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRide(null);
  };
  
  const handleConfirmPayment = async () => {
    if (!selectedRide) return;
    setConfirmLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/rides/confirm-payment/${selectedRide._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Payment confirmed successfully!');
      // Refresh ride history after confirmation
      const res = await axios.get(`${baseUrl}/rides/captain-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(res.data);
      handleModalClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming payment');
    } finally {
      // Enforce a 2-second cooldown on the confirmation button
      setTimeout(() => setConfirmLoading(false), 2000);
    }
  };
  
  return (
    <>
      <Captainnavbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Ride History</h1>
        {loading && <p>Loading rides...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {rides.length === 0 ? (
          <p>No rides found.</p>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white p-4 rounded shadow">
                <p><strong>From:</strong> {ride.pickup}</p>
                <p><strong>To:</strong> {ride.destination}</p>
                <p>
                  <strong>Date:</strong> {new Date(ride.rideDate).toLocaleDateString()} • {ride.rideTime}
                </p>
                <p><strong>Fare:</strong> ₹{ride.fare}</p>
                <p><strong>Payment Type:</strong> {ride.paymentType}</p>
                <p><strong>Payment Done:</strong> {ride.isPaymentDone ? 'Yes' : 'No'}</p>
                {ride.paymentType === 'cash' && !ride.isPaymentDone && (
                  <Button variant="primary" onClick={() => handleConfirmClick(ride)}>
                    Confirm Payment
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cash Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to confirm the cash payment for this ride?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={confirmLoading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmPayment} disabled={confirmLoading}>
            {confirmLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CaptainRidesHistory;
