# 🏠 Student Nest - Quick Start Guide

## ✅ Current Status: READY TO USE

Your environment is configured and the app is running at **http://localhost:3000**

---

## 🔐 Demo Login Credentials

### Student Account
- **Email:** `demo.student@student-nest.live`
- **Password:** `Demo@123`
- **Phone:** `+1234567890`

### Owner Account
- **Email:** `demo.owner@student-nest.live`
- **Password:** `Demo@123`
- **Phone:** `+1234567891`

---

## Step-by-Step Setup Instructions

This guide will walk you through setting up the Student Nest application from scratch.

---

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB ([Download](https://www.mongodb.com/try/download/community))
   - MongoDB Atlas (Free cloud option) - [Sign up](https://www.mongodb.com/cloud/atlas)

---

## 🚀 Step 1: Install Dependencies

```bash
cd Website
npm install
```

---

## 🔧 Step 2: Configure Environment Variables

### Option A: Quick Start (Development Mode)

The `.env.local` file has been created with development defaults. You only need to configure MongoDB:

1. **For Local MongoDB:**
   - Make sure MongoDB is running locally
   - The default URI `mongodb://localhost:27017/student-nest` will work

2. **For MongoDB Atlas (Recommended):**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace in `.env.local`:
     ```
     MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/student-nest?retryWrites=true&w=majority
     ```

### Option B: Full Configuration (Production)

Edit `.env.local` and fill in all the optional services:

| Service | Purpose | Get Credentials |
|---------|---------|-----------------|
| **SendGrid** | Email notifications | [sendgrid.com](https://sendgrid.com/) |
| **Twilio** | SMS verification | [twilio.com](https://www.twilio.com/) |
| **Cloudinary** | Image uploads | [cloudinary.com](https://cloudinary.com/) |
| **Razorpay** | Payments | [razorpay.com](https://razorpay.com/) |
| **Google Cloud** | Google Meet & Maps | [console.cloud.google.com](https://console.cloud.google.com/) |

---

## ▶️ Step 3: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Step 4: Test the Application

### Test Pages
- **Home Page:** http://localhost:3000
- **Student Login:** http://localhost:3000/student/login
- **Student Signup:** http://localhost:3000/student/signup
- **Owner Login:** http://localhost:3000/owner/login
- **Owner Signup:** http://localhost:3000/owner/signup

### Test API Endpoints
```bash
# Check auth status
curl http://localhost:3000/api/auth/check

# View rooms (requires MongoDB)
curl http://localhost:3000/api/rooms
```

---

## 📁 Project Structure Overview

```
Website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── student/        # Student login/signup
│   │   │   └── owner/          # Owner login/signup
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   ├── student/        # Student dashboard
│   │   │   ├── owner/          # Owner dashboard
│   │   │   └── shared-rooms/   # Room sharing features
│   │   └── api/                # API Routes
│   │       ├── auth/           # Authentication APIs
│   │       ├── rooms/          # Room management
│   │       ├── bookings/       # Booking system
│   │       ├── payments/       # Payment processing
│   │       └── ...             # Other APIs
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & services
│   │   ├── db/                 # Database connection
│   │   ├── models/             # Mongoose models
│   │   ├── services/           # External services
│   │   └── utils/              # Helper functions
│   └── types/                  # TypeScript types
├── public/                     # Static files
├── .env.local                  # Environment config
└── .env.example                # Template for .env.local
```

---

## 🔑 Key Features

### For Students
- 🔐 Secure login with email/phone OTP
- 🏠 Search and filter rooms
- 🤝 Find compatible roommates
- 📅 Schedule property visits
- 💬 Chat with owners
- ⭐ Leave reviews

### For Room Owners
- ✅ Identity verification (Aadhaar/DigiLocker)
- 📋 List and manage properties
- 📊 View analytics
- 👥 Manage tenant applications
- 💰 Handle bookings and payments

---

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed-demo` | Seed demo data |
| `npm run clean-db` | Clean database |

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running (local)
brew services list | grep mongodb

# Or start MongoDB
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

---

## 📞 Support

If you encounter any issues:
1. Check the terminal for error messages
2. Verify MongoDB connection
3. Ensure all required environment variables are set
4. Clear the `.next` cache folder

---

## 🔒 Security Notes

For production deployment:
1. Generate new JWT secrets: `openssl rand -hex 32`
2. Enable email/SMS verification
3. Set `MOCK_VERIFICATION=false`
4. Use HTTPS
5. Configure proper CORS settings

---

Happy coding! 🎉
