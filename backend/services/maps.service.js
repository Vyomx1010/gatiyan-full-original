const axios = require('axios');
const https = require('https');
const captainModel = require('../models/captain.model');
require('dotenv').config();

// Set up Axios options with a 30-second timeout.
let axiosOptions = {
  timeout: 30000, // Increased timeout to 30 seconds
};

// If running in Node (i.e. no window), force IPv4 and set universal headers.
if (typeof window === 'undefined') {
  axiosOptions.httpsAgent = new https.Agent({ family: 4 });
  axiosOptions.headers = {
    // Universal User-Agent covering a wide range of devices and browsers.
    'User-Agent': [
      'Mozilla/5.0', // General UA
      '(Linux; Android 10; Mobile)', // Android devices
      '(iPhone; CPU iPhone OS 14_0 like Mac OS X)', // iOS devices
      '(Windows NT 10.0; Win64; x64)', // Windows devices
      '(Macintosh; Intel Mac OS X 10_15_7)', // macOS devices
      '(X11; Ubuntu; Linux x86_64)', // Linux devices
      '(compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)', // Older IE browsers
      '(Edg/112.0.0.0)', // Microsoft Edge
      '(Chrome/112.0.0.0 Safari/537.36)', // Chrome browsers
      '(SamsungBrowser/17.0)', // Samsung browser
      '(OPR/98.0.0.0)', // Opera browser
      '(Brave/1.63.0)', // Brave browser
      '(Vivaldi/3.7.2218.58)', // Vivaldi browser
      '(DuckDuckGo/5.0)', // DuckDuckGo browser
      '(Mozilla/5.0 AppleTV/7.0)', // Smart TV browsers
      '(PlayStation 4 7.0)', // Gaming consoles
      '(NokiaBrowser/8.0)', // Legacy mobile browsers
      '(TeslaBrowser/1.0)', // Embedded browsers (cars, appliances)
      '(future-device/1.0)' // Placeholder for future devices
    ].join(' '),
    // Universal Referer and Origin headers for web compatibility.
    'Referer': 'https://yourwebsite.com',
    'Origin': 'https://yourwebsite.com',
    // Cache-busting headers for fresh responses.
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

const axiosInstance = axios.create(axiosOptions);

module.exports.getAddressCoordinate = async (input) => {
  const apiKey = process.env.GOMAPPRO_API_KEY;
  if (!apiKey) {
    throw new Error('GOMAPPRO_API_KEY is not set in the environment');
  }

  const trimmedInput = input.trim();
  let url = '';

  // Check if the input is a lat,lng pair (reverse geocoding) or an address.
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(trimmedInput)) {
    // Reverse geocoding endpoint from Ola Maps.
    url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${encodeURIComponent(trimmedInput)}&api_key=${apiKey}`;
  } else {
    // Forward geocoding endpoint from Ola Maps.
    url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(trimmedInput)}&api_key=${apiKey}`;
  }

  console.log('[maps.service] Request URL:', url);

  try {
    const response = await axiosInstance.get(url);
    console.log('[maps.service] API response:', response.data);
    // Ola Maps returns status "ok" and a geocodingResults array.
    if (response.data.status === 'ok' && response.data.geocodingResults && response.data.geocodingResults.length > 0) {
      const result = response.data.geocodingResults[0];
      return {
        ltd: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    } else {
      throw new Error(response.data.error_message || 'Unable to fetch coordinates');
    }
  } catch (error) {
    console.error('[maps.service] Error:', error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  const apiKey = process.env.GOMAPPRO_API_KEY;
  // If origin is not a coordinate string, convert it.
  if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(origin)) {
    const originCoord = await module.exports.getAddressCoordinate(origin);
    origin = `${originCoord.ltd},${originCoord.lng}`;
  }
  // If destination is not a coordinate string, convert it.
  if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(destination)) {
    const destCoord = await module.exports.getAddressCoordinate(destination);
    destination = `${destCoord.ltd},${destCoord.lng}`;
  }

  // Use Ola Maps distance matrix basic endpoint.
  const url = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&api_key=${apiKey}`;

  try {
    const response = await axiosInstance.get(url);
    console.log('[maps.service] DistanceMatrix API response:', response.data);
    if (response.data && response.data.rows && response.data.rows.length > 0 &&
        response.data.rows[0].elements && response.data.rows[0].elements.length > 0) {
      if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
        throw new Error('No routes found');
      }
      return response.data.rows[0].elements[0];
    } else {
      throw new Error('Invalid response from distance matrix API');
    }
  } catch (err) {
    console.error('[maps.service] Error in getDistanceTime:', err.message);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error('Input is required');
  }

  const apiKey = process.env.GOMAPPRO_API_KEY;
  // Use Ola Maps autocomplete endpoint.
  const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${apiKey}`;

  try {
    const response = await axiosInstance.get(url);
    if (response.data && Array.isArray(response.data.predictions)) {
      return response.data.predictions.map(prediction => prediction.description);
    } else {
      console.error('[maps.service] Response data:', response.data);
      throw new Error('Unable to fetch suggestions');
    }
  } catch (err) {
    console.error('[maps.service] Error in getAutoCompleteSuggestions:', err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
  try {
    const captains = await captainModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      },
    });
    return captains;
  } catch (err) {
    console.error('[maps.service] Error in getCaptainsInTheRadius:', err.message);
    throw new Error('Unable to fetch captains in the radius');
  }
};
