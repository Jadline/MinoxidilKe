# Debugging 500 Error on Contact Form

## Current Issue
The contact form is returning a 500 Internal Server Error from `minoxidilke.onrender.com/api/v1/contact`.

## Changes Made

### 1. Enhanced Error Logging
- Added detailed logging at the start of `sendContactEmail`
- Logs request body keys for debugging
- Better error object serialization

### 2. Added Health Check Endpoint
- New endpoint: `GET /api/v1/contact/health`
- Check email service configuration without sending emails
- Returns status of environment variables

### 3. Global Error Handler
- Added middleware to catch any unhandled errors
- Prevents server crashes from uncaught exceptions

### 4. Better Error Responses
- More informative error messages
- Includes error codes when available
- Debug info in development mode

---

## How to Debug

### Step 1: Check Health Endpoint

Visit or test:
```
GET https://minoxidilke.onrender.com/api/v1/contact/health
```

**Expected Response:**
```json
{
  "status": "success",
  "emailService": {
    "configured": true,
    "hasEmailUser": true,
    "hasEmailPass": true,
    "hasAdminEmail": true,
    "emailUser": "wanjirucaren005@gmail.com",
    "adminEmail": "wanjirucaren005@gmail.com"
  }
}
```

**If `configured: false`:**
- Check which variables are missing
- Set them in Render dashboard

### Step 2: Check Render Logs

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for:
   - "✅ Email transporter is ready to send emails" (on startup)
   - "📧 Contact form submission received" (when form submitted)
   - "❌ Error sending contact email:" (if error occurs)

### Step 3: Verify Environment Variables in Render

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Verify these are set:
   ```
   EMAIL_USER=wanjirucaren005@gmail.com
   EMAIL_PASS=[16-character-app-password]
   ADMIN_EMAIL=wanjirucaren005@gmail.com
   ```

### Step 4: Test Locally First

1. Make sure `Backend/config.env` has correct values
2. Start backend: `npm start` or `npm run dev`
3. Check console for:
   - "✅ Email transporter is ready to send emails"
4. Test contact form locally
5. Check if it works before deploying

---

## Common Causes of 500 Error

### 1. Missing Environment Variables
**Symptom:** Health endpoint shows `configured: false`

**Fix:**
- Set `EMAIL_USER`, `EMAIL_PASS`, and `ADMIN_EMAIL` in Render dashboard
- Redeploy service

### 2. Invalid Gmail App Password
**Symptom:** Logs show "EAUTH" error code

**Fix:**
- Regenerate Gmail app password
- Update `EMAIL_PASS` in Render dashboard
- Ensure password has no spaces (16 characters)

### 3. Transporter Not Initialized
**Symptom:** Logs show "Email transporter not initialized"

**Fix:**
- Check if transporter.verify() failed on startup
- Verify environment variables are loaded correctly
- Check Render logs for initialization errors

### 4. Unhandled Exception
**Symptom:** Error occurs before reaching try-catch

**Fix:**
- Check Render logs for full error stack trace
- Look for syntax errors or missing dependencies
- Verify all required packages are installed

---

## Testing Steps

1. **Test Health Endpoint:**
   ```bash
   curl https://minoxidilke.onrender.com/api/v1/contact/health
   ```

2. **Test Contact Form:**
   - Fill out contact form on website
   - Submit form
   - Check browser console for error details
   - Check Render logs for server-side errors

3. **Check Email Configuration:**
   - Verify Gmail app password is correct
   - Ensure 2-Step Verification is enabled
   - Test email sending manually if possible

---

## Next Steps

1. ✅ **Check health endpoint** - Verify configuration
2. ✅ **Check Render logs** - Find actual error message
3. ✅ **Verify environment variables** - Ensure all are set
4. ✅ **Test locally** - Confirm it works in development
5. ✅ **Redeploy** - After fixing issues

---

## Quick Fix Checklist

- [ ] `EMAIL_USER` set in Render dashboard
- [ ] `EMAIL_PASS` set in Render dashboard (16 chars, no spaces)
- [ ] `ADMIN_EMAIL` set in Render dashboard
- [ ] Gmail app password is valid
- [ ] 2-Step Verification enabled on Gmail account
- [ ] Backend service redeployed after setting variables
- [ ] Health endpoint returns `configured: true`
- [ ] Render logs show transporter initialized successfully

---

## If Still Not Working

1. **Check Render Logs** for the exact error message
2. **Share the error** from logs (not just "500 error")
3. **Test health endpoint** and share the response
4. **Verify** environment variables are actually set (not just in config.env)

The health endpoint will help identify if it's a configuration issue or something else.
