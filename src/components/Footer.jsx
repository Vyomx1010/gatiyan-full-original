import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If element not found on current page, navigate to home page with the hash
      navigate(`/#${id}`);
    }
  };

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Gatiyan</h3>
            <p className="text-gray-400">Your premium ride service</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95">
                  Premium Rides
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95">
                  Airport Transfer
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95">
                  Corporate Service
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/gatiyancabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/917470320917"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        {/* Additional Policy Links */}
        <div className="mt-8 flex justify-center space-x-6">
          <a
            href="/terms-and-conditions"
            className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
          >
            Terms &amp; Conditions
          </a>
          <a
            href="/privacy-policy"
            className="text-gray-400 hover:text-white transition transform hover:scale-105 active:scale-95"
          >
            Privacy Policy
          </a>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 Gatiyan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
