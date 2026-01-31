const Address = require('../models/addressModel');

async function getAddresses(req, res) {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: { addresses },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to fetch addresses',
    });
  }
}

async function createAddress(req, res) {
  try {
    const { label, country, firstName, lastName, company, streetAddress, apartment, city, postalCode, phone, isDefault } = req.body;
    if (!country || !streetAddress || !city) {
      return res.status(400).json({
        status: 'fail',
        message: 'country, streetAddress and city are required',
      });
    }
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({
      userId: req.user._id,
      label: label || null,
      country,
      firstName: firstName || null,
      lastName: lastName || null,
      company: company || null,
      streetAddress,
      apartment: apartment || null,
      city,
      postalCode: postalCode || null,
      phone: phone || null,
      isDefault: !!isDefault,
    });
    res.status(201).json({
      status: 'success',
      message: 'Address saved',
      data: { address },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Failed to save address',
    });
  }
}

async function updateAddress(req, res) {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found',
      });
    }
    const { label, country, firstName, lastName, company, streetAddress, apartment, city, postalCode, phone, isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }
    if (label !== undefined) address.label = label;
    if (country !== undefined) address.country = country;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (company !== undefined) address.company = company;
    if (streetAddress !== undefined) address.streetAddress = streetAddress;
    if (apartment !== undefined) address.apartment = apartment;
    if (city !== undefined) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = !!isDefault;
    await address.save();
    res.status(200).json({
      status: 'success',
      data: { address },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Failed to update address',
    });
  }
}

async function deleteAddress(req, res) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found',
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Address deleted',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Failed to delete address',
    });
  }
}

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };
