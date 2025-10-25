# 🚀 Quick Deploy to Vercel - 5 Minutes

## Step 1: Push to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Go to Vercel
👉 **[vercel.com/new](https://vercel.com/new)**

### Import Your Repository
1. Sign in with GitHub
2. Click "Import Project"
3. Select your repository: `Retail-store-KPI`
4. Click "Import"

### Configure (Auto-detected)
- **Root Directory**: `./` (keep as is)
- **Framework**: Other
- Everything else auto-detected ✅

### Add Environment Variables
Click "Environment Variables" and add:

```
WEATHER_API_KEY = your_openweather_api_key_here
JWT_SECRET = your_strong_random_secret_here
NODE_ENV = production
```

### Deploy!
Click **"Deploy"** button and wait ~2 minutes ⏱️

## Step 3: Test Your App

Your app will be live at: `https://your-project-name.vercel.app`

Test these URLs:
- **Frontend**: `https://your-app.vercel.app/`
- **API Health**: `https://your-app.vercel.app/api/health`
- **Weather**: `https://your-app.vercel.app/api/location?lat=40.7128&lon=-74.0060`

## ✅ Done!

Your full-stack Retail KPI app is now live! 🎉

---

**Need more details?** Read `VERCEL_FULL_DEPLOYMENT.md`  
**Troubleshooting?** Check `DEPLOYMENT_SUMMARY.md`
