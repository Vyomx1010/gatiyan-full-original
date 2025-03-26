const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');

module.exports.getCoordinates = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[map.controller] Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  // Check if the address is in "lat,lng" format.
  const coordinateRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (coordinateRegex.test(address)) {
    // Perform reverse geocoding using a service method.
    try {
      // NOTE: Implement reverseGeocode in your maps service.
      const formattedAddress = await mapService.reverseGeocode(address);
      const [lat, lng] = address.split(',').map(num => parseFloat(num.trim()));
      return res.status(200).json({ formatted_address: formattedAddress, lat, lng });
    } catch (error) {
      console.error('[map.controller] Reverse geocoding error:', error.message);
      return res.status(404).json({ message: 'Reverse geocoding failed', error: error.message });
    }
  }

  // Otherwise use forward geocoding.
  try {
    const coordinates = await mapService.getAddressCoordinate(address);
    return res.status(200).json(coordinates);
  } catch (error) {
    console.error('[map.controller] Error fetching coordinates:', error.message);
    return res.status(404).json({ message: 'Coordinates not found', error: error.message });
  }
};


module.exports.getDistanceTime = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        const distanceTime = await mapService.getDistanceTime(origin, destination);

        res.status(200).json(distanceTime);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { input } = req.query;

        const suggestions = await mapService.getAutoCompleteSuggestions(input);

        res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}