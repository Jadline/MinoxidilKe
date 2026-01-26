# Email Workflow Documentation

## Current Email Configuration

- **Email Service:** Nodemailer with Gmail SMTP
- **From Email:** `wanjirucaren005@gmail.com` (EMAIL_USER)
- **Admin Email:** `wanjirucaren005@gmail.com` (ADMIN_EMAIL)
- **Reply-To:** User's email address (from contact form)

---

## Contact Form Email Workflow

### Step-by-Step Process

1. **User Fills Contact Form** (`frontend/src/Components/ContactInfo.jsx`)
   - User enters:
     - First Name
     - Last Name
     - Email (their email)
     - Phone Number
     - Product (dropdown selection)
     - Message

2. **Form Submission** (`ContactInfo.jsx`)
   - User clicks "Enquire-let's talk" button
   - `react-hook-form` validates all fields
   - `onhandleContactinfo` function is called
   - Form data is sent via `sendEmail` service

3. **API Request** (`frontend/src/Services/sendEmail.js`)
   - POST request to: `${BASE_URL}/api/v1/contact`
   - Sends form data as JSON:
     ```json
     {
       "firstName": "John",
       "lastName": "Doe",
       "email": "user@example.com",
       "phoneNumber": "+254712345678",
       "product": "Rogaine",
       "message": "I'm interested in this product..."
     }
     ```

4. **Backend Receives Request** (`Backend/routes/emailRoute.js`)
   - Route: `POST /api/v1/contact`
   - Calls `sendContactEmail` controller

5. **Email Controller** (`Backend/controllers/emailController.js`)
   - Validates all required fields
   - Checks email transporter is initialized
   - Validates environment variables (EMAIL_USER, EMAIL_PASS)
   - Creates email with:
     - **From:** `wanjirucaren005@gmail.com` (EMAIL_USER)
     - **To:** `wanjirucaren005@gmail.com` (ADMIN_EMAIL)
     - **Reply-To:** User's email (from form)
     - **Subject:** "New Contact Form Submission from [FirstName] [LastName]"
     - **Body:** HTML formatted email with all form data

6. **Email Sent via Nodemailer**
   - Uses Gmail SMTP
   - Sends email to admin inbox
   - Logs success/failure in server logs

7. **Response to Frontend**
   - Success: Returns 200 with success message
   - Error: Returns 400/500 with error message
   - Frontend shows toast notification

8. **Admin Receives Email**
   - Email arrives in `wanjirucaren005@gmail.com` inbox
   - Admin can click "Reply" to respond directly to user
   - Reply-To is set to user's email, so reply goes to user

---

## Visual Workflow Diagram

```
User Browser                    Frontend                    Backend                    Gmail SMTP
    │                              │                           │                           │
    │ 1. Fill Contact Form        │                           │                           │
    │─────────────────────────────>│                           │                           │
    │                              │                           │                           │
    │ 2. Submit Form               │                           │                           │
    │─────────────────────────────>│                           │                           │
    │                              │                           │                           │
    │                              │ 3. POST /api/v1/contact   │                           │
    │                              │──────────────────────────>│                           │
    │                              │                           │                           │
    │                              │                           │ 4. Validate & Send Email  │
    │                              │                           │──────────────────────────>│
    │                              │                           │                           │
    │                              │                           │ 5. Email Delivered        │
    │                              │                           │<──────────────────────────│
    │                              │                           │                           │
    │                              │ 6. Success Response        │                           │
    │                              │<───────────────────────────│                           │
    │                              │                           │                           │
    │ 7. Success Toast             │                           │                           │
    │<─────────────────────────────│                           │                           │
```

---

## Email Structure

### Email Received by Admin

**From:** MinoxidilKe Shop <wanjirucaren005@gmail.com>  
**To:** wanjirucaren005@gmail.com  
**Reply-To:** user@example.com (user's email from form)  
**Subject:** New Contact Form Submission from John Doe

**Body (HTML):**
- Name: John Doe
- Email: user@example.com (clickable mailto link)
- Phone: +254712345678
- Product: Rogaine
- Message: [User's message]

---

## Important Notes

### Reply-To Functionality
- When admin clicks "Reply" in email client, it will reply to the **user's email**, not the admin email
- This allows direct communication with the customer

### Email Addresses
- **EMAIL_USER:** The Gmail account used to send emails (must have app password)
- **ADMIN_EMAIL:** Where contact form submissions are received
- **User Email:** The email address entered by the user in the contact form

### Current Setup
- Both EMAIL_USER and ADMIN_EMAIL are set to `wanjirucaren005@gmail.com`
- This means emails are sent FROM and TO the same address
- The user's email is only used for Reply-To

---

## Setup Requirements

### 1. Gmail Account Setup
- Account: `wanjirucaren005@gmail.com`
- Must have 2-Step Verification enabled
- Must generate App Password for "Mail"

### 2. Environment Variables

**Local (`Backend/config.env`):**
```env
EMAIL_USER=wanjirucaren005@gmail.com
EMAIL_PASS=[16-character-app-password]
ADMIN_EMAIL=wanjirucaren005@gmail.com
```

**Production (Render Dashboard):**
- Set same variables in Render environment variables
- Update EMAIL_PASS with new app password for wanjirucaren005@gmail.com

### 3. Generate New App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Sign in with `wanjirucaren005@gmail.com`
3. Security → 2-Step Verification (enable if not enabled)
4. Scroll to "App passwords"
5. Select "Mail" and your device
6. Click "Generate"
7. Copy the 16-character password (no spaces)
8. Update `EMAIL_PASS` in:
   - `Backend/config.env` (local)
   - Render dashboard (production)

---

## Testing the Workflow

1. **Fill Contact Form:**
   - Go to contact page
   - Enter all required fields
   - Submit form

2. **Check Server Logs:**
   - Should see: "Attempting to send email:"
   - Should see: "✅ Contact email sent successfully!"

3. **Check Email Inbox:**
   - Login to `wanjirucaren005@gmail.com`
   - Check inbox for new email
   - Check spam folder if not in inbox

4. **Test Reply:**
   - Click "Reply" in email client
   - Verify it replies to user's email (not admin email)

---

## Troubleshooting

### Email Not Received
- Check server logs for errors
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check spam folder
- Verify Gmail app password is valid

### Reply-To Not Working
- Verify `replyTo: email` is set in mailOptions
- Test by clicking Reply in email client
- Should show user's email as recipient

### Authentication Errors
- Regenerate Gmail app password
- Ensure 2-Step Verification is enabled
- Verify password has no spaces (16 characters)

---

## Next Steps

1. ✅ Update `EMAIL_USER` and `ADMIN_EMAIL` to `wanjirucaren005@gmail.com`
2. ⚠️ **Ensure Gmail app password is set** for `wanjirucaren005@gmail.com`
3. ⚠️ **Update `EMAIL_PASS`** in config.env and Render dashboard if needed
4. ✅ Test contact form submission
5. ✅ Verify email received in `wanjirucaren005@gmail.com`
