# Deployment Guide for Luxe Fashion Admin Panel

## Environment Variables Required for Production

### Backend Environment Variables (Vercel/Railway/Heroku)
```
NODE_ENV=production
PORT=8000
MONGODB_URL=mongodb+srv://9twoofficialinfo:921992official@cluster0.vsvcn5v.mongodb.net/
JWT_SECRET=EWQS25554cfdXHWSJW4Y53
ADMIN_EMAIL=admin_9twoofficialinfo
ADMIN_PASSWORD=admin921992
CLOUDINARY_NAME=dmshuinfy
CLOUDINARY_API_KEY=472982754298385
CLOUDINARY_API_SECRET=6O0RE8O90Wiv73wNFulX1bBsgBg
RAZORPAY_KEY_SECRET=EnpCsLawLysRosi5IJLD85zB
RAZORPAY_KEY_ID=rzp_test_UsfwrJoVk1Af10
```

### Frontend Environment Variables (Vercel)
```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
VITE_FIREBASE_API_KEY=AIzaSyAZpwsi4FTk1JRapyOk9EAkq6ooZ5WROgk
VITE_FIREBASE_AUTH_DOMAIN=loginluxefashion.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=loginluxefashion
VITE_FIREBASE_STORAGE_BUCKET=loginluxefashion.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=269632583286
VITE_FIREBASE_APP_ID=1:269632583286:web:b73be2b6d2c28b7ca39157
```

## Deployment Steps

### 1. Backend Deployment (Vercel)

1. **Create vercel.json in backend folder:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Deploy backend:**
```bash
cd Luxe/backend
vercel --prod
```

3. **Set environment variables in Vercel dashboard**

### 2. Frontend Deployment (Vercel)

1. **Update API base URL in frontend:**
   - Set `VITE_API_BASE_URL` to your backend Vercel URL

2. **Deploy frontend:**
```bash
cd Luxe/luxe_fashion
vercel --prod
```

## Troubleshooting Common Issues

### 1. "User does not have token" Error
- **Cause**: Cookie not being sent/received properly
- **Solution**: Ensure `sameSite: 'None'` and `secure: true` in production

### 2. CORS Errors
- **Cause**: Frontend domain not allowed in backend CORS
- **Solution**: Add your frontend domain to CORS origins

### 3. Environment Variables Not Working
- **Cause**: Variables not set in production environment
- **Solution**: Set all required variables in Vercel dashboard

### 4. Admin Login Fails in Production
- **Cause**: Environment variables not properly configured
- **Solution**: Check Vercel environment variables match exactly

## Testing Production Deployment

1. **Test admin login:**
   - Go to `https://your-frontend-domain.vercel.app/admin`
   - Login with: `admin_9twoofficialinfo` / `admin921992`

2. **Test product addition:**
   - Add a test product
   - Check if it appears in collections

3. **Check browser console:**
   - Look for any CORS or authentication errors
   - Verify API calls are going to correct backend URL

## Quick Fix Commands

If deployment fails, run these commands:

```bash
# Backend
cd Luxe/backend
npm install
vercel --prod

# Frontend  
cd Luxe/luxe_fashion
npm install
npm run build
vercel --prod
```
