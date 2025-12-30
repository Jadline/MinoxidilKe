const Product = require('../models/productModel');

async function fetchAllProducts(req, res) {
  try {
    // 1️⃣ Filters
    const queryObj = { ...(req.parsedFilters || {}) };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let query = Product.find(queryObj);

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

      query = query.sort(sortCriteria);
    }

    // 3️⃣ Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 4️⃣ Query DB
    const total = await Product.countDocuments(queryObj);
    const products = await query;

    // 5️⃣ Empty state
    if (!products || products.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        total: 0,
        data: { products: [] },
      });
    }

    // 6️⃣ Success response
    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      data: { products },
    });

  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
}

module.exports = fetchAllProducts;
