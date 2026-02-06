const crypto = require('crypto');
const { ordersStore, products } = require('../data/mockData');

function generateOrderId() {
  return 'ord_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

function listOrders(_req, res) {
  res.json(ordersStore);
}

function getOrderById(req, res) {
  const order = ordersStore.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const email = req.query.email?.trim();
  if (email && order.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
}

function createOrder(req, res) {
  const body = req.body || {};
  const customerEmail = body.customerEmail ?? 'guest@example.com';
  const items = body.items ?? [];

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const unitPrice = product.price;
    const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
    orderItems.push({ productId: product.id, quantity, unitPrice });
    totalAmount += unitPrice * quantity;
  }

  const newOrder = {
    id: generateOrderId(),
    customerEmail,
    items: orderItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.push(newOrder);
  res.status(201).json(newOrder);
}

module.exports = { listOrders, getOrderById, createOrder };
