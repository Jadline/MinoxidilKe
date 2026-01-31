const PickupLocation = require('../models/pickupLocationModel');

async function getPickupLocations(req, res) {
  try {
    const { country, city } = req.query;
    const filter = { isActive: true };
    if (country && country.trim()) filter.country = new RegExp(country.trim(), 'i');
    if (city && city.trim()) filter.city = new RegExp(city.trim(), 'i');
    const locations = await PickupLocation.find(filter).sort({ sortOrder: 1, distanceKm: 1 });
    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: { pickupLocations: locations },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to fetch pickup locations',
    });
  }
}

module.exports = { getPickupLocations };
