import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const FloatingBooking = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      // Redirect to dashboard if logged in
      navigate('/home'); // Make sure this route exists
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        variant="primary"
        size="lg"
        className="shadow-xl"
        onClick={handleClick}
      >
        {isLoggedIn ? "Go to Dashboard" : "Book Now"}
      </Button>
    </motion.div>
  );
};

export default FloatingBooking;