const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const morgan = require("morgan");
const productRouter = require("./routes/productRoute");
const packageRouter = require("./routes/packageRoute");
const paymentRouter = require("./routes/paymentRoute");
const OrderRouter = require("./routes/orderRoute");
const mpesaRouter = require("./routes/mpesaRoute");
const emailRouter = require("./routes/emailRoute");
const userRouter = require("./routes/userRoute");
const reviewRoutes = require("./routes/reviewRoutes");
const packageReviewRoutes = require("./routes/packageReviewRoutes");
const uploadRouter = require("./routes/uploadRoute");
const shippingMethodRouter = require("./routes/shippingMethodRoute");
const pickupLocationRouter = require("./routes/pickupLocationRoute");
const addressRouter = require("./routes/addressRoute");
const {
  ogProductPage,
  FRONTEND_DIST,
  INDEX_HTML,
} = require("./middlewares/ogProductPage");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(morgan("dev"));

app.use(express.json());

// Serve uploaded files (package images)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.use("/api/v1/products", productRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/make-card-payment", paymentRouter);
app.use("/api/v1/orders", OrderRouter);
app.use("/api/v1/mpesa-notify", mpesaRouter);
app.use("/api/v1/contact", emailRouter);
app.use("/api/v1/account", userRouter);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/package-reviews", packageReviewRoutes);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/shipping-methods", shippingMethodRouter);
app.use("/api/v1/pickup-locations", pickupLocationRouter);
app.use("/api/v1/addresses", addressRouter);

// Server-side Open Graph: when a crawler (e.g. WhatsApp) requests /product-details/:id,
// return index.html with og:image etc. so the shared link shows the product photo.
app.get("/product-details/:id", ogProductPage);

// Serve frontend build (so shared product links get OG from this server)
app.use(express.static(FRONTEND_DIST));
app.get("*", async (req, res, next) => {
  if (req.method !== "GET") return next();
  try {
    const html = await fs.readFile(
      path.join(FRONTEND_DIST, "index.html"),
      "utf8"
    );
    res.set("Content-Type", "text/html; charset=utf-8").send(html);
  } catch (err) {
    if (err.code === "ENOENT") next();
    else next(err);
  }
});

// Global error handler middleware (catch any unhandled errors)
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  console.error("Error stack:", err.stack);

  if (!res.headersSent) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = app;
