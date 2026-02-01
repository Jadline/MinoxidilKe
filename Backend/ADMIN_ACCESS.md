# Admin dashboard access

Only users with role **admin** can access the admin dashboard.

## How to become admin

1. **Backend:** In `config.env`, set `FIRST_ADMIN_EMAIL` to the email you want as admin (e.g. your own).
2. **Sign up** with that email on the site (Account → Sign up). The first account created with that email gets `role: 'admin'`.
3. **Log in** with that email. You are redirected to **/admin** (the dashboard).

## If you already have an account with that email

If you signed up before setting `FIRST_ADMIN_EMAIL`, that user has `role: 'user'`. You can:

- **Option A:** In MongoDB (Compass or shell), update the user:
  ```js
  db.users.updateOne(
    { email: "your@email.com" },
    { $set: { role: "admin" } }
  )
  ```
- **Option B:** Delete that user and sign up again with the same email (now with `FIRST_ADMIN_EMAIL` set).

Then log in; you’ll be treated as admin.

## How to open the dashboard

- **After login:** As an admin you are redirected to **/admin**.
- **Later:** Click your profile/name in the nav → **Admin Dashboard** (only visible when you’re admin).
- **Direct:** Go to **/admin** in the browser. If you’re not logged in → redirect to login. If you’re logged in but not admin → redirect to home.

## Backend protection

- Admin-only API routes (products, packages, uploads) use `authMiddleware` and `requireRole(['admin'])`. Only requests with a valid JWT whose user has `role: 'admin'` are allowed.
