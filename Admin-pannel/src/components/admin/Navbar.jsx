import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Route-based color theme mapping
  const routeThemes = {
    '/admin/dashboard': {
      base: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-purple-600',
      hover: 'hover:text-purple-200',
      scrolledHover: 'hover:text-purple-600',
      mobileBg: 'bg-purple-700'
    },
    '/admin/users': {
      base: 'bg-gradient-to-r from-blue-600 to-cyan-500',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-blue-600',
      hover: 'hover:text-blue-200',
      scrolledHover: 'hover:text-blue-600',
      mobileBg: 'bg-blue-700'
    },
    '/admin/captains': {
      base: 'bg-gradient-to-r from-emerald-600 to-teal-500',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-emerald-600',
      hover: 'hover:text-emerald-200',
      scrolledHover: 'hover:text-emerald-600',
      mobileBg: 'bg-emerald-700'
    },
    '/admin/rides': {
      base: 'bg-gradient-to-r from-orange-500 to-amber-500',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-orange-600',
      hover: 'hover:text-orange-200',
      scrolledHover: 'hover:text-orange-600',
      mobileBg: 'bg-orange-700'
    },
    '/admin/payments': {
      base: 'bg-gradient-to-r from-rose-600 to-pink-500',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-rose-600',
      hover: 'hover:text-rose-200',
      scrolledHover: 'hover:text-rose-600',
      mobileBg: 'bg-rose-700'
    },
    '/admin/login': {
      base: 'bg-gradient-to-r from-gray-700 to-gray-600',
      scrolled: 'bg-white',
      text: 'text-white',
      scrolledText: 'text-gray-600',
      hover: 'hover:text-gray-200',
      scrolledHover: 'hover:text-gray-600',
      mobileBg: 'bg-gray-700'
    }
  };

  const currentTheme = routeThemes[location.pathname] || routeThemes['/admin/dashboard'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/captains', label: 'Captains' },
    { path: '/admin/rides', label: 'Rides' },
    { path: '/admin/payments', label: 'Payments' },
    { path: '/admin/login', label: 'Logout' }
  ];

  return (
    <nav className={`fixed top-0 w-full transition-all duration-500 z-50 
      ${isScrolled ? 'shadow-lg ' + currentTheme.scrolled : currentTheme.base}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className={`text-xl font-bold transition-colors duration-500
              ${isScrolled ? currentTheme.scrolledText : currentTheme.text}`}>
              Admin Panel
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const linkTheme = routeThemes[link.path];
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300
                    ${isScrolled ? 
                      `text-gray-600 ${currentTheme.scrolledHover}` : 
                      `${currentTheme.text} ${currentTheme.hover}`
                    }
                    group
                  `}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 
                    ${isScrolled ? linkTheme.scrolledText : 'bg-white'}
                    transform origin-left scale-x-0 
                    transition-transform duration-300 group-hover:scale-x-100
                    ${isActive ? 'scale-x-100' : ''}`}>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md 
                ${isScrolled ? currentTheme.scrolledText : currentTheme.text}
                hover:bg-opacity-20 hover:bg-black
                transition duration-300`}
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
                <span className={`block w-5 h-0.5 transition-all duration-300 
                  ${isScrolled ? `bg-current` : 'bg-current'}
                  ${isMobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}>
                </span>
                <span className={`block w-5 h-0.5 transition-all duration-300 
                  ${isScrolled ? `bg-current` : 'bg-current'}
                  ${isMobileMenuOpen ? 'opacity-0' : ''}`}>
                </span>
                <span className={`block w-5 h-0.5 transition-all duration-300 
                  ${isScrolled ? `bg-current` : 'bg-current'}
                  ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}>
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} 
        overflow-hidden`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 shadow-lg
          ${isScrolled ? 'bg-white' : currentTheme.mobileBg}`}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium 
                  transition-all duration-300
                  ${isScrolled ?
                    `text-gray-600 ${currentTheme.scrolledHover} hover:bg-gray-50` :
                    `${currentTheme.text} hover:bg-black hover:bg-opacity-10`
                  }
                  ${isActive ? 
                    (isScrolled ? `${currentTheme.scrolledText} bg-gray-50` : 'bg-black bg-opacity-10') : ''
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;