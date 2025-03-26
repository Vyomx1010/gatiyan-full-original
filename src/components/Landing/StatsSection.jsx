import React from 'react';
import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

const stats = [
  {
    label: 'Fast book using WhatsApp',
    value: '+91 7470320917',
    icon: FaWhatsapp,
    url: 'https://wa.me/917470320917',
    bgColor: 'bg-[#25D366]', // Original WhatsApp green
    textColor: 'text-white'
  },
  {
    label: 'Fast book using Calling services',
    value: '+91 7470320917',
    icon: FaPhone,
    url: 'tel:+917470320917',
    bgColor: 'bg-blue-500',
    textColor: 'text-white'
  }
];

const StatsSection = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-white mb-12 uppercase tracking-wide">
          Contact Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <FadeInSection
                key={index}
                direction="up"
                delay={index * 0.1}
                className="transform transition-all duration-300 hover:scale-105"
              >
                <a href={stat.url} target="_blank" rel="noopener noreferrer">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 15 
                    }}
                    className={`
                      ${stat.bgColor} ${stat.textColor}
                      rounded-2xl shadow-2xl overflow-hidden
                      transform transition-all duration-300
                      hover:shadow-3xl
                    `}
                  >
                    <div className="p-6 text-center">
                      <div className="flex justify-center items-center mb-4">
                        <IconComponent className="text-6xl" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 tracking-wider">
                        {stat.label}
                      </h3>
                      
                      <div className="text-2xl font-bold tracking-widest">
                        {stat.value}
                      </div>
                    </div>
                  </motion.div>
                </a>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;