const Product = require('../models/productModel');
const redisClient = require('../redisClient')

async function fetchAllProducts(req, res) {
  try {
    const queryObj = { ...(req.parsedFilters || {}) };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let query = Product.find(queryObj);

  

   
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

    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const cacheKey = `products:${JSON.stringify(req.query)}`

    const cachedData = await redisClient.get(cacheKey)
    if(cachedData){
      console.log('Cache hit!')
      return res.status(200).json(JSON.parse(cachedData))
    }

    console.log('Cache miss! Fetching from mongoDB')
    const total = await Product.countDocuments(queryObj);

    const products = await query;

    if (!products || products.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        total: 0,
        data: { products: [] },
      });
    }

  const response = {
    status : 'success',
    results : products.length,
    total,
    data : {products}
  }

  await redisClient.setEx(cacheKey,3600,JSON.stringify(response));

  res.status(200).json(response)

  
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
}

module.exports = fetchAllProducts;
