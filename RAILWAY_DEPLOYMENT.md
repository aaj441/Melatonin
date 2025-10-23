# Railway Deployment Guide

## Issues Fixed

This project had several issues preventing successful Railway deployment:

### 1. Missing Railway Configuration
- ✅ Added `railway.toml` configuration file
- ✅ Added proper `Dockerfile` in root directory
- ✅ Added `.dockerignore` for optimized builds

### 2. Docker Configuration Issues
- ✅ Fixed incomplete Dockerfile with proper build steps
- ✅ Added source code copying and dependency installation
- ✅ Added proper port exposure and startup command

### 3. Port Configuration
- ✅ Updated Vinxi config to use `process.env.PORT`
- ✅ Added startup script to handle port configuration
- ✅ Set default port fallback to 3000

### 4. Database Setup
- ✅ Added database migration step in startup script
- ✅ Created environment variable template

## Deployment Steps

### 1. Set up Railway Project
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `Dockerfile` and `railway.toml`

### 2. Configure Environment Variables
Set these environment variables in Railway dashboard:

**Required:**
- `NODE_ENV=production`
- `DATABASE_URL` (Railway will provide this when you add PostgreSQL)
- `ADMIN_PASSWORD` (set a secure password)
- `JWT_SECRET` (generate a secure random string)
- `OPENROUTER_API_KEY` (your OpenRouter API key)

**Optional:**
- `OPENAI_API_KEY` (if using OpenAI services)
- `STRIPE_SECRET_KEY` (if using payments)
- `STRIPE_PUBLISHABLE_KEY` (if using payments)
- `STRIPE_WEBHOOK_SECRET` (if using payments)

### 3. Add PostgreSQL Database
1. In Railway dashboard, add a PostgreSQL service
2. Railway will automatically set the `DATABASE_URL` environment variable
3. The startup script will run migrations automatically

### 4. Deploy
1. Railway will automatically build and deploy when you push to your main branch
2. The application will be available at the provided Railway URL

## File Changes Made

### New Files:
- `Dockerfile` - Complete Docker configuration for Railway
- `railway.toml` - Railway-specific configuration
- `.dockerignore` - Optimize Docker builds
- `.env.example` - Environment variable template
- `start.sh` - Startup script with database migrations
- `RAILWAY_DEPLOYMENT.md` - This guide

### Modified Files:
- `app.config.ts` - Added PORT environment variable support

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all environment variables are set
2. **Database Connection**: Ensure `DATABASE_URL` is properly set
3. **Port Issues**: Verify the application starts on the correct port
4. **Memory Issues**: Railway has memory limits, ensure your app is optimized

### Debug Commands:
```bash
# Check logs in Railway dashboard
# Or run locally with Railway CLI
railway logs
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to "production" |
| `DATABASE_URL` | Yes | PostgreSQL connection string (provided by Railway) |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `OPENROUTER_API_KEY` | Yes | API key for OpenRouter |
| `OPENAI_API_KEY` | No | API key for OpenAI (optional) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (optional) |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (optional) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret (optional) |