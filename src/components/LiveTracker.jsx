import React, { useState, useEffect, useRef } from 'react';

const LiveTracker = ({ sourceCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const apiKey = import.meta.env.VITE_GOMAPPRO_API_KEY; // Your Ola Maps API key

  // Load Ola Maps Web SDK if not already loaded.
  useEffect(() => {
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }
    if (window.OlaMaps) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.unpkg.com/olamaps-web-sdk@latest/dist/olamaps-web-sdk.umd.js';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const initializeMap = () => {
    if (mapRef.current && !map && window.OlaMaps) {
      // Determine initial center; Ola Maps may expect coordinates as [lng, lat].
      const initialCenter = sourceCoords && sourceCoords.lat
        ? [sourceCoords.lng, sourceCoords.lat]
        : [0, 0];

      // Initialize the map via OlaMaps Web SDK.
      const olaMapsInstance = new window.OlaMaps({ apiKey });
      // Assume the init method accepts an object with 'container', 'center' as [lng, lat], and 'zoom'
      const newMap = olaMapsInstance.init({
        container: mapRef.current,
        center: initialCenter,
        zoom: 14,
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json'
      });
      setMap(newMap);

      // Initialize DirectionsRenderer if available.
      if (window.OlaMaps.DirectionsRenderer) {
        const dr = new window.OlaMaps.DirectionsRenderer();
        dr.setMap(newMap);
        setDirectionsRenderer(dr);
      } else {
        console.error("OlaMaps.DirectionsRenderer not available");
      }
    }
  };

  useEffect(() => {
    if (!map || !directionsRenderer || !sourceCoords || !destinationCoords) return;

    if (window.OlaMaps && window.OlaMaps.DirectionsService) {
      const directionsService = new window.OlaMaps.DirectionsService();
      // Assume the DirectionsService expects origin and destination as arrays [lng, lat].
      const origin = [sourceCoords.lng, sourceCoords.lat];
      const destination = [destinationCoords.lng, destinationCoords.lat];
      const request = {
        origin,
        destination,
        travelMode: 'driving'
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          // Fit the map bounds using OlaMaps.LatLngBounds (assumed similar to Google Maps)
          if (result.routes && result.routes[0] && window.OlaMaps.LatLngBounds) {
            const bounds = new window.OlaMaps.LatLngBounds();
            result.routes[0].overview_path.forEach(latLng => bounds.extend(latLng));
            map.fitBounds(bounds);
          }
        } else {
          console.error("Directions request failed:", status);
        }
      });
    } else {
      console.error("OlaMaps.DirectionsService not available");
    }
  }, [sourceCoords, destinationCoords, map, directionsRenderer]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default LiveTracker;
