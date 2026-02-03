# Deploy everything from Render (no Vercel)

One Render web service builds the **frontend** and runs the **backend**; the backend serves the API and the built frontend. All changes in this repo go live when you push and Render redeploys.

## 1. Use the repo root on Render

- If this is a **new** Render service: when you connect the repo, leave **Root Directory** empty (repo root).
- If you already have a service with **Root Directory = `Backend`**: change it to **empty** (repo root) so Render can see both `frontend/` and `Backend/`.

## 2. Build & start commands

In the Render service **Settings**:

| Setting          | Value              |
|------------------|--------------------|
| **Build Command** | `npm run build`   |
| **Start Command** | `npm start`      |

These use the root `package.json`:

- **Build:** installs frontend deps, runs `vite build` (creates `frontend/dist`), then installs backend deps.
- **Start:** runs the Backend (`node server.js`), which serves `/api/*`, `/uploads`, and the frontend from `frontend/dist` (including OG product previews).

## 3. Environment variables

In **Environment** for this service, set at least:

| Variable         | When      | Example / note |
|------------------|-----------|-----------------|
| `DATABASE`       | Always    | Your MongoDB connection string. |
| `VITE_BASE_URL`  | **Build** | Your Render service URL, e.g. `https://minoxidilke.onrender.com` (no trailing slash). Used so the frontend calls the right API and links. |

Add any other env vars your Backend already needs (e.g. Stripe, JWT secret, email, etc.).  
**Important:** Set `VITE_BASE_URL` **before** the first build (or before a redeploy). You can use the URL Render shows for the service (e.g. `https://minoxidilke.onrender.com`).

## 4. Deploy

- Push to the branch Render is watching (e.g. `main`). Render will run `npm run build` then `npm start`.
- Or use **Manual Deploy** in the Render dashboard.

After deploy, open your service URL: you get the same app (packages, products, login with eye icon, WhatsApp links, etc.) with no Vercel and no CORS/URL mismatch.

## 5. If you were on Vercel before

- You can leave the Vercel project off or delete it.
- Point your domain to the Render service URL if you use a custom domain.

## Troubleshooting

- **“Packages” or API not loading:** Ensure `VITE_BASE_URL` is set and matches the service URL (no trailing slash), then trigger a new deploy so the frontend is rebuilt.
- **Build fails:** Check the build logs. Common fixes: Node 18+ (set in Render if needed), and that the repo root has both `frontend/` and `Backend/` with their own `package.json`.
