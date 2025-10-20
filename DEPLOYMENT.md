# Deployment Guide

## Render.com Deployment

### Build Configuration

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

### How it Works

1. **npm install** (root level):
   - Installs backend dependencies (`cd backend && npm install`)
   - Installs frontend dependencies (`cd frontend && npm install`)
   - Builds the React frontend (`cd frontend && npm run build`)
   - Creates optimized production build in `frontend/build/`

2. **npm start** (root level):
   - Starts the backend server (`cd backend && npm start`)
   - Server serves the built React app from `frontend/build/` in production mode

### Environment Variables Required

Set these in your Render dashboard:

```
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url (if using PostgreSQL)
FRONTEND_URL=https://your-app.onrender.com
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
EMAIL_FROM=noreply@yourhotel.com
```

### Database

The app uses SQLite by default for development. For production on Render:
- Either use SQLite (stored in ephemeral disk, will reset on redeploy)
- Or configure PostgreSQL using the `DATABASE_URL` environment variable

### Troubleshooting

**Frontend not loading (404 errors):**
- Ensure `NODE_ENV=production` is set in environment variables
- Check that the build completed successfully in deployment logs
- Verify `frontend/build/` directory was created

**Database errors on startup:**
- Normal to see warnings on first deployment
- Tables will be created automatically on first sync
- Subsequent deployments should not show these errors

**Port binding:**
- Render automatically detects port 3001
- No configuration needed
