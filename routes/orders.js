// routes/orders.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

/*
Order payload example for creation:
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
*/

// Create order (with items) - transactionally
router.post('/', async (req, res) => {
  const { customer_id, items } = req.body;
  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customer_id and items[] required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Create order
    const [orderRes] = await conn.execute(
      'INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)', [customer_id, 0]
    );
    const orderId = orderRes.insertId;
    let total = 0;

    // For each item, fetch product price and insert order_items, update stock
    for (const it of items) {
      const { product_id, quantity } = it;
      if (!product_id || !quantity || quantity <= 0) throw new Error('Invalid item');

      // Get product
      const [pRows] = await conn.execute('SELECT price, stock FROM products WHERE id = ?', [product_id]);
      if (pRows.length === 0) throw new Error(`Product ${product_id} not found`);
      if (pRows[0].stock < quantity) throw new Error(`Insufficient stock for product ${product_id}`);

      const unitPrice = parseFloat(pRows[0].price);
      const lineTotal = +(unitPrice * quantity).toFixed(2);
      total += lineTotal;

      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
        [orderId, product_id, quantity, unitPrice, lineTotal]
      );

      // Decrease stock
      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product_id]);
    }

    // Update order total
    await conn.execute('UPDATE orders SET total_amount = ? WHERE id = ?', [total.toFixed(2), orderId]);

    await conn.commit();

    // Return order details
    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [itemsRows] = await pool.execute(
      `SELECT oi.*, p.name, p.sku
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`, [orderId]
    );

    res.status(201).json({ order: orderRows[0], items: itemsRows });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not create order' });
  } finally {
    conn.release();
  }
});

// Get all orders (basic)
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Get single order with items
router.get('/:id', async (req, res) => {
  try {
    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const [itemsRows] = await pool.execute(
      `SELECT oi.*, p.name, p.sku
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`, [req.params.id]
    );
    res.json({ order: orderRows[0], items: itemsRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','confirmed','shipped','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });

  try {
    const [result] = await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Delete order (this will cascade delete order_items)
router.delete('/:id', async (req, res) => {
  try {
    // Optionally: restore stock when deleting an order — omitted for brevity
    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

module.exports = router;
