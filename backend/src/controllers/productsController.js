const { products } = require('../data/mockData');

function listProducts(_req, res) {
  res.json(products);
}

/**
 * Get a single product by id.
 * Returns the product when found, or 404 with { error: 'Product not found' } when the id does not match.
 */
function getProductById(req, res) {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
}

module.exports = { listProducts, getProductById };
