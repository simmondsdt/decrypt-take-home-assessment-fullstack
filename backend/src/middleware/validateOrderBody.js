/**
 * Validation for POST /api/orders body.
 * Validates that req.body has:
 * - items: array of { productId: string, quantity: number }
 * - each item must have productId (non-empty string) and quantity (positive integer)
 * If invalid, respond with 400 and { error: '...' } and do not call next().
 * If valid, call next().
 */
function validateOrderBody(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  if (!Array.isArray(body.items)) {
    return res.status(400).json({ error: 'Body must include an items array' });
  }

  for (const [index, item] of body.items.entries()) {
    if (!item || typeof item !== 'object') {
      return res.status(400).json({
        error: `items[${index}]: each item must be an object with productId and quantity`,
      });
    }

    const { productId, quantity } = item;

    if (typeof productId !== 'string' || productId.trim() === '') {
      return res.status(400).json({
        error: `items[${index}]: productId must be a non-empty string`,
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        error: `items[${index}]: quantity must be a positive integer`,
      });
    }
  }

  next();
}

module.exports = { validateOrderBody };
