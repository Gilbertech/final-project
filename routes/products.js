// routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create product
router.post('/', async (req, res) => {
  const { name, sku, description, price, stock } = req.body;
  if (!name || !sku || price == null) return res.status(400).json({ error: 'name, sku, price required' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, sku, description, price, stock) VALUES (?, ?, ?, ?, ?)',
      [name, sku, description || null, price, stock || 0]
    );
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Read all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Read single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  const { name, sku, description, price, stock } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE products SET name = COALESCE(?, name), sku = COALESCE(?, sku),
       description = COALESCE(?, description), price = COALESCE(?, price), stock = COALESCE(?, stock)
       WHERE id = ?`,
      [name, sku, description, price, stock, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

module.exports = router;
