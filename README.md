# final-project
# E-commerce CRUD API (MySQL + Express)

## Overview
Simple CRUD API implementing Products and Orders using MySQL. Order ⇄ Product is many-to-many using `order_items`.

## Requirements
- Node.js (>=16)
- MySQL server
- npm

## Setup

1. Clone repo
2. Create DB:
   - Import `sql/ecommerce_schema.sql` into your MySQL server:
     `mysql -u root -p < sql/ecommerce_schema.sql`
3. Copy `.env.example` to `.env` and edit database credentials.
4. Install packages:
   `npm install`
5. Run server:
   `npm run dev` (requires nodemon) or `npm start`

Server will run on the port in `.env` (default 3000).

## API Endpoints

### Products
- `GET /api/products` — list all products
- `GET /api/products/:id` — get product by id
- `POST /api/products` — create product
  - Body: `{ "name": "Name", "sku": "SKU", "description": "...", "price": 10.50, "stock": 20 }`
- `PUT /api/products/:id` — update product (partial)
- `DELETE /api/products/:id` — delete product

### Orders
- `GET /api/orders` — list orders
- `GET /api/orders/:id` — get order + items
- `POST /api/orders` — create order
  - Body example:
    ```
    {
      "customer_id": 1,
      "items": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 2, "quantity": 1 }
      ]
    }
    ```
- `PATCH /api/orders/:id/status` — update order status
  - Body: `{ "status": "shipped" }` (allowed: pending, confirmed, shipped, delivered, cancelled)
- `DELETE /api/orders/:id` — delete order (order_items cascade deleted)

## Notes
- The SQL file includes triggers that adjust `orders.total_amount` whenever `order_items` change.
- Error handling is minimal and intended for demonstration — for production, add validation, authentication, and better error reporting.
