const nodemailer = require('nodemailer');

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
}

// Create reusable transporter using Gmail SMTP with explicit settings
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.EMAIL_PASS?.trim(),
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    // Retry configuration
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
  });

  // Verify transporter configuration on startup (non-blocking, with timeout)
  // Use a timeout to prevent hanging on startup
  const verifyTimeout = setTimeout(() => {
    console.warn('⚠️  Email transporter verification is taking too long. Will verify on first email send.');
  }, 5000); // 5 second warning

  transporter.verify((error, success) => {
    clearTimeout(verifyTimeout);
    
    if (error) {
      console.error('❌ Email transporter verification failed:', error);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
      });
      
      // Provide specific guidance based on error type
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        console.error('⚠️  Connection timeout - This may be due to:');
        console.error('   1. Network restrictions on Render');
        console.error('   2. Gmail blocking connections from this IP');
        console.error('   3. Firewall settings');
        console.error('   Email will be attempted on first send, but may fail.');
        console.error('   Consider using OAuth2 or a different email service for production.');
      } else {
        console.error('⚠️  Email functionality may not work. Check EMAIL_USER and EMAIL_PASS environment variables.');
      }
    } else {
      console.log('✅ Email transporter is ready to send emails');
      console.log('Email config:', {
        user: process.env.EMAIL_USER,
        adminEmail: process.env.ADMIN_EMAIL,
        hasPassword: !!process.env.EMAIL_PASS,
      });
    }
  });
} catch (error) {
  console.error('❌ Failed to create email transporter:', error);
  transporter = null;
}

async function sendContactEmail(req, res) {
  try {
    // Log request for debugging
    console.log('📧 Contact form submission received');
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    const { firstName, lastName, email, phoneNumber, product, message } = req.body || {};

    // Check if transporter is available
    if (!transporter) {
      console.error('❌ Email transporter not initialized');
      console.error('Transporter status:', {
        isNull: transporter === null,
        isUndefined: transporter === undefined,
        type: typeof transporter,
      });
      return res.status(500).json({
        status: "fail",
        message: "Email service is not configured. Please contact support.",
        debug: process.env.NODE_ENV === 'development' ? "Transporter not initialized" : undefined,
      });
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials missing:', {
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER ? 'set' : 'missing',
        emailPass: process.env.EMAIL_PASS ? 'set' : 'missing',
      });
      return res.status(500).json({
        status: "fail",
        message: "Email service configuration error. Please contact support.",
        debug: process.env.NODE_ENV === 'development' ? "Environment variables missing" : undefined,
      });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !product || !message) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "wanjirucaren005@gmail.com";
    
    // Log email configuration (without sensitive data)
    console.log("Attempting to send email:");
    console.log("- From:", process.env.EMAIL_USER);
    console.log("- To:", adminEmail);
    console.log("- Subject: New Contact Form Submission from", firstName, lastName);

    const mailOptions = {
      from: `"MinoxidilKe Shop" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      text: `
        Name: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phoneNumber}
        Product: ${product}
        Message: ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phoneNumber}</p>
            <p><strong>Product:</strong> ${product}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Contact email sent successfully!");
    console.log("Email info:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    res.status(200).json({ 
      status: "success", 
      message: "Email sent successfully!",
      messageId: info.messageId,
    });

  } catch (error) {
    console.error("❌ Error sending contact email:");
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error command:", error.command);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error("Stack trace:", error.stack);
    
    // Log environment variable status (without exposing values)
    console.error("Environment check:", {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      emailUserLength: process.env.EMAIL_USER?.length || 0,
      emailPassLength: process.env.EMAIL_PASS?.length || 0,
      transporterExists: !!transporter,
    });

    // Provide more specific error messages
    let errorMessage = "Failed to send email. Please try again later.";
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please check email credentials.";
      console.error("⚠️  Authentication error - check EMAIL_USER and EMAIL_PASS in environment variables");
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Could not connect to email server. Please check your internet connection.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Email server connection timed out. Please try again later.";
    } else if (error.response) {
      errorMessage = `Email server error: ${error.response}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Always return a response - never let it hang
    if (!res.headersSent) {
      res.status(statusCode).json({
        status: "fail",
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        errorCode: error.code || undefined,
      });
    } else {
      console.error("⚠️  Response already sent, cannot send error response");
    }
  }
}

async function sendOrderConfirmationEmail(order) {
  try {
    // Format order items for email
    const orderItemsHtml = order.orderItems.map((item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Ksh ${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Ksh ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const orderItemsText = order.orderItems.map((item, index) => 
      `${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: Ksh ${item.price} - Total: Ksh ${item.price * item.quantity}`
    ).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .order-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .order-info-item { margin: 10px 0; }
          .order-info-label { font-weight: bold; color: #6b7280; }
          .order-info-value { color: #111827; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
          .total-row { background: #f9fafb; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>We've received your order and are processing it. Here are your order details:</p>
            
            <div class="order-info">
              <div class="order-info-item">
                <span class="order-info-label">Order Number:</span>
                <span class="order-info-value">${order.orderNumber}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Tracking Number:</span>
                <span class="order-info-value">${order.trackingNumber}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Order Date:</span>
                <span class="order-info-value">${new Date(order.date).toLocaleDateString('en-KE', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Payment Method:</span>
                <span class="order-info-value">${order.paymentType === 'mpesa' ? 'M-Pesa' : 'Pay on Delivery'}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Payment Status:</span>
                <span class="order-info-value">${order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus === 'succeeded' ? 'Paid' : 'Unpaid'}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Delivery Address:</span>
                <span class="order-info-value">
                  ${order.streetAddress || ''}
                  ${order.city ? `, ${order.city}` : ''}
                  ${order.postalCode ? ` ${order.postalCode}` : ''}
                </span>
              </div>
              ${order.deliveryInstructions ? `
              <div class="order-info-item">
                <span class="order-info-label">Delivery Instructions:</span>
                <span class="order-info-value">${order.deliveryInstructions}</span>
              </div>
              ` : ''}
            </div>

            <h2 style="margin-top: 30px;">Order Items</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>Subtotal:</strong></td>
                  <td style="padding: 12px; border-top: 2px solid #e5e7eb;"><strong>Ksh ${order.Total.toLocaleString()}</strong></td>
                </tr>
                <tr>
                  <td colspan="4" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 12px;"><strong>Ksh ${order.shippingCost.toLocaleString()}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 12px;"><strong>Ksh ${order.OrderTotal.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>

            ${order.paymentType === 'mpesa' && order.paymentStatus === 'pending' ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;"><strong>Payment Pending:</strong> Please complete your M-Pesa payment. We'll notify you once payment is confirmed.</p>
            </div>
            ` : ''}

            <p>We'll send you another email once your order ships. If you have any questions, please contact us.</p>
            
            <p>Best regards,<br>The MinoxidilKe Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} MinoxidilKe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Order Confirmation - ${order.orderNumber}

Thank you for your order!

Order Details:
- Order Number: ${order.orderNumber}
- Tracking Number: ${order.trackingNumber}
- Order Date: ${new Date(order.date).toLocaleDateString('en-KE')}
- Payment Method: ${order.paymentType === 'mpesa' ? 'M-Pesa' : 'Pay on Delivery'}
- Payment Status: ${order.paymentStatus}
- Delivery Address: ${order.streetAddress || ''}${order.city ? `, ${order.city}` : ''}${order.postalCode ? ` ${order.postalCode}` : ''}
${order.deliveryInstructions ? `- Delivery Instructions: ${order.deliveryInstructions}` : ''}

Order Items:
${orderItemsText}

Subtotal: Ksh ${order.Total.toLocaleString()}
Shipping: Ksh ${order.shippingCost.toLocaleString()}
Total: Ksh ${order.OrderTotal.toLocaleString()}

${order.paymentType === 'mpesa' && order.paymentStatus === 'pending' ? 
  'Payment Pending: Please complete your M-Pesa payment. We\'ll notify you once payment is confirmed.' : ''}

We'll send you another email once your order ships.

Best regards,
The MinoxidilKe Team
    `;

    const mailOptions = {
      from: `"MinoxidilKe Shop" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.email} for order ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw error - order should still be created even if email fails
    return false;
  }
}

module.exports = { sendContactEmail, sendOrderConfirmationEmail };
