# Render Deployment Guide

## Backend (Django) - Deploy on Render

### 1. Create New Web Service on Render
- Go to https://render.com/
- Click "New +" → "Web Service"
- Connect your GitHub repository: `https://github.com/abhayShyam004/Mattter`

### 2. Configure Web Service

**Basic Settings:**
- **Name**: `mattter-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `mattter_backend`
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn mattter_backend.wsgi:application`

**Environment Variables** (Add these in Render dashboard):
```
SECRET_KEY=<generate-a-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=.onrender.com,mattter-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
PYTHON_VERSION=3.11.0
```

### 3. Add Database (PostgreSQL)
- In Render dashboard, create new PostgreSQL database
- Copy the **Internal Database URL**
- Add to environment variables:
```
DATABASE_URL=<your-postgres-url>
```

### 4. Deploy
- Click "Create Web Service"
- Wait for build to complete (~5 minutes)
- Your backend will be at: `https://mattter-backend.onrender.com`

---

## Frontend (React/Vite) - Deploy on Vercel/Netlify

### Option 1: Vercel (Recommended for React)

1. **Go to https://vercel.com/**
2. **Import your repository**
3. **Configure:**
   - **Framework Preset**: Vite
   - **Root Directory**: `mattter-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://mattter-backend.onrender.com
   VITE_APP_ENV=production
   ```

5. **Deploy** - Your frontend will be at: `https://your-app.vercel.app`

### Option 2: Netlify

1. **Go to https://netlify.com/**
2. **New site from Git**
3. **Configure:**
   - **Base directory**: `mattter-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `mattter-frontend/dist`

4. **Environment Variables:** (same as Vercel)

5. **Deploy**

---

## Post-Deployment

### Update CORS Settings
After deploying frontend, update backend environment variables:
```
CORS_ALLOWED_ORIGINS=https://your-actual-frontend-url.vercel.app
ALLOWED_HOSTS=.onrender.com,mattter-backend.onrender.com
```

### Test Your Deployment
1. Visit your frontend URL
2. Try registering a new user
3. Test login
4. Check if catalyst search works

---

## Important Notes

**Backend (Render):**
- ✅ Free tier available (spins down after inactivity)
- ✅ Automatically uses PostgreSQL (not SQLite)
- ✅ HTTPS enabled by default
- ⚠️ First request after inactivity may be slow (cold start)

**Frontend (Vercel/Netlify):**
- ✅ Free tier with excellent performance
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on push

**Cost:** Both can run on free tier for development/portfolio projects!

---

## Troubleshooting

**502 Bad Gateway on Backend:**
- Check Render logs
- Verify environment variables are set
- Ensure build.sh has execute permissions

**CORS Errors:**
- Double-check CORS_ALLOWED_ORIGINS includes your frontend URL
- Make sure there's no trailing slash

**Static Files Not Loading:**
- Run `python manage.py collectstatic` (handled by build.sh)
- Check STATIC_ROOT setting

**Database Connection Issues:**
- Verify DATABASE_URL is set correctly
- Check if PostgreSQL database is active
