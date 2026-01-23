const parseFilters = require('./parseFilters');

const categoryMap = require('../utils/categoryMap');

const createReq = (query = {}) => ({ query });
const createRes = () => ({});

const createNext = () => jest.fn();

describe('parseFilters middleware', () => {
  test('correctly parses category and price filters from query parameters', () => {
    const slug1 = 'hair-growth-treatments';
    const slug2 = 'scalp-tools';

    const req = createReq({
      category: `${slug1},${slug2}`,
      minPrice: '10',
      maxPrice: '50',
    });
    const res = createRes();
    const next = createNext();

    parseFilters(req, res, next);

    expect(req.parsedFilters).toBeDefined();

    // Category should be mapped through categoryMap and put into $in
    expect(req.parsedFilters.category).toEqual({
      $in: [categoryMap[slug1], categoryMap[slug2]],
    });

    // Price should contain numeric gte/lte
    expect(req.parsedFilters.price).toEqual({
      $gte: 10,
      $lte: 50,
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('removes empty price filter if min and max prices are invalid', () => {
    const req = createReq({
      minPrice: 'abc',
      maxPrice: 'xyz',
    });
    const res = createRes();
    const next = createNext();

    parseFilters(req, res, next);

    // parsedFilters should exist, but without price when both values are invalid
    expect(req.parsedFilters).toBeDefined();
    expect(req.parsedFilters.price).toBeUndefined();

    // No other filters in this case
    expect(req.parsedFilters).toEqual({});

    expect(next).toHaveBeenCalledTimes(1);
  });
});
