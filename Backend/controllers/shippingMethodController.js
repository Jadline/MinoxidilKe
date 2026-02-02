const ShippingMethod = require('../models/shippingMethodModel');
const mongoose = require('mongoose');

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

/** Admin: list all shipping methods. */
async function getAllShippingMethods(req, res) {
  try {
    const methods = await ShippingMethod.find({}).sort({ sortOrder: 1, country: 1, costKes: 1 });
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

/** Admin: create shipping method. */
async function createShippingMethod(req, res) {
  try {
    const { country, region, city, name, description, costKes, sortOrder, inStock } = req.body;
    if (!country || !name) {
      return res.status(400).json({
        status: 'fail',
        message: 'country and name are required',
      });
    }
    if (costKes == null || Number(costKes) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'costKes (≥ 0) is required',
      });
    }
    const method = await ShippingMethod.create({
      country: country.trim(),
      region: region != null ? String(region).trim() : '',
      city: city != null ? String(city).trim() : '',
      name: name.trim(),
      description: description != null ? String(description).trim() : '',
      costKes: Number(costKes),
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      inStock: inStock !== false,
    });
    res.status(201).json({
      status: 'success',
      data: { shippingMethod: method },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to create shipping method',
    });
  }
}

/** Admin: update shipping method by _id. */
async function updateShippingMethod(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid shipping method id.' });
    }
    const body = { ...req.body };
    const allowed = ['country', 'region', 'city', 'name', 'description', 'costKes', 'sortOrder', 'inStock'];
    const update = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) {
        if (['country', 'region', 'city', 'name', 'description'].includes(key)) update[key] = String(body[key]).trim();
        else if (key === 'costKes' || key === 'sortOrder') update[key] = Number(body[key]);
        else if (key === 'inStock') update[key] = body[key] !== false;
      }
    });
    const method = await ShippingMethod.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!method) {
      return res.status(404).json({ status: 'fail', message: 'Shipping method not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: { shippingMethod: method },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to update shipping method',
    });
  }
}

/** Admin: delete shipping method by _id. */
async function deleteShippingMethod(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid shipping method id.' });
    }
    const method = await ShippingMethod.findByIdAndDelete(id);
    if (!method) {
      return res.status(404).json({ status: 'fail', message: 'Shipping method not found.' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Shipping method deleted.',
      data: { shippingMethod: method },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to delete shipping method',
    });
  }
}

module.exports = {
  getShippingMethods,
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
};
