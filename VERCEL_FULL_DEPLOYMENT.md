# 🚀 Complete Vercel Deployment Guide - Full Stack App

This guide will help you deploy your **entire Retail KPI application** (Frontend + Backend) to Vercel.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **OpenWeather API Key** - Get one from [openweathermap.org](https://openweathermap.org/api)

## 🏗️ Project Structure

Your app is now configured as a monorepo with:
- **Frontend**: React app in `/frontend` directory
- **Backend**: Express API as serverless functions in `/api` directory
- **Configuration**: Root `vercel.json` handles routing

## 📝 Step-by-Step Deployment

### Option 1: Deploy via Vercel Website (Recommended)

#### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

#### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select **root directory** (not frontend or backend subdirectory)

#### 3. Configure Build Settings

Vercel should auto-detect, but verify:
- **Framework Preset**: Other (or Create React App)
- **Root Directory**: `./` (leave as root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

#### 4. Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Description |
|------|-------|-------------|
| `WEATHER_API_KEY` | `your_api_key_here` | OpenWeather API key |
| `JWT_SECRET` | `your_secret_key_here` | JWT secret for auth |
| `NODE_ENV` | `production` | Environment |

⚠️ **Important**: Use strong, random values for `JWT_SECRET`

#### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Get your live URL: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Set Environment Variables

Create a `.env` file in the root (already gitignored):

```env
WEATHER_API_KEY=your_openweather_api_key
JWT_SECRET=your_strong_secret_key
NODE_ENV=production
```

#### 4. Deploy

```bash
# From the root directory
vercel

# For production deployment
vercel --prod
```

#### 5. Add Environment Variables via CLI

```bash
vercel env add WEATHER_API_KEY
vercel env add JWT_SECRET
```

## 🔧 Configuration Files Created

✅ **Root `vercel.json`** - Routes API and frontend requests  
✅ **`api/index.js`** - Serverless function entry point  
✅ **`backend/server-app.js`** - Express app without server start  
✅ **Frontend `vercel.json`** - SPA routing configuration

## 🌐 How It Works

### Request Routing

1. **API Requests** (`/api/*`) → Serverless function at `/api/index.js`
2. **Static Files** (`/static/*`, `.js`, `.css`) → Frontend build files
3. **All Other Routes** → `index.html` (React Router handles routing)

### Backend as Serverless Functions

- Each API request triggers the serverless function
- Database initializes on cold start
- SQLite database persists in `/tmp` (note: temporary storage)
- For persistent data, consider upgrading to PostgreSQL/MongoDB

## 📱 Available Endpoints

After deployment, your app will have:

### Frontend
- **Dashboard**: `https://your-app.vercel.app/`
- **Products**: `https://your-app.vercel.app/products`
- **Billing**: `https://your-app.vercel.app/billing`
- **Location**: `https://your-app.vercel.app/location`

### Backend API
- **Health Check**: `https://your-app.vercel.app/api/health`
- **Weather**: `https://your-app.vercel.app/api/location?lat=40.7128&lon=-74.0060`
- **Auth**: `https://your-app.vercel.app/api/auth/*`
- **Products**: `https://your-app.vercel.app/api/products`
- **Billing**: `https://your-app.vercel.app/api/billing`

## ⚠️ Important Notes

### Database Considerations

**SQLite on Vercel** has limitations:
- Files in `/tmp` are ephemeral (cleared on cold starts)
- Not suitable for production data persistence

**Recommended Solutions**:
1. **Vercel Postgres** - Built-in PostgreSQL database
2. **MongoDB Atlas** - Free tier available
3. **PlanetScale** - Serverless MySQL
4. **Supabase** - PostgreSQL with real-time features

### CORS Configuration

The backend is configured to accept requests from any origin (`origin: '*'`). For production, update `backend/server-app.js`:

```javascript
app.use(cors({
  origin: 'https://your-app.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
```

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Automatic deployments** on every push to `main`
- **Preview deployments** for pull requests
- **Instant rollbacks** if needed

## 🧪 Testing Your Deployment

### 1. Test Frontend
Visit: `https://your-app.vercel.app`

### 2. Test API Health
```bash
curl https://your-app.vercel.app/api/health
```

### 3. Test Weather API
```bash
curl "https://your-app.vercel.app/api/location?lat=40.7128&lon=-74.0060"
```

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Not Working
- Check environment variables are set
- Review function logs in Vercel dashboard
- Verify CORS settings

### Database Issues
- Remember: SQLite data is temporary on Vercel
- Consider migrating to a persistent database
- Check `/tmp` directory permissions

## 📊 Monitoring

Vercel provides:
- **Analytics** - Page views, performance metrics
- **Logs** - Function execution logs
- **Deployment History** - Track all deployments

## 🎉 Next Steps

1. ✅ Deploy to Vercel
2. 🔐 Set up custom domain (optional)
3. 📊 Configure analytics
4. 🗄️ Migrate to persistent database
5. 🔒 Implement rate limiting
6. 📧 Set up error monitoring (Sentry)

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Your Retail KPI app is ready for deployment! 🚀**
