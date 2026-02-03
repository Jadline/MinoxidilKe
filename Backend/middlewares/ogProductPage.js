const path = require("path");
const fs = require("fs").promises;
const { getProductByIdOrMongoId } = require("../controllers/productController");

const FRONTEND_DIST =
  process.env.FRONTEND_DIST ||
  path.join(__dirname, "..", "..", "frontend", "dist");
const INDEX_HTML = path.join(FRONTEND_DIST, "index.html");

function escapeHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteImageUrl(baseUrl, imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  const trimmed = imagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  const pathPart = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl.replace(/\/$/, "")}${pathPart}`;
}

/**
 * Serves index.html with Open Graph meta tags for product URLs.
 * When WhatsApp (or any crawler) requests GET /product-details/:id, returns HTML with og:image etc.
 * so the shared link shows the product photo in the preview.
 */
async function ogProductPage(req, res, next) {
  if (req.method !== "GET") return next();
  const idParam = req.params.id;
  if (!idParam) return next();

  let product;
  try {
    product = await getProductByIdOrMongoId(idParam);
  } catch (err) {
    console.error("OG product fetch error:", err?.message);
    return next();
  }

  if (!product) return next();

  const baseUrl = `${req.protocol || "https"}://${
    req.get("host") || req.hostname || ""
  }`;
  const pageUrl = `${baseUrl}/product-details/${product._id ?? product.id}`;
  const title = product.name || "Product";
  const desc =
    typeof product.description === "string"
      ? product.description
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 160)
      : "";
  const imgSrc =
    product.images?.[0]?.src ??
    product.images?.[0]?.url ??
    product.imageSrc ??
    "";
  const imageUrl = absoluteImageUrl(baseUrl, imgSrc);

  const metaTags = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(desc)}">`,
  ];
  if (imageUrl) {
    metaTags.push(
      `<meta property="og:image" content="${escapeHtml(imageUrl)}">`
    );
  }

  let html;
  try {
    html = await fs.readFile(INDEX_HTML, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(
        "OG: index.html not found at",
        INDEX_HTML,
        "- build frontend first."
      );
      return next();
    }
    throw err;
  }

  const injectBefore = "</head>";
  const insert = metaTags.join("\n    ") + "\n  " + injectBefore;
  const newHtml = html.replace(injectBefore, insert);

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(newHtml);
}

module.exports = { ogProductPage, FRONTEND_DIST, INDEX_HTML };
