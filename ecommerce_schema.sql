-- ecommerce_schema.sql
-- Create database and all tables for a simple e-commerce system
-- Use: mysql -u root -p < ecommerce_schema.sql

DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- Customers table
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- order_items: join table for many-to-many relationship between orders and products
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE (order_id, product_id)
);

-- Triggers to ensure order total stays consistent when inserting/updating/deleting order_items
DELIMITER $$
CREATE TRIGGER trg_order_item_insert AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
    SET total_amount = total_amount + NEW.line_total
    WHERE id = NEW.order_id;
END$$

CREATE TRIGGER trg_order_item_delete AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
    SET total_amount = total_amount - OLD.line_total
    WHERE id = OLD.order_id;
END$$

CREATE TRIGGER trg_order_item_update AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
    SET total_amount = total_amount - OLD.line_total + NEW.line_total
    WHERE id = NEW.order_id;
END$$
DELIMITER ;

-- Insert sample data (optional)
INSERT INTO customers (first_name, last_name, email, phone)
VALUES ('John', 'Doe', 'john.doe@example.com', '0712000000'),
       ('Jane', 'Wanjiru', 'jane.w@example.com', '0722000000');

INSERT INTO products (name, sku, description, price, stock)
VALUES ('USB Flash Drive 32GB', 'USB32-001', 'High-speed USB 3.0 flash drive', 8.50, 150),
       ('Wireless Mouse', 'MOUSE-002', 'Ergonomic 2.4GHz wireless mouse', 12.00, 80),
       ('Laptop Charger 65W', 'CHG65-003', 'Universal laptop charger', 25.00, 40);
