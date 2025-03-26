import React from 'react';
import 'remixicon/fonts/remixicon.css';

const VehiclePanel = (props) => {
  // Vehicle types with company names and images.
  // For vehicles without a dedicated image, a dummy placeholder image is used.
  const vehicleTypes = [
    { type: 'Swift', label: 'Swift', description: 'Compact and affordable rides', seatCount: 4, image: 'https://via.placeholder.com/150?text=Swift' },
    { type: 'Wagon R', label: 'Wagon R', description: 'Economical and comfortable', seatCount: 4, image: 'https://via.placeholder.com/150?text=Wagon+R' },
    { type: 'Hyundai i20', label: 'Hyundai i20', description: 'Stylish and smooth rides', seatCount: 4, image: 'https://via.placeholder.com/150?text=Hyundai+i20' },
    { type: 'Tiago', label: 'Tiago', description: 'Reliable and efficient', seatCount: 4, image: 'https://via.placeholder.com/150?text=Tiago' },
    { type: 'Swift Dzire', label: 'Swift Dzire', description: 'Spacious and stylish', seatCount: 4, image: 'https://via.placeholder.com/150?text=Swift+Dzire' },
    { type: 'XLG', label: 'XLG', description: 'Spacious family ride', seatCount: 7, image: 'https://via.placeholder.com/150?text=XLG' },
    { type: 'Ertiga', label: 'Ertiga', description: 'Spacious and comfortable', seatCount: 7, image: 'https://via.placeholder.com/150?text=Ertiga' },
    { type: 'Toyota Innova', label: 'Toyota Innova', description: 'Luxury and spaciousness', seatCount: 7, image: 'https://via.placeholder.com/150?text=Toyota+Innova' }
  ];

  return (
    <div className="bg-white rounded-t-2xl shadow-lg p-4 pt-8 relative">
      <h3 className="text-2xl font-semibold mb-5 text-center">Choose a Vehicle</h3>

      {/* Vehicle options */}
      <div className="space-y-3">
        {vehicleTypes.map((vehicle, index) => {
          const backendFare = props.fare[vehicle.type] ?? 0;   // Ensure proper fare handling
          const discountPercentage = 20;
          const inflatedPrice = Math.round(backendFare * (100 + discountPercentage) / 100);

          return (
            <div
              key={index}
              onClick={() => {
                props.setConfirmRidePanel(true);
                props.selectVehicle(vehicle.type);
              }}
              className="flex border-2 rounded-xl p-3 items-center justify-between cursor-pointer transition-all hover:bg-gray-50 active:border-black"
            >
              {/* Vehicle Image */}
              <div className="flex-shrink-0">
                <img
                  className="h-16 w-24 object-contain rounded"
                  src={vehicle.image || 'https://via.placeholder.com/150'}
                  alt={vehicle.label}
                />
              </div>

              {/* Vehicle Info */}
              <div className="flex-grow ml-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-base">{vehicle.label}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-user-3-fill text-lg"></i>
                    <span className="ml-1">{vehicle.seatCount}</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">2 mins away</div>
                <p className="text-xs text-gray-500 mt-1">{vehicle.description}</p>
              </div>

              {/* Fare & Offer Display */}
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="line-through text-gray-400 text-sm">
                    ₹{inflatedPrice}
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    ₹{backendFare > 0 ? backendFare : '0'}
                  </span>
                </div>
                {backendFare > 0 && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehiclePanel;
