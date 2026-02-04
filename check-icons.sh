#!/bin/bash

echo "🎨 StudentNest - Logo & Icon Setup Helper"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current directory
if [ ! -d "StudentNestApp" ] || [ ! -d "Website" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📁 Checking icon files..."
echo ""

# Check Mobile App Icons
echo "📱 Mobile App Icons (StudentNestApp/assets/):"
if [ -f "StudentNestApp/assets/icon.png" ]; then
    echo -e "  ${GREEN}✓${NC} icon.png exists"
else
    echo -e "  ${RED}✗${NC} icon.png missing"
fi

if [ -f "StudentNestApp/assets/adaptive-icon.png" ]; then
    echo -e "  ${GREEN}✓${NC} adaptive-icon.png exists"
else
    echo -e "  ${RED}✗${NC} adaptive-icon.png missing"
fi

if [ -f "StudentNestApp/assets/splash-icon.png" ]; then
    echo -e "  ${GREEN}✓${NC} splash-icon.png exists"
else
    echo -e "  ${RED}✗${NC} splash-icon.png missing"
fi

echo ""
echo "🌐 Website Icons:"
if [ -f "Website/public/favicon.svg" ] || [ -f "Website/src/app/favicon.ico" ]; then
    echo -e "  ${GREEN}✓${NC} Favicon exists"
else
    echo -e "  ${YELLOW}⚠${NC}  Favicon might be missing"
fi

echo ""
echo "────────────────────────────────────────"
echo ""
echo "📝 To change your logo/icon:"
echo ""
echo "1. Create your logo (1024x1024 pixels, PNG format)"
echo "   Use: Canva, Figma, or online tools like icon.kitchen"
echo ""
echo "2. Replace Mobile App icons:"
echo "   cp your-logo.png StudentNestApp/assets/icon.png"
echo "   cp your-logo.png StudentNestApp/assets/adaptive-icon.png"
echo "   cp your-logo.png StudentNestApp/assets/splash-icon.png"
echo ""
echo "3. Replace Website favicon:"
echo "   cp your-favicon.svg Website/public/favicon.svg"
echo "   # or"
echo "   cp your-favicon.ico Website/src/app/favicon.ico"
echo ""
echo "4. Clear caches and restart:"
echo "   cd StudentNestApp && npx expo start -c"
echo "   cd ../Website && npm run dev"
echo ""
echo "────────────────────────────────────────"
echo ""
echo "🔗 Helpful Tools:"
echo "  • Icon Generator: https://icon.kitchen/"
echo "  • Favicon Generator: https://realfavicongenerator.net/"
echo "  • Logo Maker: https://canva.com/"
echo "  • Image Resizer: https://iloveimg.com/resize-image"
echo ""
echo "📚 Full Guide: See LOGO_CHANGE_GUIDE.md"
echo ""
