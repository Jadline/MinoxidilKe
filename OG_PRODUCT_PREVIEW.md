# Product link preview (WhatsApp / social)

When someone shares a product link (e.g. `https://yoursite.com/product-details/123`), WhatsApp and other apps show a **preview with the product photo**. That is done with **server-side Open Graph** meta tags.

## How it works

1. **Backend** serves the frontend build and handles `GET /product-details/:id`.
2. For that URL it loads the product, injects `og:image`, `og:title`, `og:description`, `og:url` into `index.html`, and returns the HTML.
3. Crawlers (WhatsApp, Facebook, etc.) read these meta tags and show the product image in the preview.

## Deployment (backend serving frontend)

1. **Build the frontend**

   ```bash
   cd frontend && npm run build
   ```

2. **Run the backend** (from repo root or from `Backend/`)

   ```bash
   cd Backend && npm start
   ```

3. The backend will:

   - Serve API at `/api/v1/...`
   - Serve uploads at `/uploads`
   - For `GET /product-details/:id` → return HTML with product OG meta (so shared links show the photo)
   - Serve static files from `frontend/dist` and SPA fallback (index.html)

4. **Optional:** set `FRONTEND_DIST` if your build lives elsewhere:
   ```bash
   FRONTEND_DIST=/path/to/frontend/dist node server.js
   ```

## If you keep frontend and backend on different hosts

If the frontend stays on Vercel/Netlify and the backend on Render/another host, then when someone opens `https://your-frontend.vercel.app/product-details/123`, the request goes to Vercel, not your Node backend. In that case you’d need a **serverless function** on the frontend host (e.g. Vercel serverless for `/product-details/[id]`) that fetches the product from your API and returns HTML with OG meta. The backend code in `Backend/middlewares/ogProductPage.js` and the route in `Backend/app.js` still work when the backend is the one serving the site (same origin for API and frontend).
