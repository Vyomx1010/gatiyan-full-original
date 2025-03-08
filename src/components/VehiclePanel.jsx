import React from 'react';
import 'remixicon/fonts/remixicon.css';
import sedan from "../assets/sedan.png";
import suv from "../assets/SUVcar.png";
import hatchback from "../assets/hackback.png";

const VehiclePanel = (props) => {
  // Vehicle types with their labels and updated static image URLs (MUV removed)
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
    <div>
      {/* “Close” icon or arrow */}
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setVehiclePanel(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">Choose a Vehicle</h3>

      {/* Mapping through vehicle types to generate UI */}
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
            className="flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between cursor-pointer transition-colors hover:bg-gray-50"
          >
            {/* Vehicle Image */}
            <img
              className="h-14 w-24 object-cover rounded"
              src={vehicle.image}
              alt={vehicle.label}
            />

            {/* Vehicle Info */}
            <div className="ml-2 w-1/2">
              <h4 className="font-medium text-base flex items-center gap-2">
                {vehicle.label}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <i className="ri-user-3-fill text-lg"></i>
                  {vehicle.seatCount}
                </span>
              </h4>
              <h5 className="font-medium text-sm text-gray-700">2 mins away</h5>
              <p className="text-xs text-gray-500">{vehicle.description}</p>
            </div>

            {/* Fare & Offer Display */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="line-through text-gray-400 text-sm">
                  ₹{inflatedPrice}
                </span>
                <span className="text-lg font-semibold text-gray-800">
                  ₹{backendFare}
                </span>
              </div>
              {backendFare > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  {discountPercentage}% OFF
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VehiclePanel;
