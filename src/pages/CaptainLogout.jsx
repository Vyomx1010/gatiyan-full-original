import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const CaptainLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutCaptain = async () => {
      const token = localStorage.getItem('token'); // Use consistent 'token' key
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/captain-login');
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          localStorage.removeItem('token'); // Remove consistent 'token' key
          console.log('Captain logged out successfully');
          navigate('/captain-login');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.removeItem('token'); // Remove token even on error
        navigate('/captain-login');
      }
    };

    logoutCaptain();
  }, [navigate]);

  return <div>Captain Logout</div>;
};

export default CaptainLogout;