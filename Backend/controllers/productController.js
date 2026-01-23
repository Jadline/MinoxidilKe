const crypto = require('crypto');
const Product = require('../models/productModel');
const redisClient = require('../redisClient');

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

    // 3️⃣ Try cache first
    if (redisClient?.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          return res.status(200).json(parsed);
        }
      } catch (cacheErr) {
        console.error('Redis cache read error:', cacheErr.message);
      }
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

      // Cache empty result as well
      if (redisClient?.isOpen) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(response), {
            EX: 60,
          });
        } catch (cacheErr) {
          console.error('Redis cache write error:', cacheErr.message);
        }
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

    // Store in cache for subsequent requests
    if (redisClient?.isOpen) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(response), {
          EX: 60,
        });
      } catch (cacheErr) {
        console.error('Redis cache write error:', cacheErr.message);
      }
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
}

module.exports = fetchAllProducts;
