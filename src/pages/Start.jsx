import { useState } from 'react';
import { Car, Shield, Clock } from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import Input from '../components/Landing/Input';
import Button from '../components/Landing/Button';
import HeroBackground from '../components/Landing/HeroBackground';
import StatsSection from '../components/Landing/StatsSection';
import TestimonialCard from '../components/Landing/TestimonialCard';
import FloatingBooking from '../components/Landing/FloatingBooking';
import ScrollToTop from '../components/Landing/ScrollToTop';
import { Link, useNavigate } from 'react-router-dom';
import { FaLocationArrow, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import LocationSearchPanel from '../components/LocationSearchPanel';
import GatiyanSections from '../components/GatiyanSections';
import Footer from '../components/Footer';

function Start() {
  const navigate = useNavigate();

  // Ride input states
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  // Loader state for get-coordinates call
  const [isLoading, setIsLoading] = useState(false);

  // States for suggestions and active field
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // New loading states for suggestions
  const [isLoadingPickupSuggestions, setIsLoadingPickupSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);

  // State for FAQ toggle functionality: [q1, q2, q3]
  const [faqOpen, setFaqOpen] = useState([false, false, false]);

  // Redesigned Services data with icons and descriptive text
  const services = [
    {
      title: "Premium Rides",
      icon: Car,
      description: "Experience luxury with our top-of-the-line vehicles and impeccable service. Travel in style and comfort every time."
    },
    {
      title: "Safe Journey",
      icon: Shield,
      description: "Your safety is our priority. Our drivers are thoroughly vetted, and our vehicles are maintained with the highest standards."
    },
    {
      title: "24/7 Availability",
      icon: Clock,
      description: "No matter when you need us, our service is always on. We are available round the clock to cater to your transportation needs."
    }
  ];

  const testimonials = [
    {
      name: "Harish Jain",
      role: "Business Executive",
      content: "The best cab service I've ever used. Professional drivers and luxurious cars.",
      image: "#",
      rating: 5
    },
    {
      name: "Meena Sharma",
      role: "Frequent Traveler",
      content: "Reliable and comfortable. My go-to choice for airport transfers.",
      image: "#",
      rating: 5
    },
    {
      name: "Rahul Singh",
      role: "Corporate Client",
      content: "Exceptional service and attention to detail. Highly recommended!",
      image: "#",
      rating: 5
    }
  ];

  // Dummy data for How It Works section
  const howItWorks = [
    {
      step: "1",
      title: "Book Your Ride",
      description: "Enter your pickup and destination details, and get an instant estimate."
    },
    {
      step: "2",
      title: "Get Matched",
      description: "Our system matches you with the best available driver in your area."
    },
    {
      step: "3",
      title: "Enjoy Your Trip",
      description: "Relax and enjoy a safe, comfortable, and luxurious ride."
    }
  ];

  // Scroll instantly without any animation
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'auto' });
    }
  };

  // Fetch pickup suggestions as user types
  const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickup(value);
    if (value.length >= 3) {
      setIsLoadingPickupSuggestions(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: value },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setPickupSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching pickup suggestions:', error);
        setPickupSuggestions([]);
      } finally {
        setIsLoadingPickupSuggestions(false);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  // Fetch destination suggestions as user types
  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);
    if (value.length >= 3) {
      setIsLoadingDestinationSuggestions(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: value },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setDestinationSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
        setDestinationSuggestions([]);
      } finally {
        setIsLoadingDestinationSuggestions(false);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  // Autofill pickup with current location using geolocation and show loader
  const autofillPickup = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
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
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting geolocation:', error.message);
          alert('Unable to access your current location. Please enable location services.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // On form submit, if user is logged in, pass input to Home; otherwise store input and navigate to login
  const handleSubmit = (e) => {
    e.preventDefault();
    const rideInput = { pickup, destination };
    if (localStorage.getItem('token')) {
      navigate('/home', { state: rideInput });
    } else {
      localStorage.setItem('rideInput', JSON.stringify(rideInput));
      navigate('/home');
    }
  };

  // Toggle FAQ item at given index
  const toggleFaq = (index) => {
    setFaqOpen(prevState => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={scrollToSection} />
      <FloatingBooking />
      <ScrollToTop />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <HeroBackground />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-6">
                GatiYan Your Premium Cab Service
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Experience luxury and comfort with Gatiyan's premium ride service.
              </p>
              <div className="flex gap-4">
                <div>
                  <Link to="/home">
                    <Button variant="primary" size="lg" onClick={() => scrollToSection('services')}>
                      Make Ride
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link to="/captain-login">
                    <Button variant="outline" size="lg" onClick={() => scrollToSection('faq')}>
                      Join as Captain
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Book Your Ride</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Pickup Field */}
                  <div
                    className="relative"
                    onBlur={() => setTimeout(() => setActiveField(null), 200)}
                  >
                    <Input
                      value={pickup}
                      onChange={handlePickupChange}
                      placeholder="Pickup Location"
                      type="text"
                      className="bg-white text-black placeholder:text-gray-400"
                      onClick={() => setActiveField('pickup')}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isLoading ? (
                        <FaSpinner className="text-xl animate-spin text-gray-600" />
                      ) : (
                        <button
                          type="button"
                          onClick={autofillPickup}
                          className="text-gray-600 hover:text-black"
                        >
                          <FaLocationArrow className="text-xl" />
                        </button>
                      )}
                    </div>
                    {activeField === 'pickup' && (
                      <LocationSearchPanel
                        suggestions={pickupSuggestions}
                        loading={isLoadingPickupSuggestions}
                        onSelect={(suggestion) => {
                          setPickup(suggestion);
                          setActiveField(null);
                        }}
                      />
                    )}
                  </div>
                  {/* Destination Field */}
                  <div
                    className="relative"
                    onBlur={() => setTimeout(() => setActiveField(null), 200)}
                  >
                    <Input
                      value={destination}
                      onChange={handleDestinationChange}
                      placeholder="Destination"
                      type="text"
                      className="bg-white text-black placeholder:text-gray-400"
                      onClick={() => setActiveField('destination')}
                      required
                    />
                    {activeField === 'destination' && (
                      <LocationSearchPanel
                        suggestions={destinationSuggestions}
                        loading={isLoadingDestinationSuggestions}
                        onSelect={(suggestion) => {
                          setDestination(suggestion);
                          setActiveField(null);
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <Button variant="primary" className="w-full" type="submit">
                      Get Estimate
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />

      {/* Redesigned Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 transform transition hover:-translate-y-2 hover:shadow-2xl">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center p-6 border rounded-lg hover:shadow-lg transition">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Images and banner description */}
      <GatiyanSections />

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Toggle Functionality */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* FAQ Item 1 */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full text-left flex justify-between items-center text-2xl font-semibold"
              >
                <span>How do I book a ride?</span>
                <span>{faqOpen[0] ? '-' : '+'}</span>
              </button>
              {faqOpen[0] && (
                <p className="mt-2 text-gray-600">
                  Simply enter your pickup and destination details in the booking form and click "Get Estimate" to start.
                </p>
              )}
            </div>
            {/* FAQ Item 2 */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full text-left flex justify-between items-center text-2xl font-semibold"
              >
                <span>Is my ride safe?</span>
                <span>{faqOpen[1] ? '-' : '+'}</span>
              </button>
              {faqOpen[1] && (
                <p className="mt-2 text-gray-600">
                  Yes, all our drivers are verified and our vehicles are maintained to ensure a safe journey.
                </p>
              )}
            </div>
            {/* FAQ Item 3 */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full text-left flex justify-between items-center text-2xl font-semibold"
              >
                <span>Can I book rides in advance?</span>
                <span>{faqOpen[2] ? '-' : '+'}</span>
              </button>
              {faqOpen[2] && (
                <p className="mt-2 text-gray-600">
                  Yes, our system allows you to book rides in advance. Simply select your desired date and time, and we will take care of the rest.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default Start;
