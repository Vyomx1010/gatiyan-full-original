import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ScaleLoader from 'react-spinners/ScaleLoader';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, '');
    const newOtpDigits = [...otpDigits];

    if (value) {
      newOtpDigits[index] = value.slice(-1);
      setOtpDigits(newOtpDigits);
      if (index < 5 && value) {
        inputsRef.current[index + 1].focus();
      }
    } else {
      newOtpDigits[index] = '';
      setOtpDigits(newOtpDigits);
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtpDigits = pastedData.split('').slice(0, 6);
      setOtpDigits(newOtpDigits);
      inputsRef.current[5].focus();
      e.preventDefault();
    }
  };

  // Handle key down for backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!showCodeInput) {
        // Step 1: Submit email and password
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/login`,
          { email, password }
        );
        toast.success(response.data.message);
        setShowCodeInput(true);
        setOtpDigits(Array(6).fill(''));
      } else {
        // Step 2: Submit OTP
        const code = otpDigits.join('');
        if (code.length !== 6) {
          toast.error('Please enter a 6-digit OTP');
          setIsLoading(false);
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/verify-2sv`,
          { email, code }
        );

        // Store token as 'adminToken' to match AdminProtectWrapper
        const token = response.data.token;
        localStorage.setItem('adminToken', token);
        console.log('Token stored:', localStorage.getItem('adminToken')); // Debugging

        toast.success('Login successful!');
        // Navigate to dashboard with replace to avoid back-button issues
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Login
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {showCodeInput
            ? 'Enter the 6-digit code sent to your email'
            : 'Sign in to manage your dashboard'}
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {!showCodeInput ? (
            <>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  placeholder="admin@example.com"
                />
              </div>

              {/* Password Input with Eye Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    placeholder="••••••••"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-500 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* OTP Input */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="tel"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Button with Loader */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center transition duration-300"
          >
            {isLoading ? (
              <ScaleLoader color="#ffffff" height={20} width={3} />
            ) : showCodeInput ? (
              'Verify Code'
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;