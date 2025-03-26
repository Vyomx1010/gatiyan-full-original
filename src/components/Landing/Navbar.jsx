import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/bgremoved--logowhite-removebg-preview.png';

const Navbar = ({ onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("user"); // default to user
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check login state and userType from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedType = localStorage.getItem("userType");
    if (storedType && storedType.toLowerCase() === "captain") {
      setUserType("captain");
    } else {
      setUserType("user");
    }
    if (token && token !== "undefined" && token.trim() !== "") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setIsLoggedIn(false);
    navigate("/"); // Redirect to landing page after logout
  };

  const handleNavClick = (id) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <motion.header
      className={`fixed w-full z-30 transition-all duration-300 ${scrolled ? 'bg-black/95 shadow-lg' : 'bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => onNavigate('top')} className="flex items-center space-x-2">
            <img className="w-26 h-12" src={logo} alt="Logo" />
            <span className="text-4xl font-bold text-white mt-2">GatiYan</span>
          </button>
          <nav className="hidden md:flex items-center space-x-6">
            {userType === "user" ? (
              <>
                <Link to="/home">
                  <button onClick={() => handleNavClick('services')} className="text-gray-300 hover:text-white transition">
                    Book Fast
                  </button>
                </Link>
                <Link to="/">
                  <button onClick={() => handleNavClick('services')} className="text-gray-300 hover:text-white transition">
                    Services
                  </button>
                </Link>
                <Link to="/contact">
                  <button onClick={() => handleNavClick('contact')} className="text-gray-300 hover:text-white transition">
                    Contact
                  </button>
                </Link>
                {isLoggedIn ? (
                  <>
                    <Link to="/user/history">
                      <button onClick={() => handleNavClick('history')} className="text-gray-300 hover:text-white transition">
                        Rides History
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="text-gray-300 hover:text-white transition">
                        Login
                      </button>
                    </Link>
                    <Link to="/signup">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                        Signup
                      </button>
                    </Link>
                  </>
                )}
              </>
            ) : (
              // Captain's menu
              <>
                <Link to="/captain-home">
                  <button onClick={() => handleNavClick('dashboard')} className="text-gray-300 hover:text-white transition">
                    Dashboard
                  </button>
                </Link>
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/captain-login">
                      <button className="text-gray-300 hover:text-white transition">
                        Login
                      </button>
                    </Link>
                    <Link to="/captain-signup">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                        Signup
                      </button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-black/95"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="px-4 py-4 space-y-4">
              {userType === "user" ? (
                <>
                  <Link to="/home">
                    <button onClick={() => handleNavClick('services')} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                      Book Fast
                    </button>
                  </Link>
                  <Link to="/">
                    <button onClick={() => handleNavClick('services')} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                      Services
                    </button>
                  </Link>
                  <Link to="/contact">
                    <button onClick={() => handleNavClick('contact')} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                      Contact
                    </button>
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <Link to="/user/history">
                        <button onClick={() => handleNavClick('history')} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                          Rides History
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left bg-red-600 hover:bg-red-700 text-white transition mb-4 text-xl"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <button onClick={() => setMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                          Login
                        </button>
                      </Link>
                      <Link to="/signup">
                        <button onClick={() => setMenuOpen(false)} className="block w-full text-left bg-blue-600 hover:bg-blue-700 text-white transition mb-4 text-xl">
                          Signup
                        </button>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/captain-home">
                    <button onClick={() => handleNavClick('dashboard')} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                      Dashboard
                    </button>
                  </Link>
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left bg-red-600 hover:bg-red-700 text-white transition mb-4 text-xl"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/captain-login">
                        <button onClick={() => setMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-white transition mb-4 text-xl">
                          Login
                        </button>
                      </Link>
                      <Link to="/captain-signup">
                        <button onClick={() => setMenuOpen(false)} className="block w-full text-left bg-blue-600 hover:bg-blue-700 text-white transition mb-4 text-xl">
                          Signup
                        </button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
