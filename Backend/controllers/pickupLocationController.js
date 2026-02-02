const PickupLocation = require('../models/pickupLocationModel');
const mongoose = require('mongoose');

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

/** Admin: list all pickup locations (including inactive). */
async function getAllPickupLocations(req, res) {
  try {
    const locations = await PickupLocation.find({}).sort({ sortOrder: 1, city: 1 });
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

/** Admin: create pickup location. */
async function createPickupLocation(req, res) {
  try {
    const { name, address, city, country, distanceKm, readinessText, costKes, sortOrder, isActive } = req.body;
    if (!name || !address || !city || !country) {
      return res.status(400).json({
        status: 'fail',
        message: 'name, address, city and country are required',
      });
    }
    const location = await PickupLocation.create({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      distanceKm: distanceKm != null ? Number(distanceKm) : undefined,
      readinessText: readinessText != null ? String(readinessText).trim() : 'Usually ready in 24 hours',
      costKes: costKes != null ? Number(costKes) : 0,
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      isActive: isActive !== false,
    });
    res.status(201).json({
      status: 'success',
      data: { pickupLocation: location },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to create pickup location',
    });
  }
}

/** Admin: update pickup location by _id. */
async function updatePickupLocation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid pickup location id.' });
    }
    const body = { ...req.body };
    const allowed = ['name', 'address', 'city', 'country', 'distanceKm', 'readinessText', 'costKes', 'sortOrder', 'isActive'];
    const update = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) {
        if (key === 'name' || key === 'address' || key === 'city' || key === 'country' || key === 'readinessText') update[key] = String(body[key]).trim();
        else if (key === 'distanceKm' || key === 'costKes' || key === 'sortOrder') update[key] = Number(body[key]);
        else if (key === 'isActive') update[key] = body[key] !== false;
      }
    });
    const location = await PickupLocation.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!location) {
      return res.status(404).json({ status: 'fail', message: 'Pickup location not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: { pickupLocation: location },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to update pickup location',
    });
  }
}

/** Admin: delete pickup location by _id. */
async function deletePickupLocation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid pickup location id.' });
    }
    const location = await PickupLocation.findByIdAndDelete(id);
    if (!location) {
      return res.status(404).json({ status: 'fail', message: 'Pickup location not found.' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Pickup location deleted.',
      data: { pickupLocation: location },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to delete pickup location',
    });
  }
}

module.exports = {
  getPickupLocations,
  getAllPickupLocations,
  createPickupLocation,
  updatePickupLocation,
  deletePickupLocation,
};
