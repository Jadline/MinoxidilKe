const ShippingMethod = require('../models/shippingMethodModel');

async function getShippingMethods(req, res) {
  try {
    const { country, city, region } = req.query;
    const countryVal = country && country.trim();
    if (!countryVal) {
      return res.status(400).json({
        status: 'fail',
        message: 'country query parameter is required',
      });
    }
    // Match country case-insensitively so "Uganda", "uganda", "UGANDA" all work
    const countryRe = new RegExp('^' + countryVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    const filter = { country: countryRe, inStock: true };
    const cityVal = (city && city.trim()) || (region && region.trim());
    if (cityVal) {
      const re = new RegExp(cityVal.replace(/\s+/g, '\\s*'), 'i');
      filter.$or = [{ city: re }, { region: re }];
    }
    const methods = await ShippingMethod.find(filter).sort({ sortOrder: 1, costKes: 1 });
    res.status(200).json({
      status: 'success',
      results: methods.length,
      data: { shippingMethods: methods },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to fetch shipping methods',
    });
  }
}

module.exports = { getShippingMethods };
