#!/bin/bash

echo "🚀 StudentNest App - Production Build Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed successfully"
else
    echo "✅ EAS CLI already installed: $(eas --version)"
fi

echo ""
echo "🔧 Setting up StudentNest App..."
cd StudentNestApp || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Login to Expo:"
echo "   eas login"
echo ""
echo "2. Build Android APK:"
echo "   eas build --platform android --profile preview"
echo ""
echo "3. Wait for build to complete (~10-15 minutes)"
echo ""
echo "4. Download and share the APK with users!"
echo ""
echo "📚 For more details, see PRODUCTION_DEPLOYMENT.md"
