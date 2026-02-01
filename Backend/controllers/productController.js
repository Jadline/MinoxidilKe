const crypto = require('crypto');
const Product = require('../models/productModel');
const ProductCache = require('../models/productCacheModel');

function buildCacheKey(filters, query) {
  const payload = {
    filters,
    sort: query.sort || null,
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 5,
  };

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');

  return `products:${hash}`;
}

/** Clear all product list caches so list endpoints return fresh data after create/update/delete. */
async function invalidateProductListCache() {
  try {
    await ProductCache.deleteMany({ key: /^products:/ });
  } catch (err) {
    console.error('Product cache invalidation error:', err.message);
  }
}

async function fetchAllProducts(req, res) {
  try {
    // 1️⃣ Filters
    const queryObj = { ...(req.parsedFilters || {}) };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Build base query (without pagination yet)
    let mongoQuery = Product.find(queryObj);

    // 2️⃣ Sorting
    if (req.query.sort) {
      const sortOption = req.query.sort;
      let sortCriteria = {};

      switch (sortOption) {
        case 'price-asc':
          sortCriteria = { price: 1 };
          break;
        case 'price-desc':
          sortCriteria = { price: -1 };
          break;
        case 'name-asc':
          sortCriteria = { name: 1 };
          break;
        case 'name-desc':
          sortCriteria = { name: -1 };
          break;
        default:
          sortCriteria = { _id: -1 };
      }

      mongoQuery = mongoQuery.sort(sortCriteria);
    }

    // Apply pagination and lean for faster reads
    mongoQuery = mongoQuery.skip(skip).limit(limit).lean();

    const cacheKey = buildCacheKey(queryObj, req.query);

    // 3️⃣ Try cache first (MongoDB TTL cache)
    try {
      const cacheEntry = await ProductCache.findOne({ key: cacheKey }).lean();
      if (cacheEntry && cacheEntry.value) {
        return res.status(200).json(cacheEntry.value);
      }
    } catch (cacheErr) {
      console.error('Product cache read error:', cacheErr.message);
    }

    // 4️⃣ Query DB in parallel
    const [total, products] = await Promise.all([
      Product.countDocuments(queryObj),
      mongoQuery,
    ]);

    // 5️⃣ Empty state
    if (!products || products.length === 0) {
      const response = {
        status: 'success',
        results: 0,
        total: 0,
        data: { products: [] },
      };

      // Cache empty result as well (MongoDB TTL cache)
      try {
        await ProductCache.updateOne(
          { key: cacheKey },
          { key: cacheKey, value: response, createdAt: new Date() },
          { upsert: true }
        );
      } catch (cacheErr) {
        console.error('Product cache write error:', cacheErr.message);
      }

      return res.status(200).json(response);
    }

    // 6️⃣ Success response
    const response = {
      status: 'success',
      results: products.length,
      total,
      data: { products },
    };

    // Store in cache for subsequent requests (MongoDB TTL cache)
    try {
      await ProductCache.updateOne(
        { key: cacheKey },
        { key: cacheKey, value: response, createdAt: new Date() },
        { upsert: true }
      );
    } catch (cacheErr) {
      console.error('Product cache write error:', cacheErr.message);
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
}

/** Get one product by numeric id (public). */
async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ status: 'fail', message: 'Invalid product id.' });
    }
    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }
    res.status(200).json({ status: 'success', data: { product } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Failed to fetch product.' });
  }
}

/** Get next product id (max id + 1). Used by createProduct. */
async function getNextProductId() {
  const agg = await Product.aggregate([{ $group: { _id: null, maxId: { $max: '$id' } } }]);
  const maxId = agg[0]?.maxId ?? 0;
  return maxId + 1;
}

/** Create product (admin only). */
async function createProduct(req, res) {
  try {
    const payload = req.body;
    if (!payload.name) {
      return res.status(400).json({ status: 'fail', message: 'Product name is required.' });
    }
    const id = payload.id != null ? Number(payload.id) : await getNextProductId();
    const product = await Product.create({
      id,
      name: payload.name,
      price: payload.price ?? 0,
      quantityLabel: payload.quantityLabel ?? '',
      imageSrc: payload.imageSrc ?? '',
      imageAlt: payload.imageAlt ?? payload.name,
      rating: payload.rating ?? 0,
      inStock: payload.inStock !== false,
      category: payload.category ?? '',
      leadTime: payload.leadTime ?? '',
      images: payload.images ?? [],
      description: payload.description ?? '',
      details: payload.details ?? [],
    });
    await invalidateProductListCache();
    res.status(201).json({ status: 'success', data: { product } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Failed to create product.' });
  }
}

/** Update product by id (numeric) (admin only). */
async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ status: 'fail', message: 'Invalid product id.' });
    }
    const product = await Product.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }
    await invalidateProductListCache();
    res.status(200).json({ status: 'success', data: { product } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Failed to update product.' });
  }
}

/** Delete product by id (numeric) (admin only). */
async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ status: 'fail', message: 'Invalid product id.' });
    }
    const product = await Product.findOneAndDelete({ id });
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }
    await invalidateProductListCache();
    res.status(200).json({ status: 'success', message: 'Product deleted.', data: { product } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message || 'Failed to delete product.' });
  }
}

module.exports = {
  fetchAllProducts,
  getProductById,
  buildCacheKey,
  createProduct,
  updateProduct,
  deleteProduct,
};
