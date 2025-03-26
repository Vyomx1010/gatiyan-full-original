import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const CaptainLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutCaptain = async () => {
      const token = localStorage.getItem('token'); 
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

  return (
    <div className="logout-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="logout-message" style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Logging out...</div>
        <div className="spinner" style={{ position: 'relative', width: '40px', height: '40px' }}>
          <div className="double-bounce1" style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#333', opacity: 0.6, position: 'absolute', top: 0, left: 0, animation: 'sk-bounce 2.0s infinite ease-in-out' }}></div>
          <div className="double-bounce2" style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#333', opacity: 0.6, position: 'absolute', top: 0, left: 0, animation: 'sk-bounce 2.0s infinite ease-in-out', animationDelay: '-1.0s' }}></div>
        </div>
      </div>
    </div>
  );

  // Add the following CSS to your stylesheet
  /*
  @keyframes sk-bounce {
    0%, 100% { transform: scale(0.0) }
    50% { transform: scale(1.0) }
  }
  */
};

export default CaptainLogout;