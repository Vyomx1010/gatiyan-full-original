import React from 'react';
import 'remixicon/fonts/remixicon.css';
import sedan from "../assets/sedan.png";
import suv from "../assets/SUVcar.png";
import hatchback from "../assets/hackback.png";

const VehiclePanel = (props) => {
  // Vehicle types with their labels and updated static image URLs
  const vehicleTypes = [
    {
      type: '4-seater hatchback',
      label: 'Hatchback',
      image: hatchback,
      description: 'Affordable, compact rides',
      seatCount: 4
    },
    {
      type: '4-seater sedan',
      label: 'Sedan',
      image: sedan,
      description: 'Comfortable and stylish',
      seatCount: 4
    },
    {
      type: '7-seater SUV',
      label: 'SUV',
      image: suv,
      description: 'Spacious family ride',
      seatCount: 7
    },
  ];

  return (
    <div className="bg-white rounded-t-2xl shadow-lg p-4 pt-8 relative">
      

      <h3 className="text-2xl font-semibold mb-5 text-center">Choose a Vehicle</h3>

      {/* Vehicle options */}
      <div className="space-y-3">
        {vehicleTypes.map((vehicle, index) => {
          const backendFare = props.fare[vehicle.type] ?? 0;
          const discountPercentage = 20;
          const inflatedPrice = Math.round(
            backendFare * (100 + discountPercentage) / 100
          );

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
                  src={vehicle.image}
                  alt={vehicle.label}
                />
              </div>

              {/* Vehicle Info */}
              <div className="flex-grow ml-3 max-w-[50%]">
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
                    ₹{backendFare}
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