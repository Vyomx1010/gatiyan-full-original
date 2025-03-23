import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, userType } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');  // ✅ Separate state for resend success message
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 100);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.some(digit => digit === '')) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    const completeOtp = otp.join('');
    console.log('Submitting Email OTP:', completeOtp);

    try {
      const endpoint = userType === 'captain'
        ? `${import.meta.env.VITE_BACKEND_URL}/captains/verify-email-otp`
        : `${import.meta.env.VITE_BACKEND_URL}/users/verify-email-otp`;

      const response = await axios.post(endpoint, { email, otp: completeOtp });
      console.log('Server Response:', response.data);
      setSuccess(response.data.message);
      setError('');
      setResendSuccess('');  // ✅ Clear resend message on successful verification
    } catch (err) {
      console.error('Error verifying OTP:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const endpoint = userType === 'captain'
        ? `${import.meta.env.VITE_BACKEND_URL}/captains/resend-otp`
        : `${import.meta.env.VITE_BACKEND_URL}/users/resend-otp`;

      const response = await axios.post(endpoint, { email });
      setResendSuccess('OTP resent successfully ✅');  // ✅ Show correct resend message
      setError('');
      setCooldown(120);
    } catch (err) {
      console.error('Error resending OTP:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMsg);
      setResendSuccess('');
      if (err.response?.status === 429) {
        const match = errorMsg.match(/wait (\d+) seconds/);
        if (match) {
          setCooldown(parseInt(match[1], 10));
        }
      }
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handlePopupOk = () => {
    setSuccess('');
    setResendSuccess('');
    navigate(userType === 'captain' ? '/captain-login' : '/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg relative">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to {email || 'your email address'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                id={`email-otp-input-${index}`}
                type="text"
                maxLength="1"
                inputMode="numeric"
                className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {resendSuccess && <p className="text-sm text-green-600 text-center">{resendSuccess}</p>}  
          {/* ✅ Resend OTP Success message */}

          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-700">
              <p>
                <span className="font-medium">Email:</span> {email || 'Not provided'}
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3 border-4 border-white border-t-transparent rounded-full" viewBox="0 0 24 24"></svg>
              ) : 'Verify'}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                cooldown > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>

        {/* ✅ Separate popup for OTP verification success */}
        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4">Success!</h2>
              <p className="mb-4">{success}</p>
              <button
                onClick={handlePopupOk}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailOTP;
