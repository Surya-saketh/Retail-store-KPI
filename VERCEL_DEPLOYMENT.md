# 🚀 Deploy to Vercel - Step by Step Guide

## Method 1: Deploy via Vercel Website (Recommended)

### 1. **Go to Vercel**
- Visit [vercel.com](https://vercel.com)
- Sign up/Login with your GitHub account

### 2. **Import Your Project**
- Click "New Project"
- Select "Import Git Repository"
- Choose your `Retail-store-KPI` repository
- Select the `frontend` folder as the root directory

### 3. **Configure Build Settings**
Vercel should auto-detect these settings, but verify:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. **Deploy**
- Click "Deploy"
- Wait for build to complete (2-3 minutes)
- Get your live URL!

## Method 2: Deploy via Vercel CLI

### 1. **Install Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Login to Vercel**
```bash
vercel login
```

### 3. **Deploy from Frontend Directory**
```bash
cd frontend
vercel --prod
```

## 🔧 Configuration Files Created

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `netlify.toml` - Alternative Netlify config
- ✅ TypeScript support ready
- ✅ React Router SPA routing configured

## 🌐 Environment Variables (Optional)

If you want to deploy the backend later:
- `WEATHER_API_KEY` - Your OpenWeatherMap API key
- `REACT_APP_API_URL` - Backend API URL (when deployed)

## 📱 What Will Be Deployed

Your live site will include:
- 📊 **Dashboard** with dark theme
- 📈 **Interactive Charts** (sales trend + top products bar chart)
- 📍 **Location Intelligence** (frontend only - backend needs separate deployment)
- 🎨 **Responsive Design** with TypeScript support

## 🔗 Expected Result

After deployment, you'll get:
- **Live URL**: `https://your-project-name.vercel.app`
- **Automatic HTTPS**
- **Global CDN**
- **Automatic deployments** on Git push

## ⚠️ Note About Location Feature

The location intelligence feature requires the backend API. For full functionality:
1. Deploy frontend to Vercel (this guide)
2. Deploy backend to Railway/Render/Heroku
3. Update API URLs in frontend code

## 🎉 Ready to Deploy!

Your project is configured and ready for Vercel deployment!
