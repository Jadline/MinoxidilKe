# Email Troubleshooting Guide

## Issue: Contact Form Emails Not Being Received

### Changes Made:

1. **Fixed EMAIL_PASS Format**
   - **Before:** `EMAIL_PASS=shje rkzi fsnk oqii` (had spaces)
   - **After:** `EMAIL_PASS=[16-character-app-password]` (removed spaces)
   - Gmail app passwords are 16 characters without spaces

2. **Updated ADMIN_EMAIL**
   - **Before:** `ADMIN_EMAIL = njerijadline@gmail.com`
   - **After:** `ADMIN_EMAIL=wanjirucaren005@gmail.com`
   - Now emails will go to the correct address

3. **Improved Error Logging**
   - Added detailed error logging
   - Logs email configuration (without passwords)
   - Logs success/failure details
   - Better error messages for debugging

4. **Added Input Validation**
   - Validates all required fields before sending
   - Returns clear error messages

---

## How to Test

1. **Submit the contact form** on your website
2. **Check server logs** for:
   - "✅ Email transporter is ready to send emails" (on startup)
   - "Attempting to send email:" (when form submitted)
   - "✅ Contact email sent successfully!" (if successful)
   - Error messages (if failed)

3. **Check your email inbox** (`wanjirucaren005@gmail.com`)
4. **Check spam folder** - emails might go there initially

---

## Common Issues & Solutions

### Issue 1: "EAUTH" Error (Authentication Failed)

**Symptoms:**
- Error code: `EAUTH`
- "Email authentication failed"

**Solutions:**
1. **Verify App Password:**
   - Go to Google Account → Security
   - Check "2-Step Verification" is enabled
   - Generate a new App Password for "Mail"
   - Update `EMAIL_PASS` in `config.env` (no spaces!)

2. **Check Email Format:**
   - Ensure `EMAIL_USER` is correct: `wanjirucaren005@gmail.com`
   - No extra spaces or quotes

### Issue 2: Emails Going to Spam

**Solutions:**
1. Check spam/junk folder
2. Mark as "Not Spam" if found
3. Add sender to contacts
4. For production, consider:
   - Using a custom domain email
   - Setting up SPF/DKIM records
   - Using a professional email service

### Issue 3: "ECONNECTION" Error

**Symptoms:**
- Cannot connect to Gmail SMTP

**Solutions:**
1. Check internet connection
2. Check firewall settings
3. Verify Gmail SMTP is accessible
4. Try using explicit SMTP settings instead of 'gmail' service

### Issue 4: No Error but No Email Received

**Possible Causes:**
1. Email sent but in spam folder
2. Wrong email address
3. Email server delay
4. Gmail rate limiting

**Check:**
- Server logs for success message
- Spam folder
- Email address is correct
- Wait a few minutes (Gmail can have delays)

---

## Alternative: Use Explicit SMTP Settings

If Gmail service doesn't work, try explicit SMTP:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});
```

---

## Testing the Email Function

You can test the email function directly:

1. **Start your backend server**
2. **Check console** for transporter verification message
3. **Submit contact form** from frontend
4. **Watch server logs** for detailed information

---

## Next Steps

1. ✅ Restart your backend server (to load new config)
2. ✅ Test contact form submission
3. ✅ Check server logs for errors
4. ✅ Check email inbox and spam folder
5. ✅ If still not working, check Gmail app password

---

## Gmail App Password Setup (If Needed)

1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not enabled)
3. Scroll down to **App passwords**
4. Select **Mail** and your device
5. Click **Generate**
6. Copy the 16-character password (no spaces)
7. Update `EMAIL_PASS` in `config.env`

---

## Debugging Commands

Check if environment variables are loaded:
```javascript
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
```
