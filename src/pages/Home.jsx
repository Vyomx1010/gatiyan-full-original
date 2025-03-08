import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import { CSSTransition } from 'react-transition-group';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import { FaLocationArrow, FaArrowLeft } from 'react-icons/fa';
import Usersnavbar from '../components/Usersnavbar';

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

  // Loader while finding trip
  const [isLoading, setIsLoading] = useState(false);

  // Back confirmation
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  // For CSSTransition
  const nodeRef = useRef(null);

  // Prefill pickup and destination if passed from Start or stored in localStorage
  useEffect(() => {
    if (location.state && location.state.pickup && location.state.destination) {
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

  useEffect(() => {
    socket.emit('join', { userType: 'user', userId: user._id });
  }, [user, socket]);

  useEffect(() => {
    const handleRideStarted = (ride) => {
      console.log('Ride started:', ride);
      navigate('/riding', { state: { ride } });
    };
    socket.on('ride-started', handleRideStarted);
    return () => {
      socket.off('ride-started', handleRideStarted);
    };
  }, [socket, navigate]);

  // Button panel functions
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
        console.error('Error fetching pickup suggestions:', error);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

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
        console.error('Error fetching destination suggestions:', error);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  // Button panel submission (if needed)
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
      console.error('Error fetching fare or coordinates:', error);
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
      <style>{`
        /* Slide animations for CSSTransition */
        .slide-enter {
          opacity: 0;
          transform: translateY(20%);
        }
        .slide-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 300ms ease-out;
        }
        .slide-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .slide-exit-active {
          opacity: 0;
          transform: translateY(20%);
          transition: all 300ms ease-out;
        }
        
        /* Additional Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes modal-zoom {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal {
          animation: modal-zoom 0.3s ease-out;
        }
      `}</style>
      <Usersnavbar />
      <div className="min-h-screen bg-gray-100 text-gray-800 overflow-y-auto">
        {/* Map always visible */}
        <div style={{ height: '50vh' }}>
          <LiveTracking sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
        </div>

        {/* Bottom Panel */}
        <div style={{ minHeight: '40vh' }} className="p-6 bg-gray-200 relative">
          {/* Back Icon */}
          {currentStep !== 'input' && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 text-xl text-gray-600 hover:text-gray-700 z-[60]"
              title="Go Back"
            >
              <FaArrowLeft />
            </button>
          )}

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-300 bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-xl font-semibold text-gray-800 animate-pulse">Loading...</div>
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
                    <div className="relative mb-3">
                      <input
                        onClick={() => setActiveField('pickup')}
                        value={pickup}
                        onChange={handlePickupChange}
                        className="bg-gray-300 text-gray-800 px-12 py-2 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-all"
                        type="text"
                        placeholder="Add a pick-up location"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                  const response = await axios.get(
                                    `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
                                    {
                                      params: { address: `${latitude},${longitude}` },
                                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    }
                                  );
                                  setPickup(response.data.formatted_address);
                                } catch (error) {
                                  console.error('Error fetching coordinates:', error);
                                }
                              },
                              (error) => {
                                console.error('Error getting geolocation:', error.message);
                                alert('Unable to access your current location. Please enable location services.');
                              }
                            );
                          } else {
                            alert('Geolocation is not supported by this browser.');
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-700 animate-pulse"
                      >
                        <FaLocationArrow className="text-xl" />
                      </button>
                      {activeField === 'pickup' && pickupSuggestions.length > 0 && (
                        <LocationSearchPanel
                          suggestions={pickupSuggestions}
                          onSelect={(suggestion) => {
                            setPickup(suggestion);
                            setActiveField(null);
                          }}
                        />
                      )}
                    </div>

                    {/* Destination Input */}
                    <div className="relative mb-3">
                      <input
                        onClick={() => setActiveField('destination')}
                        value={destination}
                        onChange={handleDestinationChange}
                        className="bg-gray-300 text-gray-800 px-12 py-2 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-all"
                        type="text"
                        placeholder="Enter your destination"
                      />
                      {activeField === 'destination' && destinationSuggestions.length > 0 && (
                        <LocationSearchPanel
                          suggestions={destinationSuggestions}
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
    </>
  );
};

export default Home;