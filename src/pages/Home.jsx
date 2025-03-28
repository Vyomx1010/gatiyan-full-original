import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import { CSSTransition } from 'react-transition-group';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaLocationArrow, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Usersnavbar from '../components/Usersnavbar';
import Footer from '../components/Footer';

const DynamicHero = () => {
  const headlines = [
    "Your Ride, Your Journey",
    "Seamless Trips Await You",
    "Discover New Destinations"
  ];
  const subtexts = [
    "Find the best trips and enjoy a seamless ride experience.",
    "Experience comfort and convenience on every ride.",
    "Travel smart with our efficient ride service."
  ];
  const buttonText = "Get Started";
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 4000); // rotate every 4 seconds
    return () => clearInterval(interval);
  }, []);
  return (
    <section
      className="relative flex items-center justify-center h-[50vh] bg-cover bg-center"
      style={{
        backgroundImage: "url('https://source.unsplash.com/1600x900/?city,ride')"
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {headlines[currentIndex]}
        </h1>
        <p className="text-lg md:text-xl mb-6 animate-fade-in">
          {subtexts[currentIndex]}
        </p>
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className="bg-blue-600 hover:bg-blue-700 transition-all text-white py-2 px-6 rounded-full text-lg animate-pulse"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

const Home = () => {
  // Steps for the bottom panel
  const [currentStep, setCurrentStep] = useState('input');

  // Input states
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // Ride states
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const [ride, setRide] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  // Lifted ride details for confirm ride
  const [rideDate, setRideDate] = useState("");
  const [rideTime, setRideTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Loader while finding trip
  const [isLoading, setIsLoading] = useState(false);
  // Loader for current location fetching
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Back confirmation
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  // Error Modal state
  const [errorModal, setErrorModal] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserDataContext);

  // For CSSTransition
  const nodeRef = useRef(null);

  // Restore pending ride state when Home mounts
  useEffect(() => {
    const pendingRideString = localStorage.getItem('pendingRide');
    if (pendingRideString) {
      const pendingRide = JSON.parse(pendingRideString);
      if (pendingRide.pickup) setPickup(pendingRide.pickup);
      if (pendingRide.destination) setDestination(pendingRide.destination);
      if (pendingRide.rideDate) setRideDate(pendingRide.rideDate);
      if (pendingRide.rideTime) setRideTime(pendingRide.rideTime);
      if (pendingRide.paymentMethod) setPaymentMethod(pendingRide.paymentMethod);
      if (pendingRide.vehicleType) setVehicleType(pendingRide.vehicleType);
      if (pendingRide.fare) setFare({ [pendingRide.vehicleType]: pendingRide.fare });
      setCurrentStep('confirm');
      localStorage.removeItem('pendingRide');
    } else if (location.state && location.state.pickup && location.state.destination) {
      setPickup(location.state.pickup);
      setDestination(location.state.destination);
    } else {
      const rideInput = localStorage.getItem('rideInput');
      if (rideInput) {
        const parsedInput = JSON.parse(rideInput);
        setPickup(parsedInput.pickup || '');
        setDestination(parsedInput.destination || '');
        localStorage.removeItem('rideInput');
      }
    }
  }, [location.state]);

  // Fetch pickup suggestions as user types
  const handlePickupChange = async (e) => {
    const inputValue = e.target.value;
    setPickup(inputValue);
    if (inputValue.length >= 3) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: inputValue },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setPickupSuggestions(response.data);
      } catch (error) {
        // console.error('Error fetching pickup suggestions:', error);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  // Fetch destination suggestions as user types
  const handleDestinationChange = async (e) => {
    const inputValue = e.target.value;
    setDestination(inputValue);
    if (inputValue.length >= 3) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: inputValue },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setDestinationSuggestions(response.data);
      } catch (error) {
        // console.error('Error fetching destination suggestions:', error);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  // Step 1: Find Trip
  const findTrip = async () => {
    setActiveField(null);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setFare(response.data);

      const sourceResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
        {
          params: { address: pickup },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const destinationResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
        {
          params: { address: destination },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSourceCoords(sourceResponse.data);
      setDestinationCoords(destinationResponse.data);

      setCurrentStep('vehicle');
    } catch (error) {
      setErrorModal("Error fetching fare or coordinates: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm Ride created (once ConfirmRide finishes)
  const handleRideConfirmed = (rideData) => {
    setRide(rideData);
    setCurrentStep('confirmed');
  };

  // Reset everything
  const resetFlow = () => {
    setPickup('');
    setDestination('');
    setPickupSuggestions([]);
    setDestinationSuggestions([]);
    setActiveField(null);
    setFare({});
    setVehicleType(null);
    setRide(null);
    setSourceCoords(null);
    setDestinationCoords(null);
    setRideDate("");
    setRideTime("");
    setPaymentMethod("cash");
    setCurrentStep('input');
  };

  // Back steps
  const getPreviousStep = () => {
    if (currentStep === 'vehicle') return 'input';
    if (currentStep === 'confirm') return 'vehicle';
    if (currentStep === 'confirmed') return 'input';
    return null;
  };

  const handleBack = () => {
    const prevStep = getPreviousStep();
    if (prevStep) {
      setPendingStep(prevStep);
      setShowBackConfirm(true);
    }
  };

  const confirmBack = () => {
    if (currentStep === 'confirmed') {
      resetFlow();
    } else {
      setCurrentStep(pendingStep);
    }
    setPendingStep(null);
    setShowBackConfirm(false);
  };

  const cancelBack = () => {
    setPendingStep(null);
    setShowBackConfirm(false);
  };

  return (
    <>
      <DynamicHero />
      <Usersnavbar />
      <div className="min-h-screen bg-gray-100 text-gray-800 overflow-y-auto mt-8 p-2">
        <div className="p-2 bg-gray-200 relative">
          <div className="mb-4">
            <p className="ml-16 text-sm text-gray-600">
              Step: <span className="font-semibold">{currentStep.toUpperCase()}</span>
            </p>
            <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width:
                    currentStep === 'input'
                      ? '33%'
                      : currentStep === 'vehicle'
                      ? '66%'
                      : (currentStep === 'confirm' || currentStep === 'confirmed')
                      ? '100%'
                      : '0%'
                }}
              ></div>
            </div>
          </div>

          {currentStep !== 'input' && (
            <button
              onClick={handleBack}
              className="absolute top-1 left-4 text-xl text-black hover:text-gray-700 z-[60]"
              title="Go Back"
            >
              <FaArrowLeft />
            </button>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-gray-300 bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-xl font-semibold text-gray-800 animate-pulse">
                Loading...
              </div>
            </div>
          )}

          <CSSTransition key={currentStep} nodeRef={nodeRef} in appear timeout={300} classNames="slide">
            <div ref={nodeRef}>
              {/* Step: input */}
              {currentStep === 'input' && (
                <>
                  <h4 className="text-2xl font-semibold mb-3 animate-fade-in">Find a trip</h4>
                  <form className="relative pb-3" onSubmit={submitHandler}>
                    {/* Pickup Input */}
                    <div
                      className="relative mb-3"
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    >
                      <input
                        onClick={() => setActiveField('pickup')}
                        value={pickup || ""}
                        onChange={handlePickupChange}
                        className="bg-gray-300 text-gray-800 px-12 py-2 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-all"
                        type="text"
                        placeholder="Add a pick-up location"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (navigator.geolocation) {
                            setIsLoadingLocation(true);
                            navigator.geolocation.getCurrentPosition(
                              async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                  // Use Nominatim API for reverse geocoding
                                  const response = await axios.get(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                  );
                                  console.log("Reverse geocode response:", response.data);
                                  if (response.data && response.data.display_name) {
                                    setPickup(response.data.display_name);
                                  } else {
                                    setErrorModal("No human-readable address found.");
                                  }
                                } catch (error) {
                                  setErrorModal("Error fetching reverse geocode: " + error.message);
                                } finally {
                                  setIsLoadingLocation(false);
                                }
                              },
                              (error) => {
                                setErrorModal("Error getting geolocation: " + error.message);
                                setIsLoadingLocation(false);
                              }
                            );
                          } else {
                            setErrorModal("Geolocation is not supported by this browser.");
                          }
                        }}
                        className="absolute right-3 top-1/3 transform -translate-y-1/2 text-gray-600 hover:text-gray-700"
                      >
                        {isLoadingLocation ? (
                          <FaSpinner className="text-xl animate-spin" />
                        ) : (
                          <FaLocationArrow className="text-xl" />
                        )}
                      </button>
                      {activeField === 'pickup' && pickupSuggestions.length > 0 && (
                        <LocationSearchPanel
                          suggestions={pickupSuggestions}
                          loading={false}
                          onSelect={(suggestion) => {
                            setPickup(suggestion);
                            setActiveField(null);
                          }}
                        />
                      )}
                    </div>

                    {/* Destination Input */}
                    <div
                      className="relative mb-3"
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    >
                      <input
                        onClick={() => setActiveField('destination')}
                        value={destination || ""}
                        onChange={handleDestinationChange}
                        className="bg-gray-300 text-gray-800 px-12 py-2 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-all"
                        type="text"
                        placeholder="Enter your destination"
                      />
                      {activeField === 'destination' && destinationSuggestions.length > 0 && (
                        <LocationSearchPanel
                          suggestions={destinationSuggestions}
                          loading={false}
                          onSelect={(suggestion) => {
                            setDestination(suggestion);
                            setActiveField(null);
                          }}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={findTrip}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-3 w-full hover:bg-blue-700 transition-all"
                    >
                      Find Trip
                    </button>
                  </form>
                </>
              )}

              {/* Step: vehicle */}
              {currentStep === 'vehicle' && (
                
                <VehiclePanel
                  selectVehicle={(type) => setVehicleType(type)}
                  fare={fare}
                  setConfirmRidePanel={() => setCurrentStep('confirm')}
                  setVehiclePanel={() => setCurrentStep('input')}
                />
              )}

              {/* Step: confirm */}
              {currentStep === 'confirm' && (
                <ConfirmRide
                  pickup={pickup}
                  destination={destination}
                  fare={fare}
                  vehicleType={vehicleType}
                  rideDate={rideDate}
                  rideTime={rideTime}
                  paymentMethod={paymentMethod}
                  setRideDate={setRideDate}
                  setRideTime={setRideTime}
                  setPaymentMethod={setPaymentMethod}
                  buttonDisabled={confirmSubmitting}
                  onConfirmRideSuccess={(rideData) => {
                    handleRideConfirmed(rideData);
                  }}
                />
              )}

              {/* Step: confirmed */}
              {currentStep === 'confirmed' && (
                <div className="bg-green-500 p-6 rounded-lg text-center text-white animate-fade-in">
                  <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
                  <p className="mb-4">Your ride has been confirmed.</p>
                  <button onClick={resetFlow} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                    OK
                  </button>
                </div>
              )}
            </div>
          </CSSTransition>
        </div>
      </div>

      {/* Back Confirmation Modal */}
      {showBackConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-400 bg-opacity-75 z-50">
          <div className="bg-gray-200 rounded-lg p-6 max-w-sm mx-4 animate-modal">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to go back?</h3>
            <p className="mb-4 text-gray-600">Your current progress will be lost.</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelBack} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                No
              </button>
              <button onClick={confirmBack} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4 animate-modal">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Error</h3>
            <p className="text-gray-600 mb-4">{errorModal}</p>
            <button
              onClick={() => setErrorModal("")}
              className="w-full bg-red-600 text-white font-semibold p-2 rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Home;
