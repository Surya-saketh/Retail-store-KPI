const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // frontend origin
}));

app.get('/api/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.WEATHER_API_KEY,
      },
    });

    const weather = weatherRes.data;
    const condition = weather.weather[0].main.toLowerCase();

    let recommendedProducts = [];

    if (condition.includes('rain')) {
      recommendedProducts = ['Umbrella', 'Raincoat', 'Waterproof Boots'];
    } else if (condition.includes('clear')) {
      recommendedProducts = ['Sunglasses', 'Sunscreen', 'Hat'];
    } else if (condition.includes('snow')) {
      recommendedProducts = ['Winter Coat', 'Gloves', 'Snow Boots'];
    } else {
      recommendedProducts = ['Regular Store Products'];
    }

    res.json({
      location: weather.name,
      temperature: weather.main.temp,
      weather: weather.weather[0].description,
      recommendedProducts,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
