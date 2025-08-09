#!/bin/bash

echo "🚀 Luxe Fashion Deployment Script"
echo "=================================="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "1. ✅ Environment variables configured in Vercel dashboard"
echo "2. ✅ Backend vercel.json created"
echo "3. ✅ CORS settings updated"
echo "4. ✅ Cookie settings fixed for production"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "🔧 Deploying Backend..."
echo "======================="
cd backend
echo "Installing dependencies..."
npm install

echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "🎨 Deploying Frontend..."
echo "========================"
cd ../luxe_fashion
echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Go to your frontend URL/admin"
echo "2. Login with: admin_9twoofficialinfo / admin921992"
echo "3. Check the authentication status indicator"
echo "4. Try adding a test product"
echo "5. Check browser console for any errors"
echo ""
echo "🔍 If issues persist:"
echo "1. Check Vercel function logs"
echo "2. Verify environment variables in Vercel dashboard"
echo "3. Check browser network tab for failed requests"
echo "4. Ensure CORS origins include your frontend domain"
echo ""
echo "📞 Need help? Check the DEPLOYMENT_GUIDE.md file"
