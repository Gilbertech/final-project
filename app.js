// app.js
const express = require('express');
const bodyParser = require('body-parser');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Health
app.get('/', (req, res) => res.json({status: 'ok', message: 'E-commerce API'}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
