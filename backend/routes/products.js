const express = require('express');
const database = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all products with optional search and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 50, category } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = await database.all(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    let countParams = [];

    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = await database.get(countSql, countParams);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product autocomplete suggestions
router.get('/autocomplete', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.json({ suggestions: [] });
    }

    const products = await database.all(
      'SELECT id, name, price, stock_quantity FROM products WHERE name LIKE ? ORDER BY name ASC LIMIT 10',
      [`%${q}%`]
    );

    res.json({
      suggestions: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock_quantity
      }))
    });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product (managers only)
router.post('/', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category, sku } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await database.get('SELECT id FROM products WHERE sku = ?', [sku]);
      if (existingProduct) {
        return res.status(409).json({ error: 'SKU already exists' });
      }
    }

    const result = await database.run(
      'INSERT INTO products (name, description, price, stock_quantity, category, sku) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price, stock_quantity || 0, category || null, sku || null]
    );

    const newProduct = await database.get('SELECT * FROM products WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (managers only)
router.put('/:id', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category, sku } = req.body;

    // Check if product exists
    const existingProduct = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const duplicateSku = await database.get('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
      if (duplicateSku) {
        return res.status(409).json({ error: 'SKU already exists' });
      }
    }

    await database.run(
      `UPDATE products SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock_quantity = COALESCE(?, stock_quantity),
        category = COALESCE(?, category),
        sku = COALESCE(?, sku),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, description, price, stock_quantity, category, sku, id]
    );

    const updatedProduct = await database.get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (managers only)
router.delete('/:id', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is used in any bills
    const billItems = await database.get('SELECT COUNT(*) as count FROM bill_items WHERE product_id = ?', [id]);
    if (billItems.count > 0) {
      return res.status(409).json({ error: 'Cannot delete product that has been used in bills' });
    }

    await database.run('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product categories
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await database.all(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC'
    );

    res.json({
      categories: categories.map(row => row.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
