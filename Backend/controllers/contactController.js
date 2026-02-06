const Contact = require('../models/contactModel');

// Submit a new contact form (public)
async function submitContact(req, res) {
  try {
    const { firstName, lastName, email, phoneNumber, product, message } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !product || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required',
      });
    }

    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      product,
      message,
    });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been received. We will get back to you soon!',
      data: { contactId: contact._id },
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to submit contact form. Please try again.',
    });
  }
}

// Get all contact submissions (admin only)
async function getAllContacts(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to fetch contacts',
    });
  }
}

// Update contact status (admin only)
async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status',
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact },
    });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to update contact',
    });
  }
}

// Delete contact (admin only)
async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted',
    });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to delete contact',
    });
  }
}

// Get unread count (for admin badge)
async function getUnreadCount(req, res) {
  try {
    const count = await Contact.countDocuments({ status: 'new' });
    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Failed to get count',
    });
  }
}

module.exports = {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
  getUnreadCount,
};
