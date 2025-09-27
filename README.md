# E-commerce Database Schema

This project provides a MySQL database schema for a simple **e-commerce system**. It includes tables, relationships, triggers, and some sample data.

---

## 📂 File

* **`ecommerce_schema.sql`** → Contains SQL commands to create the database, tables, triggers, and insert sample records.

---

## ⚙️ Features

* **Customers**: Stores customer information.
* **Products**: Stores product details, pricing, and stock levels.
* **Orders**: Records customer orders with statuses.
* **Order Items**: Maintains many-to-many relationships between orders and products.
* **Triggers**: Automatically update `orders.total_amount` when order items are added, updated, or deleted.

---

## 🏗️ Database Structure

### Tables

1. **customers**

   * id (PK)
   * first_name, last_name
   * email (unique)
   * phone
   * created_at

2. **products**

   * id (PK)
   * name, sku (unique)
   * description
   * price (non-negative)
   * stock (non-negative)
   * created_at

3. **orders**

   * id (PK)
   * customer_id (FK → customers.id)
   * order_date
   * status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
   * total_amount

4. **order_items**

   * id (PK)
   * order_id (FK → orders.id)
   * product_id (FK → products.id)
   * quantity (> 0)
   * unit_price (non-negative)
   * line_total
   * **Unique** (order_id, product_id)

---

## 🚀 Installation & Usage

1. Clone this repository.
2. Run the SQL script in MySQL:

   ```bash
   mysql -u root -p < ecommerce_schema.sql
   ```
3. The script will:

   * Drop and recreate the `ecommerce_db` database
   * Create all tables and triggers
   * Insert sample customer and product data

---

## 📊 Sample Data

Customers:

* John kamau
* Jane Wanjiru 

Products:

* USB Flash Drive 32GB – $8.50
* Wireless Mouse – $12.00
* Laptop Charger 65W – $25.00

---

## 📌 Notes

* Uses **UTF-8** collation for multilingual support.
* Triggers ensure data consistency in orders.
* Example data included for quick testing.

---

## 📝 License

This project is open-source and free to use for educational or commercial purposes.
