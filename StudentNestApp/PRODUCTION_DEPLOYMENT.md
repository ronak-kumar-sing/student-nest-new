# StudentNest App - Production Deployment Guide

## 🚀 Production Configuration

### ✅ Configuration Complete
All configuration files have been updated to use the production backend at:
**https://student-nest.live**

---

## 📱 Build & Deploy Instructions

### Prerequisites
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
```

### 1. Build for Android (APK for Testing)

```bash
cd StudentNestApp

# Build development APK (for testing)
eas build --platform android --profile preview

# Build production AAB (for Play Store)
eas build --platform android --profile production
```

**Note:** 
- `preview` profile creates an APK file you can directly install
- `production` profile creates an AAB file for Google Play Store

### 2. Build for iOS

```bash
# Build for iOS simulator (testing)
eas build --platform ios --profile preview

# Build for production (App Store)
eas build --platform ios --profile production
```

### 3. Get Download Link

After the build completes:
1. EAS will provide a download link in the terminal
2. Or visit: https://expo.dev/accounts/YOUR_ACCOUNT/projects/StudentNestApp/builds
3. Share the APK download link with users

---

## 🔄 Over-The-Air (OTA) Updates

For minor updates without rebuilding:

```bash
# Publish update to production
eas update --branch production --message "Your update message"

# Publish update to preview
eas update --branch preview --message "Your update message"
```

---

## 📦 Current Build Configuration

### Environment Variables
- **API URL:** `https://student-nest.live/api`
- **Environment:** Production
- **Analytics:** Enabled
- **Crash Reporting:** Enabled

### App Details
- **Name:** StudentNest
- **Bundle ID (iOS):** com.studentnest.app
- **Package (Android):** com.studentnest.app
- **Version:** 1.0.0
- **Build Number/Version Code:** 1

### Deep Linking
- **Scheme:** studentnest://
- **Domain:** student-nest.live

---

## 🛠 Building Locally

### For Android APK (Quick Testing)

```bash
cd StudentNestApp

# Install dependencies
npm install

# Build APK locally
npx expo run:android --variant release
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

### For iOS

```bash
# Install dependencies
npm install

# Build iOS app
npx expo run:ios --configuration Release
```

---

## 📝 Pre-Deployment Checklist

### ✅ Completed
- [x] Updated API URL to production backend
- [x] Configured environment variables
- [x] Set up deep linking for student-nest.live
- [x] Configured app permissions (Location, Camera, Storage)
- [x] Set up EAS project configuration
- [x] Enabled OTA updates
- [x] Set proper app metadata (name, bundle ID, version)

### 🔧 Before Building
- [ ] Test app thoroughly on physical devices
- [ ] Verify all API endpoints are working
- [ ] Test authentication flow
- [ ] Test payment integration (Razorpay)
- [ ] Test image uploads (Cloudinary)
- [ ] Test location services
- [ ] Test push notifications (if implemented)

### 📱 For App Store Submissions
- [ ] Prepare app screenshots (iOS: 6.5", 5.5" | Android: Various sizes)
- [ ] Write app description and keywords
- [ ] Prepare privacy policy URL
- [ ] Prepare terms of service URL
- [ ] Set up app pricing (Free)
- [ ] Prepare promotional graphics

---

## 🔗 Important Links

### Production URLs
- **Backend API:** https://student-nest.live/api
- **Website:** https://student-nest.live
- **Deep Link:** studentnest://

### Expo Dashboard
- **Builds:** https://expo.dev/accounts/YOUR_ACCOUNT/projects/StudentNestApp/builds
- **Updates:** https://expo.dev/accounts/YOUR_ACCOUNT/projects/StudentNestApp/updates

---

## 🎯 Quick Start Commands

```bash
# Navigate to app directory
cd StudentNestApp

# Install dependencies (if not already done)
npm install

# Start development server
npx expo start

# Build preview APK (recommended for first deployment)
eas build --platform android --profile preview

# After build completes, download and install APK
# Share the download link with users
```

---

## 📲 Installing the App

### Android
1. Build completes on EAS
2. Download the APK from the provided link
3. Enable "Install from Unknown Sources" on Android device
4. Install the APK
5. Open StudentNest app

### iOS (TestFlight)
1. Build completes on EAS
2. Upload to TestFlight via App Store Connect
3. Invite testers via email
4. Testers install via TestFlight app

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache
```

### API Connection Issues
- Verify backend is running at https://student-nest.live
- Check API URL in `.env.production`
- Test API endpoints manually

### Deep Link Issues
- Verify `student-nest.live` domain is accessible
- Check DNS configuration
- Test deep links: `studentnest://room/123`

---

## 📞 Support

For build issues:
- Check Expo documentation: https://docs.expo.dev/
- EAS Build documentation: https://docs.expo.dev/build/introduction/
- Contact: support@studentnest.com

---

## 🎉 Next Steps

After deployment:
1. Monitor crash reports and analytics
2. Gather user feedback
3. Plan iterative updates
4. Use OTA updates for minor fixes
5. Rebuild for major features

---

**Build Date:** February 4, 2026
**Backend:** https://student-nest.live
**Status:** ✅ Ready for Production Build
