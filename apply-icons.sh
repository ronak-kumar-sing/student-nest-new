#!/bin/bash

echo "🎨 Applying New StudentNest Icons"
echo "================================="
echo ""

# Clear Mobile App Cache
echo "📱 Clearing mobile app cache..."
cd /Users/ronakkumar/Desktop/student-nest-Infotsav/StudentNestApp
rm -rf .expo
echo "✅ Mobile app cache cleared"

# Clear Website Cache
echo "🌐 Clearing website cache..."
cd /Users/ronakkumar/Desktop/student-nest-Infotsav/Website
rm -rf .next
echo "✅ Website cache cleared"

echo ""
echo "✨ Icons successfully applied!"
echo ""
echo "📋 What was updated:"
echo "  ✓ Mobile app icon (1024x1024)"
echo "  ✓ Android adaptive icon"
echo "  ✓ Splash screen icon"
echo "  ✓ Website favicon.ico"
echo "  ✓ Website PWA icons (192x192, 512x512)"
echo "  ✓ Apple touch icon"
echo "  ✓ manifest.json updated"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Restart mobile app:"
echo "   cd StudentNestApp"
echo "   npx expo start -c"
echo ""
echo "2. Restart website:"
echo "   cd Website"
echo "   npm run dev"
echo ""
echo "3. Test in browser (hard refresh: Cmd+Shift+R)"
echo ""
echo "4. Build production app:"
echo "   cd StudentNestApp"
echo "   eas build --platform android --profile preview"
echo ""
