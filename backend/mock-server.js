const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // frontend origins
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
let users = [
  { id: 1, username: 'admin', email: 'admin@retailkpi.com', password: 'admin123', role: 'manager' },
  { id: 2, username: 'cashier1', email: 'cashier1@retailkpi.com', password: 'cashier123', role: 'user' },
  { id: 3, username: 'manager1', email: 'manager1@retailkpi.com', password: 'manager123', role: 'manager' }
];

let products = [
  { id: 1, name: 'Soap Bar', description: 'Premium soap bar', price: 2.50, stock_quantity: 100, category: 'Personal Care', sku: 'SOAP001' },
  { id: 2, name: 'Soft Drink', description: 'Carbonated soft drink', price: 1.25, stock_quantity: 200, category: 'Beverages', sku: 'DRINK001' },
  { id: 3, name: 'Soda Water', description: 'Sparkling water', price: 1.00, stock_quantity: 150, category: 'Beverages', sku: 'SODA001' },
  { id: 4, name: 'Socks', description: 'Cotton socks', price: 5.00, stock_quantity: 80, category: 'Clothing', sku: 'SOCK001' },
  { id: 5, name: 'Sunglasses', description: 'UV protection sunglasses', price: 15.00, stock_quantity: 50, category: 'Accessories', sku: 'SUN001' },
  { id: 6, name: 'Shampoo', description: 'Hair shampoo 250ml', price: 8.50, stock_quantity: 75, category: 'Personal Care', sku: 'SHAM001' },
  { id: 7, name: 'Sandwich', description: 'Fresh sandwich', price: 4.50, stock_quantity: 30, category: 'Food', sku: 'SAND001' },
  { id: 8, name: 'Milk', description: 'Fresh milk 1L', price: 3.20, stock_quantity: 120, category: 'Dairy', sku: 'MILK001' },
  { id: 9, name: 'Bread', description: 'White bread loaf', price: 2.80, stock_quantity: 90, category: 'Bakery', sku: 'BREAD001' },
  { id: 10, name: 'Butter', description: 'Salted butter 200g', price: 4.00, stock_quantity: 60, category: 'Dairy', sku: 'BUTT001' }
];

let bills = [];
let billCounter = 1;

// Simple token generation (for demo only)
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
};

const verifyToken = (token) => {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
};

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Retail KPI Mock Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Products endpoints
app.get('/api/products', authenticateToken, (req, res) => {
  const { search, category, page = 1, limit = 50 } = req.query;
  
  let filteredProducts = [...products];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  }
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit)
    }
  });
});

app.get('/api/products/autocomplete', authenticateToken, (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 1) {
    return res.json({ suggestions: [] });
  }
  
  const suggestions = products
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock_quantity
    }));
  
  res.json({ suggestions });
});

app.get('/api/products/meta/categories', authenticateToken, (req, res) => {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json({ categories });
});

app.post('/api/products', authenticateToken, requireRole('manager'), (req, res) => {
  const { name, description, price, stock_quantity = 0, category, sku } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  
  if (sku && products.find(p => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  
  const newProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    name,
    description: description || '',
    price: parseFloat(price),
    stock_quantity: parseInt(stock_quantity),
    category: category || '',
    sku: sku || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
});

app.put('/api/products/:id', authenticateToken, requireRole('manager'), (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const { name, description, price, stock_quantity, category, sku } = req.body;
  
  if (sku && sku !== products[productIndex].sku && products.find(p => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(stock_quantity !== undefined && { stock_quantity: parseInt(stock_quantity) }),
    ...(category !== undefined && { category }),
    ...(sku !== undefined && { sku }),
    updated_at: new Date().toISOString()
  };
  
  res.json({
    message: 'Product updated successfully',
    product: products[productIndex]
  });
});

app.delete('/api/products/:id', authenticateToken, requireRole('manager'), (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Billing endpoints
app.get('/api/billing', authenticateToken, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  let userBills = bills;
  if (req.user.role !== 'manager') {
    userBills = bills.filter(b => b.user_id === req.user.id);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedBills = userBills.slice(startIndex, endIndex);
  
  res.json({
    bills: paginatedBills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userBills.length,
      totalPages: Math.ceil(userBills.length / limit)
    }
  });
});

app.post('/api/billing', authenticateToken, (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required and cannot be empty' });
  }
  
  let totalAmount = 0;
  const billItems = [];
  
  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
    }
    
    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` 
      });
    }
    
    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;
    
    billItems.push({
      id: billItems.length + 1,
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price,
      total_price: itemTotal
    });
    
    // Update stock
    product.stock_quantity -= item.quantity;
  }
  
  const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  const newBill = {
    id: billCounter++,
    bill_number: billNumber,
    user_id: req.user.id,
    username: req.user.username,
    total_amount: totalAmount,
    status: 'pending',
    items: billItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  bills.push(newBill);
  
  res.status(201).json({
    message: 'Bill created successfully',
    bill: newBill
  });
});

// Weather API (existing functionality)
app.get('/api/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    // Get current weather
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.WEATHER_API_KEY,
      },
    });

    // Get 5-day forecast
    const forecastRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.WEATHER_API_KEY,
      },
    });

    const weather = weatherRes.data;
    const forecast = forecastRes.data;

    // Process forecast data (simplified)
    const dailyForecast = forecast.list.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
      temp_min: Math.round(item.main.temp_min),
      temp_max: Math.round(item.main.temp_max),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      wind_speed: Math.round(item.wind.speed * 3.6),
      precipitation_chance: Math.round((item.pop || 0) * 100)
    }));

    // Simplified recommendations
    const recommendedProducts = {
      immediate: ['Seasonal Items', 'Daily Essentials'],
      upcoming: ['Weather Appropriate Gear'],
      seasonal: ['Current Season Items']
    };

    const insights = {
      weather_trend: 'Weather data available',
      business_impact: 'Monitor weather patterns for inventory planning',
      inventory_suggestions: ['Stock weather-appropriate items']
    };

    res.json({
      location: weather.name,
      country: weather.sys.country,
      temperature: Math.round(weather.main.temp),
      weather: weather.weather[0].main,
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      wind_speed: Math.round(weather.wind.speed * 3.6),
      forecast: dailyForecast,
      recommendedProducts,
      insights
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Retail KPI Mock Server running on port ${PORT}`);
  console.log(`📊 Weather API: http://localhost:${PORT}/api/location`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`💰 Billing: http://localhost:${PORT}/api/billing`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n🎯 Demo Credentials:`);
  console.log(`Manager: admin / admin123`);
  console.log(`Cashier: cashier1 / cashier123`);
});
