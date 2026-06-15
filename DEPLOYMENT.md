# Deployment Instructions

## Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com`
3. Deploy

## Render (Backend)
1. Connect GitHub repo to Render
2. Add environment variables:
   - `JWT_SECRET`
   - `MONGO_URI`
   - `GROK_API_KEY`
   - `FRONTEND_URL` = `https://your-app.vercel.app`
3. Deploy

## Important
- Update `.env.production` with your Render backend URL
- Update Render `FRONTEND_URL` with your Vercel URL
