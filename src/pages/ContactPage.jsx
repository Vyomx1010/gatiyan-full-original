import React, { useState, useCallback } from 'react';
import axios from 'axios'; // Using axios instead of fetch
import { MapPin, Phone, Mail, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from "../components/Landing/Navbar";

// Custom Dialog Component
const Dialog = ({ isOpen, onClose, title, description, icon, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
        <div className="mb-4">
          <div className={`flex items-center gap-2 text-xl font-semibold ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {icon}
            {title}
          </div>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-black"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 border-4 border-gray-300 rounded-full animate-spin border-t-black animation-delay-150"></div>
      </div>
    </div>
  </div>
);

const ContactInfoItem = ({ icon, title, lines }) => (
  <div className="flex items-center space-x-4 transition-all hover:translate-x-2 group">
    <div className="p-3 bg-white text-black rounded-full group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="font-medium">{title}</p>
      {lines.map((line, index) => (
        <p key={index} className="text-gray-300">{line}</p>
      ))}
    </div>
  </div>
);

// Memoized Form Input Component
const FormInput = React.memo(({ label, type, name, value, onChange, placeholder, maxLength }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black transition-all"
        required
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black transition-all"
        required
        placeholder={placeholder}
        maxLength={maxLength}
      />
    )}
  </div>
));

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const validatePhone = (phone) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); // Auto-close error dialog after 5s
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/contact/submit`,
        {
          name: formData.name,
          email: formData.email,
          message: `${formData.message}\n\nPhone: ${formData.phone}` // Include phone in message
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.status === 200) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' }); // Reset form
        setTimeout(() => setShowSuccess(false), 5000); // Auto-close success dialog after 5s
      }
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); // Auto-close error dialog after 5s
    } finally {
      setIsSubmitting(false);
    }
  };

  // useCallback to prevent unnecessary re-creation of the handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src="/api/placeholder/1920/600" 
            alt="Taxi Service"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-6xl font-bold tracking-wider animate-fade-in mb-4">
              Contact GatiYan
            </h1>
            <p className="text-xl text-gray-300 animate-fade-in-delayed">
              Your Trusted Travel Partner
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-12">
              <div className="animate-slide-up">
                <h2 className="text-3xl font-semibold mb-8">Get in Touch</h2>
                <div className="space-y-8">
                  <ContactInfoItem
                    icon={<MapPin className="w-6 h-6" />}
                    title="Our Location"
                    lines={['Dhawari Satna, Gali No.1', 'Madhya Pradesh - 485001']}
                  />
                  <ContactInfoItem
                    icon={<Phone className="w-6 h-6" />}
                    title="Call Us"
                    lines={['+91 7470320917']}
                  />
                  <ContactInfoItem
                    icon={<Mail className="w-6 h-6" />}
                    title="Email Us"
                    lines={[ 'support.gatiyan@gatiyan.in']}
                  />
                  <ContactInfoItem
                    icon={<Clock className="w-6 h-6" />}
                    title="Working Hours"
                    lines={['24/7 Service Available', 'Office: 9 AM - 8 PM (IST)']}
                  />
                </div>
              </div>

              {/* Map Image */}
              <div className="relative h-64 rounded-xl overflow-hidden animate-fade-in shadow-2xl">
                <img 
                  src="/api/placeholder/800/400" 
                  alt="Office Location Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white text-black p-8 rounded-xl shadow-2xl animate-slide-up">
              <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />

                <FormInput
                  label="Mobile Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />

                <FormInput
                  label="Your Message"
                  type="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <span className="group-hover:scale-105 transition-transform inline-block">
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Message Sent Successfully!"
          description="Thank you for contacting GatiYan. Our team will get back to you within 24 hours."
          icon={<CheckCircle2 className="w-6 h-6" />}
          type="success"
        />

        {/* Error Dialog */}
        <Dialog
          isOpen={showError}
          onClose={() => setShowError(false)}
          title="Message Not Sent"
          description="There was an error sending your message or invalid phone number. Please try again or contact us directly at +91 84350 61006."
          icon={<XCircle className="w-6 h-6" />}
          type="error"
        />

        <style jsx>{`
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fade-in-delayed {
            0% { opacity: 0; transform: translateY(10px); }
            50% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          
          .animate-fade-in-delayed {
            animation: fade-in-delayed 1.2s ease-out;
          }
          
          .animation-delay-150 {
            animation-delay: 150ms;
          }
        `}</style>
      </div>
    </>
  );
};

export default ContactPage;