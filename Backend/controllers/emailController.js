const { MailerSend, EmailParams, Recipient, Sender } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

async function sendContactEmail(req, res) {
  const { firstName, lastName, email, phoneNumber, product, message } = req.body;

  try {
    const sentFrom = new Sender("info@test-zxk54v81pk1ljy6v.mlsender.net", 'minoxidilKe Shop');

    const adminEmail = process.env.ADMIN_EMAIL || "njerijadline@gmail.com";
    const recipients = [new Recipient(adminEmail, "MinoxidilKe Admin")];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(new Sender(email, `${firstName} ${lastName}`))
      .setSubject(`New Contact Form Submission from ${firstName} ${lastName}`)
      .setText(`
        Name: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phoneNumber}
        Product: ${product}
        Message: ${message}
      `);

    await mailerSend.email.send(emailParams);

    console.log("Email sent successfully!");
    res.status(200).json({ status: "success", message: "Email sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      status: "fail",
      message: error.message || "Failed to send email. Please try again later.",
    });
  }
}
module.exports = sendContactEmail
