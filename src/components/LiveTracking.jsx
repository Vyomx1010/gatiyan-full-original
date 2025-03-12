import React, { useState, useEffect, useRef } from 'react';

const LiveTracking = ({ sourceCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const apiKey = import.meta.env.VITE_GOMAPPRO_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://api.olamaps.io/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const initializeMap = () => {
    if (mapRef.current && !map) {
      const initialCenter = sourceCoords?.lat
        ? { lat: sourceCoords.lat, lng: sourceCoords.lng }
        : { lat: -33.8688, lng: 151.2195 };

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        gestureHandling: "greedy",
      });

      setMap(newMap);

      const newMarker = new window.google.maps.Marker({
        position: initialCenter,
        map: newMap,
        title: "You are here!",
      });

      setMarker(newMarker);
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
    }
  };

  useEffect(() => {
    if (map && marker) {
      map.setCenter(currentPosition);
      marker.setPosition(currentPosition);
    }
  }, [map, marker]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMarker((prevMarker) => {
          if (prevMarker) {
            prevMarker.setPosition({ lat: latitude, lng: longitude });
          }
          return prevMarker;
        });
      });
    }
  }, []);

  useEffect(() => {
    if (map && sourceCoords && destinationCoords && directionsRenderer) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsRenderer.setMap(map);

      const request = {
        origin: new window.google.maps.LatLng(sourceCoords.lat, sourceCoords.lng),
        destination: new window.google.maps.LatLng(destinationCoords.lat, destinationCoords.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      });
    }
  }, [map, sourceCoords, destinationCoords, directionsRenderer]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} className="z-10"></div>;
};

export default LiveTracking;
