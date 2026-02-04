const path = require("path");
const fs = require("fs");
const Package = require("../models/packageModel");
const Product = require("../models/productModel");

/** Persist path-only imageSrc so images survive port/env changes. Strip origin from full URLs. */
function normalizeImageSrc(imageSrc) {
  if (imageSrc == null || typeof imageSrc !== "string") return "";
  const s = imageSrc.trim();
  if (!s) return "";
  if (!s.startsWith("http")) return s.startsWith("/") ? s : "/" + s;
  try {
    const u = new URL(s);
    const p = u.pathname;
    return p && p.startsWith("/uploads/") ? p : s;
  } catch (_) {
    return s.startsWith("/") ? s : "/" + s;
  }
}

/** Get next package id (max id + 1). */
async function getNextPackageId() {
  const agg = await Package.aggregate([
    { $group: { _id: null, maxId: { $max: "$id" } } },
  ]);
  const maxId = agg[0]?.maxId ?? 0;
  return maxId + 1;
}

/** Get distinct package categories (public, for dropdowns). */
async function getPackageCategories(req, res) {
  try {
    const categories = await Package.distinct("category").then((arr) =>
      (arr || []).filter((c) => c != null && String(c).trim() !== "").sort()
    );
    res.status(200).json({ status: "success", data: { categories } });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to fetch categories.",
    });
  }
}

/** List all packages (public). */
async function fetchAllPackages(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const packages = await Package.find({}).sort({ id: 1 }).limit(limit).lean();
    res.status(200).json({
      status: "success",
      results: packages.length,
      data: { packages },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to fetch packages.",
    });
  }
}

/** Get one package by numeric id with product details populated (public). */
async function getPackageById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid package id." });
    }
    const pkg = await Package.findOne({ id }).lean();
    if (!pkg) {
      return res
        .status(404)
        .json({ status: "fail", message: "Package not found." });
    }
    const products = await Product.find({
      id: { $in: pkg.productIds || [] },
    }).lean();
    res.status(200).json({
      status: "success",
      data: {
        package: { ...pkg, products },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to fetch package.",
    });
  }
}

/** Create package (admin only). */
async function createPackage(req, res) {
  try {
    const payload = req.body;
    // #region agent log
    const _p = {
      location: "packageController.js:createPackage",
      message: "Create package payload",
      data: {
        imageSrc: payload.imageSrc,
        isFullUrl:
          typeof payload.imageSrc === "string" &&
          payload.imageSrc.startsWith("http"),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H2",
    };
    try {
      fs.appendFileSync(
        path.join(__dirname, "..", "..", ".cursor", "debug.log"),
        JSON.stringify(_p) + "\n"
      );
    } catch (_) {}
    fetch("http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_p),
    }).catch(() => {});
    // #endregion
    if (!payload.name) {
      return res
        .status(400)
        .json({ status: "fail", message: "Package name is required." });
    }
    if (payload.bundlePrice == null || Number(payload.bundlePrice) < 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Valid bundle price is required." });
    }
    const id =
      payload.id != null ? Number(payload.id) : await getNextPackageId();
    const productIds = Array.isArray(payload.productIds)
      ? payload.productIds
          .map((n) => Number(n))
          .filter((n) => Number.isInteger(n) && n > 0)
      : [];
    const packageDoc = await Package.create({
      id,
      name: payload.name,
      description: payload.description ?? "",
      imageSrc: normalizeImageSrc(payload.imageSrc),
      imageAlt: payload.imageAlt ?? payload.name,
      productIds,
      bundlePrice: Number(payload.bundlePrice),
      quantityLabel: payload.quantityLabel ?? "1 pack",
      rating: 0,
      inStock: payload.inStock !== false,
      category: payload.category ?? "",
      leadTime: payload.leadTime ?? "",
      details: Array.isArray(payload.details) ? payload.details : [],
    });
    res.status(201).json({ status: "success", data: { package: packageDoc } });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to create package.",
    });
  }
}

/** Update package by id (admin only). */
async function updatePackage(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid package id." });
    }
    const body = { ...req.body };
    if (body.productIds) {
      body.productIds = body.productIds
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n > 0);
    }
    if (body.details !== undefined) {
      body.details = Array.isArray(body.details) ? body.details : [];
    }
    delete body.rating;
    if (body.imageSrc !== undefined)
      body.imageSrc = normalizeImageSrc(body.imageSrc);
    // #region agent log
    const _p = {
      location: "packageController.js:updatePackage",
      message: "Update package body",
      data: {
        imageSrc: body.imageSrc,
        isFullUrl:
          typeof body.imageSrc === "string" && body.imageSrc.startsWith("http"),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H2",
    };
    try {
      fs.appendFileSync(
        path.join(__dirname, "..", "..", ".cursor", "debug.log"),
        JSON.stringify(_p) + "\n"
      );
    } catch (_) {}
    fetch("http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_p),
    }).catch(() => {});
    // #endregion
    const pkg = await Package.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!pkg) {
      return res
        .status(404)
        .json({ status: "fail", message: "Package not found." });
    }
    res.status(200).json({ status: "success", data: { package: pkg } });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to update package.",
    });
  }
}

/** Delete package by id (admin only). */
async function deletePackage(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid package id." });
    }
    const pkg = await Package.findOneAndDelete({ id });
    if (!pkg) {
      return res
        .status(404)
        .json({ status: "fail", message: "Package not found." });
    }
    res.status(200).json({
      status: "success",
      message: "Package deleted.",
      data: { package: pkg },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to delete package.",
    });
  }
}

module.exports = {
  getPackageCategories,
  fetchAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};
