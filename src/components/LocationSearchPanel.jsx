import React from 'react';

const LocationSearchPanel = ({ suggestions, onSelect }) => {
  // Ensure suggestions is always an array
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <>
      <div className="absolute left-0 right-0 text-black bg-white border border-gray-100 rounded shadow mt-1 max-h-60 overflow-y-auto z-50 animate-fade-in">
        {safeSuggestions.length > 0 ? (
          safeSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 transition-colors duration-200 hover:bg-gray-600 cursor-pointer"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))
        ) : (
          <div className="p-2 text-gray-300">No suggestions available</div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default LocationSearchPanel;
