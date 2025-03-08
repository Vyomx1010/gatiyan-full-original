import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import 'remixicon/fonts/remixicon.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/black--white--logoblack-removebg-preview.png';

const UserSignup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', // New field for confirm password
    mobileNumber: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility

  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error('Please accept the Terms and Conditions to proceed.');
      return;
    }

    setIsLoading(true);

    const submitFormData = new FormData();
    submitFormData.append("fullname[firstname]", formData.firstName);
    submitFormData.append("fullname[lastname]", formData.lastName);
    submitFormData.append("email", formData.email);
    submitFormData.append("password", formData.password);
    submitFormData.append("mobileNumber", formData.mobileNumber);

    if (profilePhoto) {
      submitFormData.append("profilePhoto", profilePhoto);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        submitFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("OTP sent to your email and mobile number!");
        navigate('/verify-email-otp', {
          state: { email: formData.email, mobileNumber: formData.mobileNumber, userType: 'user' },
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
      setTermsAccepted(false);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    const colors = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-black'];
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-full rounded ${index < passwordStrength ? colors[index] : 'bg-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  required
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={updateFormData}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  required
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={updateFormData}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                required
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={updateFormData}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={updateFormData}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
              {renderPasswordStrengthIndicator()}
              <p className="text-xs text-gray-600 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  required
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={updateFormData}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={nextStep}
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword
              }
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-300"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">+91</span>
                <input
                  required
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={updateFormData}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I accept the{' '}
                <Link to="/terms-and-conditions" className="text-blue-500 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-white text-black border border-black py-2 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.mobileNumber || isLoading || !termsAccepted}
                className={`w-1/2 bg-black text-white py-2 rounded-lg transition duration-300 ${
                  !formData.mobileNumber || isLoading || !termsAccepted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-300">
        <div className="flex items-center mb-4">
          <Link to="/login" className="flex items-center text-black hover:underline">
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="ml-2 text-xl font-bold">Back</span>
          </Link>
        </div>
        <img
          className="w-28 mx-auto mb-4 animate-bounce"
          src={logo}
          alt="Logo"
        />
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-black">Create Account</h1>
          <div className="flex justify-center mt-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 mx-1 rounded-full ${currentStep === step ? 'bg-black' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          {renderStepContent()}
        </form>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-black hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;