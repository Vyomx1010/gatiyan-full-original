import React from "react";
import { Link } from "react-router-dom";
import { Car, Map, Clock, CreditCard, User, Landmark } from "lucide-react";

const GatiyanSections = () => {
  const sectionsData = [
    {
      title: "Use the Gatiyan app to help you travel your way",
      description: "There's more than one way to move with Gatiyan, no matter where you are or where you're headed next.",
      buttonText: "Search ride options",
      buttonRoute: "/home",
      buttonSecondary: null,
      signupText: null,
      signupRoute: null,
      icon: <Car size={48} strokeWidth={1.5} />,
      backgroundColor: "#e6f7ff"
    },
    {
      title: "Log in to see your recent activity",
      description: "View past trips, tailored suggestions, support resources, and more.",
      buttonText: "Log in to your account",
      buttonRoute: "/login",
      buttonSecondary: null,
      signupText: "Don't have a Gatiyan account? Sign up",
      signupRoute: "/signup",
      icon: <Clock size={48} strokeWidth={1.5} />,
      backgroundColor: "#fff7e6"
    },
    {
      title: "Drive when you want, earn what you need",
      description: "Make money on your schedule. You can use your own car to earn money through Gatiyan.",
      buttonText: "Get started",
      buttonRoute: "/captain-login",
      buttonSecondary: "Already drive with Gatiyan?",
      buttonSecondaryRoute: "/captain-signup",
      signupText: null,
      signupRoute: null,
      icon: <CreditCard size={48} strokeWidth={1.5} />,
      backgroundColor: "#f6ffed"
    }
  ];

  const generateIllustration = (index) => {
    const getRandomColor = () => {
      const colors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#5F6368", "#4285F4"];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Create scenes based on section index
    if (index === 0) {
      return (
        <div className="w-full h-64 md:h-96 relative overflow-hidden" style={{ backgroundColor: sectionsData[index].backgroundColor }}>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-800 rounded-t-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-24 bg-white rounded-md shadow-lg"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-24 bg-white rounded-md shadow-lg transform -rotate-6"></div>
          <Car className="absolute bottom-32 left-1/3" size={64} color="#333" />
          <Map className="absolute top-10 right-10" size={48} color={getRandomColor()} />
          <Landmark className="absolute top-1/4 left-1/4" size={36} color={getRandomColor()} />
        </div>
      );
    } else if (index === 1) {
      return (
        <div className="w-full h-64 md:h-96 relative overflow-hidden" style={{ backgroundColor: sectionsData[index].backgroundColor }}>
          <div className="absolute top-10 left-10 w-32 h-16 bg-white rounded-md shadow-lg"></div>
          <div className="absolute top-1/3 right-10 w-40 h-20 bg-white rounded-md shadow-lg"></div>
          <div className="absolute bottom-10 left-1/3 w-48 h-24 bg-white rounded-md shadow-lg"></div>
          <Clock className="absolute top-1/4 left-1/2" size={48} color={getRandomColor()} />
          <User className="absolute bottom-1/3 right-1/4" size={32} color={getRandomColor()} />
          <div className="absolute bottom-1/4 left-10 w-24 h-4 bg-gray-300 rounded-full"></div>
          <div className="absolute bottom-1/4 left-10 mt-6 w-16 h-4 bg-gray-300 rounded-full"></div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-64 md:h-96 relative overflow-hidden" style={{ backgroundColor: sectionsData[index].backgroundColor }}>
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white rounded-full shadow-lg"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-16 bg-white rounded-md shadow-lg"></div>
          <div className="absolute bottom-10 left-10 w-40 h-20 bg-white rounded-md shadow-lg"></div>
          <CreditCard className="absolute top-10 right-10" size={48} color={getRandomColor()} />
          <Car className="absolute bottom-1/3 right-1/3" size={40} color={getRandomColor()} />
          <div className="absolute bottom-1/4 right-10 w-32 h-4 bg-gray-300 rounded-full"></div>
          <div className="absolute bottom-1/4 right-10 mt-6 w-24 h-4 bg-gray-300 rounded-full"></div>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {sectionsData.map((section, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col w-full py-8 px-4 md:px-16 md:py-12 ${
            idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
          }`}
        >
          {/* Content Section */}
          <div className="w-full md:w-1/2 md:pr-8 mb-6 md:mb-0 flex flex-col justify-center">
            <div className="mb-4">
              {section.icon}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>
            <p className="text-lg text-gray-700 mb-6">{section.description}</p>
            
            <div className="flex flex-col">
              {section.buttonRoute ? (
                <Link to={section.buttonRoute}>
                  <button className="bg-black text-white py-3 px-6 mb-4 text-lg font-medium hover:bg-gray-800 transition">
                    {section.buttonText}
                  </button>
                </Link>
              ) : (
                <button className="bg-black text-white py-3 px-6 mb-4 text-lg font-medium hover:bg-gray-800 transition">
                  {section.buttonText}
                </button>
              )}
              
              {section.buttonSecondary && (
                section.buttonSecondaryRoute ? (
                  <Link to={section.buttonSecondaryRoute}>
                    <button className="bg-white text-black py-3 px-6 mb-4 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition">
                      {section.buttonSecondary}
                    </button>
                  </Link>
                ) : (
                  <button className="bg-white text-black py-3 px-6 mb-4 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition">
                    {section.buttonSecondary}
                  </button>
                )
              )}
              
              {section.signupText && (
                <p className="text-gray-800 mt-2">
                  <Link to={section.signupRoute} className="underline hover:text-blue-600">
                    {section.signupText}
                  </Link>
                </p>
              )}
            </div>
          </div>
          
          {/* Image Section */}
          <div className="w-full mr-4 md:w-1/2">
            {generateIllustration(idx)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GatiyanSections;
