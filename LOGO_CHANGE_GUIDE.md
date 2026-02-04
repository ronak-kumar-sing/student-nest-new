# 🎨 Logo & Icon Change Guide for StudentNest

## Current Icon Locations

### Mobile App Icons
Located in: `StudentNestApp/assets/`
- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash-icon.png` - Splash screen icon
- `favicon.png` - Web favicon

### Website Icons
Located in: `Website/public/` and `Website/src/app/`
- `favicon.svg` - Main favicon (SVG)
- `favicon.ico` - Browser tab icon
- `logo.png` - PNG logo (if exists)

---

## 📱 How to Change Mobile App Logo

### Option 1: Replace Existing Files

1. **Create your logo** with these specifications:
   - **Main Icon:** 1024x1024 pixels, PNG format
   - **Background:** Transparent or solid color
   - **Format:** PNG with no alpha transparency for best results

2. **Replace the files:**
   ```bash
   # Navigate to assets folder
   cd StudentNestApp/assets
   
   # Backup old icons
   mv icon.png icon-old.png
   mv adaptive-icon.png adaptive-icon-old.png
   
   # Add your new icon (name it icon.png)
   # Copy your logo file here and rename to icon.png
   ```

3. **For Android Adaptive Icon:**
   - Foreground: Your logo (should have padding)
   - Size: 1024x1024 pixels
   - Save as `adaptive-icon.png`

### Option 2: Use Online Icon Generator

1. **Visit:** https://www.appicon.co/ or https://icon.kitchen/
2. **Upload** your logo
3. **Download** generated icons
4. **Replace** files in `StudentNestApp/assets/`

---

## 🌐 How to Change Website Favicon

### Option 1: Simple Favicon Change

1. **Create a favicon:**
   - Size: 32x32 or 64x64 pixels
   - Format: ICO, PNG, or SVG

2. **Replace the favicon:**
   ```bash
   cd Website/public
   # or
   cd Website/src/app
   
   # Add your new favicon
   # Name it: favicon.ico or favicon.svg
   ```

### Option 2: Complete Icon Set

Use a favicon generator:
1. **Visit:** https://realfavicongenerator.net/
2. **Upload** your logo
3. **Download** all generated files
4. **Copy** to `Website/public/` or `Website/src/app/`

---

## 🎨 Quick Icon Creation Using AI/Design Tools

### Using Canva (Free)
1. Go to canva.com
2. Create custom size: 1024x1024
3. Design your logo
4. Download as PNG
5. Replace the icon files

### Using Figma (Free)
1. Create 1024x1024 frame
2. Design your logo
3. Export as PNG
4. Replace the icon files

### Using AI (DALL-E, Midjourney)
1. Generate logo with prompt: "Modern minimalist logo for student accommodation app, simple, clean, professional"
2. Download high resolution
3. Resize to 1024x1024
4. Replace the icon files

---

## 🔄 After Changing Icons

### For Mobile App
```bash
# Clear cache
cd StudentNestApp
rm -rf .expo

# Restart development server
npx expo start -c

# For production build
eas build --platform android --profile preview --clear-cache
```

### For Website
```bash
cd Website

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Or just restart dev server
npm run dev
```

---

## 📝 Recommended Icon Specifications

### Mobile App Icon
- **Size:** 1024x1024 pixels
- **Format:** PNG (24-bit)
- **Background:** Solid color or transparent
- **Corner Radius:** None (system applies it)
- **Safe Area:** Keep important elements 10% from edges

### Website Favicon
- **ICO:** 32x32, 48x48 (multi-resolution)
- **PNG:** 192x192, 512x512
- **SVG:** Scalable vector (recommended)
- **Format:** ICO, PNG, or SVG

### Splash Screen (App)
- **Size:** 1284x2778 pixels (iPhone 14 Pro Max)
- **Format:** PNG
- **Background:** Solid color matching your brand

---

## 🎯 Current Configuration

### Mobile App (app.json)
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#0A0A0B"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0B"
      }
    }
  }
}
```

### Website (layout.tsx)
```typescript
icons: {
  icon: [
    { url: '/favicon.svg', sizes: '32x32' },
    { url: '/logo.png', sizes: '192x192', type: 'image/png' }
  ],
  apple: { url: '/logo.png', type: 'image/png' },
  shortcut: '/favicon.ico',
}
```

---

## 🚀 Quick Start Commands

### If you have your logo ready:

```bash
# For Mobile App
cd StudentNestApp/assets
# Copy your logo here as icon.png (1024x1024)
# Copy as adaptive-icon.png for Android
# Copy as splash-icon.png for splash screen

# For Website
cd Website/public  # or Website/src/app
# Copy your favicon here as favicon.ico or favicon.svg
# Copy as logo.png (192x192) for PWA

# Restart everything
cd StudentNestApp && npx expo start -c
cd ../Website && npm run dev
```

---

## 🖼️ Example Logo Requirements

### StudentNest Logo Ideas:
- 🏠 House icon with graduation cap
- 📚 Books with a roof
- 🎓 Graduation cap with location pin
- 🏢 Building with student elements
- 🔑 Key with house shape

### Color Palette (Current):
- Primary: Orange (#F97316)
- Background: Dark (#0A0A0B)
- Text: White/Gray

---

## 📞 Need Help?

### Free Online Tools:
1. **Icon Generator:** https://icon.kitchen/
2. **Favicon Generator:** https://realfavicongenerator.net/
3. **Logo Maker:** https://www.canva.com/
4. **Image Resizer:** https://www.iloveimg.com/resize-image

### Design Services (Paid):
- Fiverr: $5-50 for logo design
- 99designs: Design contest
- Looka: AI-powered logo maker

---

## ✅ Checklist

- [ ] Create/obtain logo file (1024x1024 PNG)
- [ ] Replace `StudentNestApp/assets/icon.png`
- [ ] Replace `StudentNestApp/assets/adaptive-icon.png`
- [ ] Replace `StudentNestApp/assets/splash-icon.png`
- [ ] Replace `Website/public/favicon.svg` or `Website/src/app/favicon.ico`
- [ ] Create `Website/public/logo.png` (192x192)
- [ ] Clear caches
- [ ] Test on mobile app
- [ ] Test website in browser
- [ ] Rebuild for production

---

**Note:** I can't create or edit image files directly. Please use the tools and instructions above to create and replace your logo files. Once you have the files ready, simply replace them in the locations specified above!
