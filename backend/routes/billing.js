const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all bills with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, user_id, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT b.*, u.username, u.email,
        (SELECT COUNT(*) FROM bill_items bi WHERE bi.bill_id = b.id) as item_count
      FROM bills b
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    // If user is not a manager, only show their own bills
    if (req.user.role !== 'manager') {
      sql += ' AND b.user_id = ?';
      params.push(req.user.id);
    } else if (user_id) {
      sql += ' AND b.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (date_from) {
      sql += ' AND DATE(b.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      sql += ' AND DATE(b.created_at) <= ?';
      params.push(date_to);
    }

    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const bills = await database.all(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM bills b WHERE 1=1';
    let countParams = [];

    if (req.user.role !== 'manager') {
      countSql += ' AND b.user_id = ?';
      countParams.push(req.user.id);
    } else if (user_id) {
      countSql += ' AND b.user_id = ?';
      countParams.push(user_id);
    }

    if (status) {
      countSql += ' AND b.status = ?';
      countParams.push(status);
    }

    if (date_from) {
      countSql += ' AND DATE(b.created_at) >= ?';
      countParams.push(date_from);
    }

    if (date_to) {
      countSql += ' AND DATE(b.created_at) <= ?';
      countParams.push(date_to);
    }

    const countResult = await database.get(countSql, countParams);

    res.json({
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get single bill with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get bill details
    const bill = await database.get(`
      SELECT b.*, u.username, u.email
      FROM bills b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Check if user can access this bill
    if (req.user.role !== 'manager' && bill.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get bill items
    const items = await database.all(`
      SELECT bi.*, p.name as product_name, p.description, p.sku
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bill_id = ?
      ORDER BY bi.id
    `, [id]);

    res.json({
      bill: {
        ...bill,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// Create new bill
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have valid product_id and quantity' });
      }

      // Get product details and check stock
      const product = await database.get('SELECT * FROM products WHERE id = ?', [product_id]);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${product_id} not found` });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${quantity}` 
        });
      }

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id,
        quantity,
        unit_price: product.price,
        total_price: itemTotal,
        product_name: product.name
      });
    }

    // Generate bill number
    const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create bill
    const billResult = await database.run(
      'INSERT INTO bills (bill_number, user_id, total_amount, status) VALUES (?, ?, ?, ?)',
      [billNumber, req.user.id, totalAmount.toFixed(2), 'pending']
    );

    const billId = billResult.id;

    // Add bill items and update stock
    for (const item of validatedItems) {
      // Add bill item
      await database.run(
        'INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [billId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );

      // Update product stock
      await database.run(
        'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Get the complete bill with items
    const completeBill = await database.get(`
      SELECT b.*, u.username, u.email
      FROM bills b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [billId]);

    const billItems = await database.all(`
      SELECT bi.*, p.name as product_name, p.description, p.sku
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bill_id = ?
    `, [billId]);

    res.status(201).json({
      message: 'Bill created successfully',
      bill: {
        ...completeBill,
        items: billItems
      }
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Update bill status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, completed, or cancelled' });
    }

    // Get bill details
    const bill = await database.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Check permissions
    if (req.user.role !== 'manager' && bill.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If cancelling a pending bill, restore stock
    if (status === 'cancelled' && bill.status === 'pending') {
      const billItems = await database.all('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
      
      for (const item of billItems) {
        await database.run(
          'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Update bill status
    await database.run(
      'UPDATE bills SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const updatedBill = await database.get(`
      SELECT b.*, u.username, u.email
      FROM bills b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);

    res.json({
      message: 'Bill status updated successfully',
      bill: updatedBill
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({ error: 'Failed to update bill status' });
  }
});

// Get billing statistics (managers only)
router.get('/stats/summary', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = '';
    let params = [];

    if (date_from && date_to) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [date_from, date_to];
    } else if (date_from) {
      dateFilter = 'WHERE DATE(created_at) >= ?';
      params = [date_from];
    } else if (date_to) {
      dateFilter = 'WHERE DATE(created_at) <= ?';
      params = [date_to];
    }

    // Get overall stats
    const totalBills = await database.get(`SELECT COUNT(*) as count FROM bills ${dateFilter}`, params);
    const totalRevenue = await database.get(`SELECT SUM(total_amount) as total FROM bills ${dateFilter} AND status = 'completed'`, params);
    const pendingBills = await database.get(`SELECT COUNT(*) as count FROM bills ${dateFilter} AND status = 'pending'`, params);
    const completedBills = await database.get(`SELECT COUNT(*) as count FROM bills ${dateFilter} AND status = 'completed'`, params);

    // Get top products
    const topProducts = await database.all(`
      SELECT p.name, SUM(bi.quantity) as total_quantity, SUM(bi.total_price) as total_revenue
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      JOIN bills b ON bi.bill_id = b.id
      ${dateFilter.replace('WHERE', 'WHERE b.status = "completed" AND')}
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `, params);

    // Get daily sales (last 7 days if no date filter)
    let dailySalesParams = params;
    let dailySalesFilter = dateFilter;
    
    if (!date_from && !date_to) {
      dailySalesFilter = 'WHERE DATE(created_at) >= DATE("now", "-7 days")';
      dailySalesParams = [];
    }

    const dailySales = await database.all(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as bill_count,
             SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as revenue
      FROM bills 
      ${dailySalesFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, dailySalesParams);

    res.json({
      summary: {
        total_bills: totalBills.count,
        total_revenue: totalRevenue.total || 0,
        pending_bills: pendingBills.count,
        completed_bills: completedBills.count
      },
      top_products: topProducts,
      daily_sales: dailySales
    });
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({ error: 'Failed to fetch billing statistics' });
  }
});

module.exports = router;
