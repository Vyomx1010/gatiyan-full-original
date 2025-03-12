import React, { useState, useEffect, useRef } from "react";
import { OlaMaps } from "olamaps-web-sdk";

const LiveTracker = ({ sourceCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const apiKey = import.meta.env.VITE_GOMAPPRO_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }
    if (mapRef.current && !map) {
      const olaMapsInstance = new OlaMaps({ apiKey });
      const initialCenter = sourceCoords && sourceCoords.lat
        ? [sourceCoords.lng, sourceCoords.lat]
        : [0, 0];
      const newMap = olaMapsInstance.init({
        container: mapRef.current,
        center: initialCenter,
        zoom: 14,
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      });
      setMap(newMap);

      if (OlaMaps.DirectionsRenderer) {
        const dr = new OlaMaps.DirectionsRenderer();
        dr.setMap(newMap);
        setDirectionsRenderer(dr);
      } else {
        console.error("OlaMaps.DirectionsRenderer not available");
      }
    }
  }, [apiKey, map, sourceCoords]);

  useEffect(() => {
    if (!map || !directionsRenderer || !sourceCoords || !destinationCoords) return;

    if (OlaMaps.DirectionsService) {
      const directionsService = new OlaMaps.DirectionsService();
      const origin = [sourceCoords.lng, sourceCoords.lat];
      const destination = [destinationCoords.lng, destinationCoords.lat];
      const request = {
        origin,
        destination,
        travelMode: "driving",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          if (result.routes && result.routes[0] && OlaMaps.LatLngBounds) {
            const bounds = new OlaMaps.LatLngBounds();
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
  }, [map, directionsRenderer, sourceCoords, destinationCoords]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default LiveTracker;
