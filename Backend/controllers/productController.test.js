const fetchAllProducts = require('./productController');

// buildCacheKey is exposed as a property on the exported handler for testing
const { buildCacheKey } = fetchAllProducts;

jest.mock('../models/productModel', () => {
  const mockQuery = (products = []) => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve(products)),
    };
    return query;
  };

  return {
    __esModule: true,
    default: {},
    find: jest.fn(() => mockQuery([])),
    countDocuments: jest.fn().mockResolvedValue(0),
    // For tests we’ll override find/countDocuments implementations as needed
    __mockQuery: mockQuery,
  };
});

jest.mock('../models/productCacheModel', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

const Product = require('../models/productModel');
const ProductCache = require('../models/productCacheModel');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('buildCacheKey', () => {
  test('generates a deterministic cache key for same filters and query', () => {
    const filters = { category: { $in: ['Hair Growth Treatments'] } };
    const query = { sort: 'price-asc', page: '2', limit: '10' };

    const key1 = buildCacheKey(filters, query);
    const key2 = buildCacheKey(filters, query);

    expect(key1).toBe(key2);
    expect(key1).toMatch(/^products:/);
  });

  test('generates different keys when filters or query parameters differ', () => {
    const filters = { category: { $in: ['Hair Growth Treatments'] } };

    const baseQuery = { sort: 'price-asc', page: '1', limit: '5' };
    const keyBase = buildCacheKey(filters, baseQuery);
    const keyDifferentPage = buildCacheKey(filters, { ...baseQuery, page: '2' });
    const keyDifferentSort = buildCacheKey(filters, { ...baseQuery, sort: 'name-asc' });
    const keyDifferentFilters = buildCacheKey({ category: { $in: ['Scalp Tools'] } }, baseQuery);

    expect(keyDifferentPage).not.toBe(keyBase);
    expect(keyDifferentSort).not.toBe(keyBase);
    expect(keyDifferentFilters).not.toBe(keyBase);
  });
});

describe('fetchAllProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses cache when available and respects sorting/pagination parameters', async () => {
    const cachedResponse = {
      status: 'success',
      results: 1,
      total: 1,
      data: { products: [{ id: 1, name: 'Cached Product' }] },
    };

    ProductCache.findOne.mockResolvedValueOnce({
      key: 'some-cache-key',
      value: cachedResponse,
    });

    const req = {
      query: { sort: 'price-asc', page: '2', limit: '5' },
      parsedFilters: { category: { $in: ['Hair Growth Treatments'] } },
    };
    const res = createMockRes();

    await fetchAllProducts(req, res);

    expect(ProductCache.findOne).toHaveBeenCalledTimes(1);
    const [{ key: cacheKey }] = ProductCache.findOne.mock.calls[0];
    expect(cacheKey).toMatch(/^products:/);

    // When cache is hit, DB should not be queried
    expect(Product.find).not.toHaveBeenCalled();
    expect(Product.countDocuments).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(cachedResponse);
  });

  test('queries DB, applies pagination, and caches non-empty results when cache is missing', async () => {
    // No cache
    ProductCache.findOne.mockResolvedValueOnce(null);

    const products = [
      { id: 1, name: 'P1', price: 10 },
      { id: 2, name: 'P2', price: 20 },
    ];

    const queryInstance = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve(products)),
    };

    Product.find.mockReturnValueOnce(queryInstance);
    Product.countDocuments.mockResolvedValueOnce(2);

    const req = {
      query: { sort: 'price-asc', page: '1', limit: '2' },
      parsedFilters: { category: { $in: ['Hair Growth Treatments'] } },
    };
    const res = createMockRes();

    await fetchAllProducts(req, res);

    // Sorting & pagination behavior
    expect(Product.find).toHaveBeenCalledWith({ category: { $in: ['Hair Growth Treatments'] } });
    expect(queryInstance.sort).toHaveBeenCalledWith({ price: 1 });
    expect(queryInstance.skip).toHaveBeenCalledWith(0); // (page 1 - 1) * 2
    expect(queryInstance.limit).toHaveBeenCalledWith(2);
    expect(queryInstance.lean).toHaveBeenCalled();

    const expectedResponse = {
      status: 'success',
      results: products.length,
      total: 2,
      data: { products },
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);

    // Cached with TTL via MongoDB
    expect(ProductCache.updateOne).toHaveBeenCalledTimes(1);
    const [filter, update] = ProductCache.updateOne.mock.calls[0];
    expect(filter.key).toMatch(/^products:/);
    expect(update.value).toEqual(expectedResponse);
  });

  test('caches empty product results correctly', async () => {
    ProductCache.findOne.mockResolvedValueOnce(null);

    const emptyProducts = [];
    const queryInstance = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve(emptyProducts)),
    };

    Product.find.mockReturnValueOnce(queryInstance);
    Product.countDocuments.mockResolvedValueOnce(0);

    const req = {
      query: { page: '1', limit: '5' },
      parsedFilters: {},
    };
    const res = createMockRes();

    await fetchAllProducts(req, res);

    const expectedResponse = {
      status: 'success',
      results: 0,
      total: 0,
      data: { products: [] },
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);

    expect(ProductCache.updateOne).toHaveBeenCalledTimes(1);
    const [filter, update] = ProductCache.updateOne.mock.calls[0];
    expect(filter.key).toMatch(/^products:/);
    expect(update.value).toEqual(expectedResponse);
  });
});
