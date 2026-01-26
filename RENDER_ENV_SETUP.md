# Render Environment Variables Setup

## Issue: 500 Error on Contact Form

The contact form is returning a 500 error because **environment variables are not set in Render**.

### Problem

Your backend code loads environment variables from `config.env` locally, but on Render (production), you need to set environment variables in the Render dashboard.

### Solution: Set Environment Variables in Render

1. **Go to your Render Dashboard**
   - Navigate to your backend service
   - Click on **"Environment"** tab

2. **Add these environment variables:**

   ```
   EMAIL_USER=[your-email@gmail.com]
   EMAIL_PASS=[your-gmail-app-password]
   ADMIN_EMAIL=[admin-email@gmail.com]
   ```
   
   **⚠️ IMPORTANT:** Replace placeholders with your actual values. Never commit actual passwords to Git.

3. **Also ensure these are set (if not already):**
   ```
   PORT=3000
   DATABASE=[your-mongodb-connection-string]
   JWT_SECRET=[your-jwt-secret]
   ```
   
   **⚠️ IMPORTANT:** Never put actual credentials in documentation files. Use placeholders like `[your-mongodb-connection-string]` instead.

4. **After adding variables:**
   - Click **"Save Changes"**
   - Render will automatically redeploy your service
   - Wait for deployment to complete

### Verify Setup

After deployment, check your Render logs. You should see:

```
✅ Email transporter is ready to send emails
Email config: {
  user: 'wanjirucaren005@gmail.com',
  adminEmail: 'wanjirucaren005@gmail.com',
  hasPassword: true
}
```

If you see:
```
❌ Email transporter verification failed
```

Then check:
- `EMAIL_USER` is correct
- `EMAIL_PASS` is the 16-character Gmail app password (no spaces)
- 2-Step Verification is enabled on the Gmail account

### Gmail App Password

If you need to regenerate the app password:

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (must be enabled)
3. Scroll to "App passwords"
4. Generate new password for "Mail"
5. Copy the 16-character password (no spaces)
6. Update `EMAIL_PASS` in Render dashboard

### Testing

After setting environment variables:

1. **Submit contact form** on your website
2. **Check Render logs** for:
   - "Attempting to send email:"
   - "✅ Contact email sent successfully!"
3. **Check email inbox** at `wanjirucaren005@gmail.com`
4. **Check spam folder** if not in inbox

---

## Important Notes

- **Never commit `config.env` to Git** - it contains sensitive data
- **Render uses environment variables** from the dashboard, not from files
- **Local development** uses `config.env` file
- **Production (Render)** uses environment variables from dashboard

---

## Current Error

The 500 error is happening because:
1. `EMAIL_USER` or `EMAIL_PASS` is not set in Render
2. Transporter fails to initialize
3. Email sending fails with authentication error

**Fix:** Set the environment variables in Render dashboard and redeploy.
