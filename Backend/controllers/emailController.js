// Contact form submissions are now saved to database for admin review.
// Email sending is disabled (was causing connection timeouts on Render).

const Contact = require('../models/contactModel');

async function sendContactEmail(req, res) {
  try {
    const { firstName, lastName, email, phoneNumber, product, message } = req.body || {};

    if (!firstName || !lastName || !email || !phoneNumber || !product || !message) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    // Save to database for admin to view
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      product,
      message,
    });

    console.log('📧 Contact form saved to database:', { id: contact._id, firstName, email });

    res.status(200).json({
      status: "success",
      message: "Thank you for your message. We'll get back to you soon.",
    });
  } catch (error) {
    console.error('Contact form error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: "fail", message: "Something went wrong. Please try again." });
    }
  }
}

async function sendOrderConfirmationEmail(order) {
  // Email disabled - no-op so order flow is unchanged
  console.log(`📧 Order confirmation email skipped (email disabled) for order ${order?.orderNumber}`);
  return;
}

module.exports = { sendContactEmail, sendOrderConfirmationEmail };
