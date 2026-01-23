const categoryMap = require('../utils/categoryMap')

function parseFilters(req, res, next) {
    const { category, minPrice, maxPrice } = req.query;
    const filters = {};

    if (category) {
        const cats = String(category)
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
            .map((slug) => categoryMap[slug] || slug);

        if (cats.length) {
            filters.category = { $in: cats };
        }
    }

    if (minPrice || maxPrice) {
        const min = Number(minPrice);
        const max = Number(maxPrice);

        filters.price = {};

        if (!Number.isNaN(min)) filters.price.$gte = min;
        if (!Number.isNaN(max)) filters.price.$lte = max;

        // Remove empty price object if both are NaN
        if (Object.keys(filters.price).length === 0) {
            delete filters.price;
        }
    }

    req.parsedFilters = filters;
    next();
}

module.exports = parseFilters;
