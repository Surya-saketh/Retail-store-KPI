const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const billingRoutes = require('./routes/billing');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Vercel deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rule-based product recommendation system
const getProductRecommendations = (currentWeather, forecast) => {
  const condition = currentWeather.weather[0].main.toLowerCase();
  const temp = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  
  let immediate = [];
  let upcoming = [];
  let seasonal = [];
  
  // Current weather recommendations
  if (condition.includes('rain') || condition.includes('drizzle')) {
    immediate = ['Umbrellas', 'Raincoats', 'Waterproof Boots', 'Rain Ponchos', 'Waterproof Bags'];
  } else if (condition.includes('snow')) {
    immediate = ['Winter Coats', 'Snow Boots', 'Gloves', 'Scarves', 'Hand Warmers', 'Ice Scrapers'];
  } else if (condition.includes('clear') && temp > 25) {
    immediate = ['Sunglasses', 'Sunscreen', 'Hats', 'Cold Beverages', 'Fans', 'Light Clothing'];
  } else if (temp < 10) {
    immediate = ['Warm Clothing', 'Hot Beverages', 'Heaters', 'Blankets'];
  } else if (humidity > 70) {
    immediate = ['Dehumidifiers', 'Anti-fungal Products', 'Moisture Absorbers'];
  } else {
    immediate = ['Seasonal Essentials', 'Daily Necessities'];
  }
  
  // Forecast-based upcoming recommendations
  const upcomingConditions = forecast.list.slice(0, 8).map(item => item.weather[0].main.toLowerCase());
  const avgTemp = forecast.list.slice(0, 8).reduce((sum, item) => sum + item.main.temp, 0) / 8;
  
  if (upcomingConditions.some(cond => cond.includes('rain'))) {
    upcoming = ['Stock up on Rain Gear', 'Waterproof Electronics', 'Indoor Entertainment'];
  } else if (upcomingConditions.some(cond => cond.includes('snow'))) {
    upcoming = ['Winter Emergency Kits', 'Snow Removal Tools', 'Warm Food Items'];
  } else if (avgTemp > 25) {
    upcoming = ['Summer Essentials', 'Cooling Products', 'Outdoor Gear'];
  }
  
  // Seasonal recommendations based on month
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) { // Spring
    seasonal = ['Gardening Supplies', 'Spring Cleaning Products', 'Allergy Medications'];
  } else if (month >= 5 && month <= 7) { // Summer
    seasonal = ['Beach Accessories', 'BBQ Supplies', 'Air Conditioners'];
  } else if (month >= 8 && month <= 10) { // Fall
    seasonal = ['Back-to-School Items', 'Warm Clothing', 'Halloween Decorations'];
  } else { // Winter
    seasonal = ['Holiday Decorations', 'Winter Sports Gear', 'Warm Beverages'];
  }
  
  return { immediate, upcoming, seasonal };
};

// Generate business insights
const generateInsights = (currentWeather, forecast) => {
  const condition = currentWeather.weather[0].main.toLowerCase();
  const temp = currentWeather.main.temp;
  
  let weather_trend = '';
  let business_impact = '';
  let inventory_suggestions = [];
  
  // Analyze weather trend
  const temps = forecast.list.slice(0, 8).map(item => item.main.temp);
  const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
  
  if (avgTemp > temp + 3) {
    weather_trend = 'Temperature rising - warmer days ahead';
    inventory_suggestions.push('Increase cooling products stock');
  } else if (avgTemp < temp - 3) {
    weather_trend = 'Temperature dropping - cooler weather expected';
    inventory_suggestions.push('Prepare winter/warm clothing inventory');
  } else {
    weather_trend = 'Stable weather conditions expected';
  }
  
  // Business impact analysis
  if (condition.includes('rain')) {
    business_impact = 'Rainy weather may reduce foot traffic but increase indoor product sales';
    inventory_suggestions.push('Promote home entertainment and comfort items');
  } else if (condition.includes('clear') && temp > 20) {
    business_impact = 'Good weather likely to increase foot traffic and outdoor product sales';
    inventory_suggestions.push('Feature outdoor and recreational products prominently');
  } else if (temp < 5) {
    business_impact = 'Cold weather may reduce overall traffic but increase essential item sales';
    inventory_suggestions.push('Focus on warm clothing and hot beverages');
  }
  
  return { weather_trend, business_impact, inventory_suggestions };
};

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

    // Process forecast data (next 5 days, one per day)
    const dailyForecast = [];
    const processedDates = new Set();
    
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      if (!processedDates.has(dateStr) && dailyForecast.length < 5) {
        processedDates.add(dateStr);
        dailyForecast.push({
          date: date.toLocaleDateString(),
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          wind_speed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
          precipitation_chance: Math.round((item.pop || 0) * 100)
        });
      }
    });

    // Generate rule-based recommendations
    const recommendedProducts = getProductRecommendations(weather, forecast);
    const insights = generateInsights(weather, forecast);

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/billing', billingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Retail KPI Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Retail KPI API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      location: '/api/location',
      auth: '/api/auth',
      products: '/api/products',
      billing: '/api/billing'
    }
  });
});

module.exports = app;
