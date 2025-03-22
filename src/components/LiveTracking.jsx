import React, { useState, useEffect, useRef } from "react";
import { OlaMaps } from "olamaps-web-sdk";

const LiveTracking = ({ sourceCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const apiKey = import.meta.env.VITE_GOMAPPRO_API_KEY;

  // 1) Initialize the map only once
  useEffect(() => {
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }
    // Ensure valid sourceCoords or use a default center
    const hasValidSource =
      sourceCoords && typeof sourceCoords.lng === "number" && typeof sourceCoords.ltd === "number";
    const initialCenter = hasValidSource ? [sourceCoords.lng, sourceCoords.ltd] : [0, 0];

    if (mapRef.current && !map) {
      const olaMapsInstance = new OlaMaps({ apiKey });
      // Use a style URL that avoids 3D layers – adjust as needed per documentation.
      const newMap = olaMapsInstance.init({
        container: mapRef.current,
        center: initialCenter,
        zoom: 14,
        style:
          "https://api.olamaps.io/tiles/vector/v1/styles/olamaps-basic/style.json",
      });
      setMap(newMap);
    }
  }, [apiKey, map, sourceCoords]);

  // 2) Update the route when coordinates are available and map is initialized.
  useEffect(() => {
    // Ensure that all necessary data exists
    if (
      !map ||
      !sourceCoords ||
      !destinationCoords ||
      typeof sourceCoords.lng !== "number" ||
      typeof sourceCoords.ltd !== "number" ||
      typeof destinationCoords.lng !== "number" ||
      typeof destinationCoords.ltd !== "number"
    ) {
      return;
    }

    if (OlaMaps.DirectionsService) {
      const directionsService = new OlaMaps.DirectionsService();
      const origin = [sourceCoords.lng, sourceCoords.ltd];
      const destination = [destinationCoords.lng, destinationCoords.ltd];

      const request = {
        origin,
        destination,
        travelMode: "driving",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          if (result.routes && result.routes[0] && result.routes[0].overview_path) {
            if (OlaMaps.Polyline) {
              // Remove existing polyline if it exists
              if (routePolyline) {
                routePolyline.setMap(null);
              }
              const poly = new OlaMaps.Polyline({
                path: result.routes[0].overview_path,
                strokeColor: "#FF0000",
                strokeWeight: 4,
              });
              poly.setMap(map);
              setRoutePolyline(poly);

              // Adjust map bounds to fit the route.
              if (OlaMaps.LatLngBounds) {
                const bounds = new OlaMaps.LatLngBounds();
                result.routes[0].overview_path.forEach((latLng) => bounds.extend(latLng));
                map.fitBounds(bounds);
              }
            } else {
              console.error("OlaMaps.Polyline is not available");
            }
          } else {
            console.error("No valid route found");
          }
        } else {
          console.error("Directions request failed:", status);
        }
      });
    } else {
      console.error("OlaMaps.DirectionsService is not available");
    }
  }, [map, sourceCoords, destinationCoords, routePolyline]);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} className="z-10" />
      {/* CSS override to hide OlaMaps branding (if allowed by your plan) */}
      <style>
        {`
          .olamaps-logo,
          .olamaps-attribution {
            display: none !important;
          }
        `}
      </style>
    </>
  );
};

export default LiveTracking;
