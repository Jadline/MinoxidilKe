# Auth & Admin Setup

## Overview

- **Auth:** JWT-based, 7-day expiry. Login/Signup return `token` and `user` (including `role`).
- **Roles:** `user` (default) and `admin`. Admin can access `/admin` and create/update/delete products.
- **First admin:** Set `FIRST_ADMIN_EMAIL` in env; that email becomes admin on first signup (or on next login if you promote manually).

## Environment (Backend)

```env
JWT_SECRET=your-secret-at-least-32-chars
FIRST_ADMIN_EMAIL=admin@example.com   # optional: this email gets role=admin on signup
```

- **JWT_SECRET:** Required. Use a long, random string in production.
- **FIRST_ADMIN_EMAIL:** Optional. The first account created with this email (or the one you set in DB) gets `role: 'admin'`.

## Existing Users (No `role` Yet)

If you already had users before adding roles, add a default role so auth and admin checks work:

```js
db.users.updateMany(
  { role: { $exists: false } },
  { $set: { role: "user" } }
)
```

Then promote your first admin (see below).

## Making an Existing User an Admin

If the app is already deployed and you need to promote a user:

1. **MongoDB:**  
   Open the `users` collection and set `role: 'admin'` for that user’s document.

2. **Example (MongoDB shell or Compass):**
   ```js
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

3. Have that user **log out and log in again** so the new role is in the JWT and in the frontend store.

## Frontend

- **Token:** Stored in `localStorage` under `userToken`. The api client sends `Authorization: Bearer <token>`.
- **User store:** `currentUser` includes `id`, `email`, `name`, `role`, `isAdmin`. It’s filled from the JWT on load and from login/signup responses.
- **Protected routes:**  
  - **Authenticated:** e.g. `/checkout` uses `ProtectedRoute` (redirect to `/login` if no user).  
  - **Admin only:** `/admin`, `/admin/add-product` use `AdminRoute` (redirect to `/login` or `/` if not admin).

## Admin Dashboard (Same Site)

- **URLs:** `/admin` (dashboard), `/admin/add-product` (create product).
- **Access:** Only users with `role === 'admin'`. Others are redirected to `/` or `/login`.
- **Nav:** When `currentUser.isAdmin` is true, the account dropdown shows “Admin Dashboard” and links to `/admin`.

## API (Backend)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /api/v1/account/registerUser | - | - | Sign up |
| POST | /api/v1/account/loginUser | - | - | Log in |
| GET | /api/v1/account/me | JWT | - | Current user |
| GET | /api/v1/products | - | - | List products (public) |
| POST | /api/v1/products | JWT | admin | Create product |
| PATCH | /api/v1/products/:id | JWT | admin | Update product |
| DELETE | /api/v1/products/:id | JWT | admin | Delete product |

`:id` is the numeric product `id` from your product model.

## Industry-Oriented Practices in This Setup

- **Passwords:** bcrypt with cost 12, min length 8, no raw password in responses.
- **JWT:** Short-lived (7d), signed with JWT_SECRET. Payload includes `id`, `email`, `role`.
- **Auth middleware:** Distinguishes “no token”, “expired”, “invalid” and returns consistent `status`/`message`.
- **Role checks:** `requireRole(['admin'])` used on admin-only routes; 403 when role is missing.
- **User model:** `password` excluded by default and only selected for login verification.
- **Login:** Same message for “user not found” and “wrong password” to avoid email enumeration.
- **API client:** Central axios instance, Bearer token attached per request, 401 triggers logout and redirect to login.

## Optional Next Steps

- **Refresh tokens:** Implement refresh tokens and short-lived access tokens if you need stronger security.
- **Rate limiting:** Add rate limiting on `/login` and `/registerUser` to reduce brute force and abuse.
- **Validation:** Use `express-validator` (or similar) on signup/login request body for stricter validation and sanitization.
