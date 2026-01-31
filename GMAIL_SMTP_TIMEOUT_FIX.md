# Gmail SMTP Connection Timeout Fix

## Issue

Render is experiencing connection timeouts when trying to connect to Gmail SMTP servers. This is a common issue on cloud platforms due to:
- Network restrictions
- Gmail blocking connections from certain IP ranges
- Firewall settings
- Connection timeout limits

## Changes Made

### 1. Explicit SMTP Configuration
Changed from using `service: 'gmail'` to explicit SMTP settings:
- `host: 'smtp.gmail.com'`
- `port: 587`
- `secure: false`
- Added connection timeouts (10 seconds)
- Added retry/pooling configuration

### 2. Non-Blocking Verification
- Added timeout warning for verification
- Verification won't block server startup
- Email will be attempted on first send even if verification fails

## Current Configuration

```javascript
transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
});
```

## Testing

After deployment, the email will be attempted when:
1. Contact form is submitted
2. Order is created

Even if verification fails on startup, the actual email send will be attempted.

## Alternative Solutions

If connection timeouts persist, consider:

### Option 1: Use Gmail OAuth2 (Recommended for Production)
- More secure
- Better for production environments
- Requires OAuth2 setup

### Option 2: Use a Different Email Service
- **SendGrid** - Reliable, good free tier
- **Mailgun** - Developer-friendly
- **Amazon SES** - Cost-effective
- **Resend** - Modern, simple API

### Option 3: Use a Proxy/Relay
- Set up an SMTP relay service
- Route emails through a trusted IP

## Monitoring

Check Render logs for:
- "✅ Email transporter is ready to send emails" (success)
- "❌ Email transporter verification failed" (verification failed, but will try on send)
- "✅ Contact email sent successfully!" (actual send succeeded)

## Next Steps

1. ✅ Deploy the updated configuration
2. ⚠️ Test contact form submission
3. ⚠️ Check Render logs for email send attempts
4. ⚠️ If still timing out, consider alternative email service

---

## Why This Happens

Gmail SMTP servers may:
- Block connections from cloud platform IP ranges
- Have strict rate limiting
- Require "Less secure app access" (deprecated)
- Block connections that don't match expected patterns

The explicit SMTP configuration with timeouts should help, but if the issue persists, switching to OAuth2 or a dedicated email service is recommended for production.
