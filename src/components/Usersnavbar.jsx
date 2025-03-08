import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const UsersNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Define dark-themed color configurations for each route
  const routeThemes = {
    '/': {
      base: 'bg-gradient-to-r from-gray-800 to-gray-900',
      scrolled: 'bg-gray-900',
      text: 'text-gray-100',
      scrolledText: 'text-gray-300',
      hover: 'hover:text-gray-400',
      scrolledHover: 'hover:text-gray-200',
      mobileBg: 'bg-gray-800'
    },
    '/home': {
      base: 'bg-gradient-to-r from-gray-700 to-gray-800',
      scrolled: 'bg-gray-900',
      text: 'text-gray-100',
      scrolledText: 'text-gray-300',
      hover: 'hover:text-gray-400',
      scrolledHover: 'hover:text-gray-200',
      mobileBg: 'bg-gray-700'
    },
    '/mytransactions-all': {
      base: 'bg-gradient-to-r from-gray-700 to-gray-800',
      scrolled: 'bg-gray-900',
      text: 'text-gray-100',
      scrolledText: 'text-gray-300',
      hover: 'hover:text-gray-400',
      scrolledHover: 'hover:text-gray-200',
      mobileBg: 'bg-gray-700'
    },
    '/user/history': {
      base: 'bg-gradient-to-r from-gray-700 to-gray-800',
      scrolled: 'bg-gray-900',
      text: 'text-gray-100',
      scrolledText: 'text-gray-300',
      hover: 'hover:text-gray-400',
      scrolledHover: 'hover:text-gray-200',
      mobileBg: 'bg-gray-700'
    },
    '/user/logout': {
      base: 'bg-gradient-to-r from-gray-900 to-black',
      scrolled: 'bg-gray-900',
      text: 'text-gray-100',
      scrolledText: 'text-gray-300',
      hover: 'hover:text-gray-400',
      scrolledHover: 'hover:text-gray-200',
      mobileBg: 'bg-gray-800'
    }
  };

  const currentTheme = routeThemes[location.pathname] || routeThemes['/home'];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/home', label: 'Book Ride' },
    { path: '/mytransactions-all', label: 'My transactions' },
    { path: '/user/history', label: 'Rides History' },
    { path: '/user/logout', label: 'Logout' }
  ];

  return (
    <nav
      className={`fixed top-0 w-full transition-all duration-500 z-50 ${
        isScrolled ? `shadow-lg ${currentTheme.scrolled}` : currentTheme.base
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <h1
              className={`text-xl font-bold transition-colors duration-500 ${
                isScrolled ? currentTheme.scrolledText : currentTheme.text
              }`}
            >
              GatiYan
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isLogout = link.label === 'Logout';
              const baseClasses = isLogout
                ? 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300'
                : `relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group ${
                    isScrolled
                      ? `text-gray-300 ${currentTheme.scrolledHover}`
                      : `${currentTheme.text} ${currentTheme.hover}`
                  }`;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={baseClasses}
                >
                  {link.label}
                  {!isLogout && (
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                        isScrolled ? currentTheme.scrolledText : 'bg-gray-100'
                      } ${isActive ? 'scale-x-100' : ''}`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition duration-300 ${
                isScrolled ? currentTheme.scrolledText : currentTheme.text
              } hover:bg-black hover:bg-opacity-20`}
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
                <span
                  className={`block w-5 h-0.5 transition-all duration-300 bg-current ${
                    isMobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 transition-all duration-300 bg-current ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 transition-all duration-300 bg-current ${
                    isMobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`px-2 pt-2 pb-3 space-y-2 shadow-lg ${
            isScrolled ? 'bg-gray-900' : currentTheme.mobileBg
          }`}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const isLogout = link.label === 'Logout';
            const baseClasses = isLogout
              ? 'block bg-red-600 text-white px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300'
              : `block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isScrolled
                    ? `text-gray-300 ${currentTheme.scrolledHover} hover:bg-gray-800`
                    : `${currentTheme.text} hover:bg-black hover:bg-opacity-10`
                } ${isActive ? (isScrolled ? `${currentTheme.scrolledText} bg-gray-800` : 'bg-black bg-opacity-10') : ''}`;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={baseClasses}
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

export default UsersNavbar;