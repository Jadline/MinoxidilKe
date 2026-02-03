# Deploy with Vercel CLI

Deploy the frontend from your machine so the **latest code** (packages, login eye, etc.) goes live every time.

## 1. Install Vercel CLI (once)

```bash
npm i -g vercel
```

## 2. Deploy from the `frontend` folder

Always run Vercel from **inside `frontend/`**:

```bash
cd frontend
vercel
```

First time: Vercel will ask you to log in (if needed), then **link** this folder to a Vercel project (choose existing or create new). Confirm the settings; the **root** should be the current directory (frontend).

## 3. Set your backend URL (so packages & API work)

The app needs **VITE_BASE_URL** at **build** time (your Render backend URL).

**Option A – When deploying (recommended)**

```bash
cd frontend
vercel --prod --build-env VITE_BASE_URL=https://YOUR-RENDER-URL.onrender.com
```

Replace `YOUR-RENDER-URL` with your real Render service URL (no trailing slash).

**Option B – In Vercel Dashboard (then deploy)**

1. Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add **VITE_BASE_URL** = `https://YOUR-RENDER-URL.onrender.com` for **Production**
3. Then from your machine:

```bash
cd frontend
vercel --prod
```

Vercel will use the env from the project when building.

## 4. Deploy commands

From **repo root**:

```bash
cd frontend && npm run deploy
```

Preview deployment (optional):

```bash
cd frontend && vercel
```

Production deployment:

```bash
cd frontend && npm run deploy:prod
```

Or with the API URL inline:

```bash
cd frontend && vercel --prod --build-env VITE_BASE_URL=https://YOUR-RENDER-URL.onrender.com
```

## 5. After deploy

- Your latest changes (packages, login eye, WhatsApp, etc.) will be live at the Vercel URL.
- If you use **Option B**, any change to env vars in the dashboard will apply on the **next** deploy.

## Troubleshooting

- **Packages still not loading:** Make sure `VITE_BASE_URL` is set and points to your Render backend (no trailing slash), and that you ran a **production** deploy (`vercel --prod`) after setting it.
- **Old UI still showing:** Run `vercel --prod --force` to force a new build and bypass cache.
- **`Error: Command "npm run build" exited with 1`:** Open the **Inspect** URL from the deploy output (e.g. `https://vercel.com/.../minoxidilke/...`) and check the **Build Logs** for the real error (e.g. missing dependency, Node version, or a Vite/Rollup error). The project is set to use Node 18+ and `npm ci` for install; if the log shows a different error, share it to fix the root cause.
