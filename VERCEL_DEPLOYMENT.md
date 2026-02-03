# Deploying the frontend to Vercel

So that **packages**, **products**, **login (with eye icon)**, and all UI work on your live site, do the following.

## 1. Root directory

Your repo has both `Backend/` and `frontend/`. Vercel must build the **frontend** only.

- In the Vercel project: **Settings → General → Root Directory**
- Set to: **`frontend`**
- Save.

## 2. Environment variable (required for packages & API)

The app calls your **Render backend** for packages, products, login, etc. If this is missing, packages won’t load and the API will fail.

- In the Vercel project: **Settings → Environment Variables**
- Add:
  - **Name:** `VITE_BASE_URL`
  - **Value:** `https://YOUR-RENDER-SERVICE-URL.onrender.com` (your backend URL, no trailing slash)
  - **Environment:** Production (and Preview if you want)
- Save.

## 3. Redeploy so changes and env are applied

- **Deployments** tab → open the **⋯** on the latest deployment → **Redeploy**
- Enable **“Clear build cache and redeploy”**
- Click **Redeploy**

This forces a new build with the correct root, `VITE_BASE_URL`, and latest code (including the login eye icon and other UI).

## 4. Check after deploy

- **Packages:** On `/products`, the “Packages” section should load (it uses `VITE_BASE_URL` to call the backend).
- **Login:** On `/login`, the password field should have an **eye icon** to show/hide the password.
- **Products:** Product grid and filters should load from the backend.

If packages still don’t show, open the browser **Developer Tools → Network** and check the request to `/api/v1/packages`. If the URL is your Vercel domain instead of Render, `VITE_BASE_URL` is still not set or not applied; set it and redeploy with cache clear again.
