const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'retail_kpi.db');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'manager')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          category TEXT,
          sku TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Bills table
      db.run(`
        CREATE TABLE IF NOT EXISTS bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_number TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Bill items table
      db.run(`
        CREATE TABLE IF NOT EXISTS bill_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Insert default users
      const defaultUsers = [
        {
          username: 'admin',
          email: 'admin@retailkpi.com',
          password: 'admin123',
          role: 'manager'
        },
        {
          username: 'cashier1',
          email: 'cashier1@retailkpi.com',
          password: 'cashier123',
          role: 'user'
        },
        {
          username: 'manager1',
          email: 'manager1@retailkpi.com',
          password: 'manager123',
          role: 'manager'
        }
      ];

      defaultUsers.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.run(
          `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
          [user.username, user.email, hashedPassword, user.role]
        );
      });

      // Insert sample products
      const sampleProducts = [
        { name: 'Soap Bar', description: 'Premium soap bar', price: 2.50, stock: 100, category: 'Personal Care', sku: 'SOAP001' },
        { name: 'Soft Drink', description: 'Carbonated soft drink', price: 1.25, stock: 200, category: 'Beverages', sku: 'DRINK001' },
        { name: 'Soda Water', description: 'Sparkling water', price: 1.00, stock: 150, category: 'Beverages', sku: 'SODA001' },
        { name: 'Socks', description: 'Cotton socks', price: 5.00, stock: 80, category: 'Clothing', sku: 'SOCK001' },
        { name: 'Sunglasses', description: 'UV protection sunglasses', price: 15.00, stock: 50, category: 'Accessories', sku: 'SUN001' },
        { name: 'Shampoo', description: 'Hair shampoo 250ml', price: 8.50, stock: 75, category: 'Personal Care', sku: 'SHAM001' },
        { name: 'Sandwich', description: 'Fresh sandwich', price: 4.50, stock: 30, category: 'Food', sku: 'SAND001' },
        { name: 'Milk', description: 'Fresh milk 1L', price: 3.20, stock: 120, category: 'Dairy', sku: 'MILK001' },
        { name: 'Bread', description: 'White bread loaf', price: 2.80, stock: 90, category: 'Bakery', sku: 'BREAD001' },
        { name: 'Butter', description: 'Salted butter 200g', price: 4.00, stock: 60, category: 'Dairy', sku: 'BUTT001' },
        { name: 'Apple', description: 'Fresh red apples per kg', price: 3.50, stock: 200, category: 'Fruits', sku: 'APPL001' },
        { name: 'Banana', description: 'Fresh bananas per kg', price: 2.20, stock: 180, category: 'Fruits', sku: 'BANA001' },
        { name: 'Toothpaste', description: 'Fluoride toothpaste', price: 3.75, stock: 85, category: 'Personal Care', sku: 'TOOTH001' },
        { name: 'Tissue Box', description: 'Facial tissues 200 sheets', price: 2.25, stock: 110, category: 'Household', sku: 'TISS001' },
        { name: 'Chocolate Bar', description: 'Milk chocolate bar', price: 1.80, stock: 150, category: 'Confectionery', sku: 'CHOC001' }
      ];

      sampleProducts.forEach(product => {
        db.run(
          `INSERT OR IGNORE INTO products (name, description, price, stock_quantity, category, sku) VALUES (?, ?, ?, ?, ?, ?)`,
          [product.name, product.description, product.price, product.stock, product.category, product.sku]
        );
      });
    });

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        reject(err);
      } else {
        console.log('Database initialized successfully');
        resolve();
      }
    });
  });
};

module.exports = { initDatabase, dbPath };
