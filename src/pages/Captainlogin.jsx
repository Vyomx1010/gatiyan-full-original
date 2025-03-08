import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CapatainContext';
import { ClipLoader } from 'react-spinners'; // For loading spinner
import { toast, ToastContainer } from 'react-toastify'; // For popup messages
import 'react-toastify/dist/ReactToastify.css'; // CSS for toast notifications
import logo from '../assets/black--white--logoblack-removebg-preview.png';

const Captainlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const { setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const captainData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        captainData
      );

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem('token', data.token);
        toast.success('Login successful! Redirecting...'); // Success popup
        setTimeout(() => {
          navigate('/captain-home');
        }, 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg); // Error popup

      // Handle unverified email/mobile scenario
      if (error.response?.status === 401 && errorMsg.includes("verify your email")) {
        const { email: responseEmail, mobileNumber } = error.response.data.captain || {};
        toast.info('Verification required. Redirecting to OTP verification...');
        setTimeout(() => {
          navigate('/verify-email-otp', {
            state: { email: responseEmail || email, mobileNumber, userType: 'captain' },
          });
        }, 2000);
      }
    } finally {
      setLoading(false); // Stop loading
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-300">
        <div className="text-center mb-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-black hover:underline">
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="ml-2 text-xl font-bold">Home</span>
            </Link>
          </div>
          <img
            className="w-28 mx-auto mb-4 animate-bounce"
            src={logo}
            alt="Captain Logo"
          />
          <h1 className="text-2xl font-bold text-black">Captain Login</h1>
          <p className="text-gray-700">Welcome back! Please log in to continue.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black transition duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black transition duration-300"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
              >
                {showPassword ? (
                  <i className="ri-eye-off-line text-xl"></i>
                ) : (
                  <i className="ri-eye-line text-xl"></i>
                )}
              </span>
            </div>
          </div>
          <p className="text-center mt-6 text-gray-700">
            Forgot your password?{" "}
            <Link to="/captain-forgot-password" className="text-blue-500 hover:underline">
              Reset here
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading} 
            className="w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-700">
          Join a fleet?{' '}
          <Link to="/captain-signup" className="text-black hover:underline">
            Register as a Captain
          </Link>
        </p>

        <div className="mt-6">
          <Link
            to="/login"
            className="w-full bg-black flex items-center justify-center text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition duration-300"
          >
            Sign in as User
          </Link>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Captainlogin;
