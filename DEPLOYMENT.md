# Retail KPI Dashboard - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended for Frontend)
1. **Frontend Only**: Deploy the React app to Netlify
2. **Backend**: Deploy to Railway, Render, or Heroku

### Option 2: Full Stack Deploy
1. **Vercel**: For both frontend and serverless backend
2. **Railway**: For full stack with database

## 📋 Pre-deployment Checklist

### Frontend (React + TypeScript)
- ✅ All files converted to .tsx
- ✅ TypeScript configuration ready
- ✅ Build command: `npm run build`
- ✅ Netlify.toml configuration created

### Backend (Node.js + Express)
- ✅ Express server with CORS
- ✅ OpenWeatherMap API integration
- ✅ Environment variables needed: `WEATHER_API_KEY`

## 🌐 Environment Variables

### Backend (.env)
```
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
```

### Frontend (for production)
Update API URLs from `localhost:5000` to your deployed backend URL.

## 📱 Features Included
- Dark theme dashboard
- Location intelligence with weather API
- Interactive charts (sales trend + top products)
- TypeScript support
- Responsive design

## 🔧 Build Commands
- **Frontend**: `npm run build`
- **Backend**: `npm start`

## 📞 Support
Check the GitHub repository for issues and updates.
