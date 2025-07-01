#!/bin/bash

# Neural ECM Repository GitHub Pages Deployment Script

echo "🚀 Deploying Neural ECM Explorer to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "src/web/package.json" ]; then
    echo "❌ Please run this script from the repository root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install dependencies
cd src/web
npm install

echo "🔨 Building the application..."

# Build the application
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

echo "🚀 Deploying to GitHub Pages..."

# Deploy to GitHub Pages
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application is now available at: https://3dbmandne-lab.github.io/Neural_ECM"
echo ""
echo "📝 Note: It may take a few minutes for the changes to appear on GitHub Pages." 