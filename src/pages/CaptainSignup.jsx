import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CapatainContext';
import 'remixicon/fonts/remixicon.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/black--white--logoblack-removebg-preview.png';

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    drivingLicense: '',
    vehicle: {
      color: '',
      plate: '',
      capacity: '',
      type: '',
    },
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate driving license number against Indian format: e.g., KA-04-2023-0009646
  const validateDrivingLicense = (license) => {
    const regex = /^[A-Z]{2}-\d{2}-\d{4}-\d{7}$/i;
    return regex.test(license);
  };

  // Validate vehicle plate number against Indian format: e.g., KA-01-AB-1234
  const validateVehiclePlate = (plate) => {
    const regex = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/i;
    return regex.test(plate);
  };

  const updateFormData = (e, section = '') => {
    const { name, value } = e.target;
    if (section === 'vehicle' && name === 'type') {
      const capacity =
        ['Swift', 'Wagon R', 'Hyundai i20', 'Tiago', 'Swift Dzire'].includes(value)
          ? '4'
          : ['XLG', 'Ertiga'].includes(value)
          ? '7'
          : value === 'Toyota Innova'
          ? '7'
          : '';
      setFormData((prev) => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          type: value,
          capacity: capacity,
        },
      }));
    } else if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Handler for uploading profile photo using Cloudinary
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    // Use environment variables for your Cloudinary preset and cloud name
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        data
      );
      setProfilePhoto(res.data.secure_url);
      toast.success("Profile photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading image", error);
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  }; 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the Terms and Conditions to proceed.");
      return;
    }
    if (!profilePhoto) {
      toast.error("Profile photo is required");
      return;
    }
    if (!validateDrivingLicense(formData.drivingLicense)) {
      toast.error("Invalid driving license format...");
      return;
    }
    if (!validateVehiclePlate(formData.vehicle.plate)) {
      toast.error("Invalid vehicle plate format...");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
  
    // Send nested JSON instead of FormData with bracket notation
    const payload = {
      fullname: {
        firstname: formData.firstName,
        lastname: formData.lastName,
      },
      email: formData.email,
      password: formData.password,
      mobileNumber: formData.mobileNumber,
      drivingLicense: formData.drivingLicense,
      vehicle: {
        color: formData.vehicle.color,
        plate: formData.vehicle.plate,
        capacity: formData.vehicle.capacity,
        vehicleType: formData.vehicle.type,
      },
      profilePhoto, // Cloudinary URL
    };
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        payload, // Send as JSON
        { headers: { "Content-Type": "application/json" } } // Change to JSON
      );
      if (response.status === 201) {
        toast.success("OTP sent to your email and mobile number!");
        navigate("/verify-email-otp", {
          state: { email: formData.email, userType: "captain" },
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
      console.error("Signup Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
      setTermsAccepted(false);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-400",
      "bg-green-600",
    ];
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-full rounded ${
              index < passwordStrength ? colors[index] : "bg-gray-300"
            }`}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  required
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData(e)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  required
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData(e)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                required
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => updateFormData(e)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => updateFormData(e)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                </button>
              </div>
              {renderPasswordStrengthIndicator()}
              <p className="text-xs text-gray-600 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  required
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData(e)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                </button>
              </div>
            </div>
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo (Required)
              </label>
              <input
                required
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="w-full text-black"
              />
              {isUploading && (
                <div className="mt-2">
                  <span className="text-sm text-gray-700">Uploading...</span>
                </div>
              )}
              {profilePhoto && !isUploading && (
                <div className="mt-2">
                  <img
                    src={profilePhoto}
                    alt="Profile Preview"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={nextStep}
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword ||
                !profilePhoto
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">+91</span>
                <input
                  required
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(e) => updateFormData(e)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driving License Number
              </label>
              <input
                required
                name="drivingLicense"
                type="text"
                placeholder="KA-04-2023-0009646"
                value={formData.drivingLicense}
                onChange={(e) => updateFormData(e)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.mobileNumber || !formData.drivingLicense}
                className="w-1/2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Color
                </label>
                <input
                  required
                  name="color"
                  type="text"
                  placeholder="Vehicle Color"
                  value={formData.vehicle.color}
                  onChange={(e) => updateFormData(e, 'vehicle')}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Plate
                </label>
                <input
                  required
                  name="plate"
                  type="text"
                  placeholder="KA-01-AB-1234"
                  value={formData.vehicle.plate}
                  onChange={(e) => updateFormData(e, 'vehicle')}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  required
                  name="type"
                  value={formData.vehicle.type}
                  onChange={(e) => updateFormData(e, 'vehicle')}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Swift">Swift</option>
                  <option value="Wagon R">Wagon R</option>
                  <option value="Hyundai i20">Hyundai i20</option>
                  <option value="Tiago">Tiago</option>
                  <option value="Swift Dzire">Swift Dzire</option>
                  <option value="XLG">XL6</option>
                  <option value="Ertiga">Ertiga</option>
                  <option value="Toyota Innova">Toyota Innova</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700">
                  {formData.vehicle.capacity || 'Auto-filled'} Seats
                </div>
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
                I accept the{" "}
                <Link to="/terms-and-conditions" className="text-blue-500 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  !formData.vehicle.color ||
                  !formData.vehicle.plate ||
                  !formData.vehicle.type ||
                  isLoading ||
                  !termsAccepted
                }
                className={`w-1/2 bg-black text-white py-2 rounded-lg transition duration-300 ${
                  !formData.vehicle.color ||
                  !formData.vehicle.plate ||
                  !formData.vehicle.type ||
                  isLoading ||
                  !termsAccepted
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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
        <div className="text-center mb-8">
          <div className="flex items-center mb-4">
            <Link to="/captain-login" className="flex items-center text-black hover:underline">
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="ml-2 text-xl font-bold">Back</span>
            </Link>
          </div>
          <img
            className="w-28 mx-auto mb-4 animate-bounce"
            src={logo}
            alt="Captain Logo"
          />
          <h1 className="text-2xl font-bold text-black">Create Captain Account</h1>
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 mx-1 rounded-full ${
                  currentStep === step ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}
        </form>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <Link to="/captain-login" className="text-black hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;
