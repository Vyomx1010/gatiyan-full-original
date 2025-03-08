import React from 'react';
import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

const stats = [
  { 
    label: 'Fast book using WhatsApp', 
    value: '+917470320917', 
    icon: FaWhatsapp, 
    url: 'https://wa.me/917470320917' 
  },
  { 
    label: 'Fast book by Call', 
    value: '+917470320917', 
    icon: FaPhone, 
    url: 'tel:+917470320917' 
  },
];

const StatsSection = () => {
  return (
    <div className="bg-black text-white py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <FadeInSection
                key={index}
                direction="up"
                delay={index * 0.1}
                className="text-center"
              >
                <a href={stat.url} target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="cursor-pointer p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                  >
                    <div className="flex justify-center items-center mb-4">
                      <IconComponent className="text-5xl" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-gray-400">{stat.label}</div>
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
