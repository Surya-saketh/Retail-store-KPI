# ✅ Vercel Deployment Checklist

## Before Deployment

- [ ] Code is committed to Git
- [ ] Code is pushed to GitHub
- [ ] You have a Vercel account
- [ ] You have an OpenWeather API key

## Deployment Steps

### Quick Deploy (5 minutes)

1. [ ] Go to [vercel.com](https://vercel.com)
2. [ ] Click "Add New Project"
3. [ ] Import your GitHub repository
4. [ ] Keep root directory as `./`
5. [ ] Add environment variables:
   - [ ] `WEATHER_API_KEY` = your OpenWeather API key
   - [ ] `JWT_SECRET` = a strong random string
   - [ ] `NODE_ENV` = production
6. [ ] Click "Deploy"
7. [ ] Wait for build to complete
8. [ ] Test your live URL!

## After Deployment

- [ ] Test frontend: `https://your-app.vercel.app`
- [ ] Test API health: `https://your-app.vercel.app/api/health`
- [ ] Test weather endpoint: `https://your-app.vercel.app/api/location?lat=40.7128&lon=-74.0060`
- [ ] Verify all pages load correctly
- [ ] Check browser console for errors

## Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Migrate to persistent database (PostgreSQL/MongoDB)
- [ ] Add rate limiting
- [ ] Set up CI/CD tests

## Need Help?

📖 Read the full guide: `VERCEL_FULL_DEPLOYMENT.md`

---

**Estimated deployment time: 5-10 minutes** ⏱️
