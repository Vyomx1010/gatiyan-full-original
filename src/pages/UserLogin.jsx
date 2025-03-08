import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import logo from '../assets/black--white--logoblack-removebg-preview.png';
import 'react-toastify/dist/ReactToastify.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = { email, password };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast.success('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);

      // Handle unverified email/mobile scenario
      if (error.response?.status === 401 && errorMsg.includes("verify your email")) {
        const { email: responseEmail, mobileNumber } = error.response.data.user || {};
        toast.info('Verification required. Redirecting to OTP verification...');
        setTimeout(() => {
          navigate('/verify-email-otp', {
            state: { email: responseEmail || email, mobileNumber, userType: 'user' },
          });
        }, 2000);
      }
    } finally {
      setLoading(false);
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
            alt="Logo"
          />
          <h1 className="text-2xl font-bold text-black">User Login</h1>
          <p className="text-gray-600">Welcome back! Please log in to continue.</p>
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
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black focus:border-black transition duration-300"
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
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black focus:border-black transition duration-300"
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
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-blue-500 hover:underline">
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
          New here?{' '}
          <Link to="/signup" className="text-black hover:underline">
            Create new Account
          </Link>
        </p>

        <div className="mt-6">
          <Link
            to="/captain-login"
            className="w-full bg-black flex items-center justify-center text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition duration-300"
          >
            Sign in as Captain
          </Link>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default UserLogin;
