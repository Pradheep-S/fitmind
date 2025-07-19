# 🚀 FitMind Setup Instructions

## Quick Start (5 minutes)

### 1. 📋 Prerequisites
- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **MongoDB** (optional) - App works with mock data if MongoDB is not available
- **Git** - For cloning the repository

### 2. 🔧 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd fitmind

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Copy environment files
cp .env.example .env
cd ../frontend
cp .env.example .env.local
```

### 3. ⚙️ Configuration

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitmind
GEMINI_API_KEY=your_gemini_api_key_here  # Optional
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. 🏃 Running the Application

**Option A: Automatic (Recommended)**
```bash
./start-dev.sh
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 5. 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Getting AI Features (Optional)

### Gemini Pro API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your backend `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

**Note**: The app works perfectly with mock AI data if you don't have an API key!

## 💾 Database Setup (Optional)

### MongoDB Local Installation
1. Download MongoDB Community Server
2. Follow installation instructions for your OS
3. Start MongoDB service
4. The app will automatically connect to `mongodb://localhost:27017/fitmind`

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Update your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitmind
   ```

**Note**: The app works with mock data if MongoDB is not available!

## 📱 Features Overview

### ✅ Working Features
- ✍️ **Beautiful Journal Interface** - Distraction-free writing
- 🤖 **AI Mood Analysis** - Emotional insights from your writing
- 📊 **Statistics Dashboard** - Track your journaling patterns
- 📖 **Diary View** - Browse all your past entries
- ⚙️ **Settings Panel** - Customize your experience
- 🎨 **Responsive Design** - Works on all devices
- 🔒 **Privacy Focused** - Your data stays local

### 🎯 Live Demo Features
- Mock AI analysis (works without API keys)
- Sample journal entries and statistics
- All UI components fully functional
- Real-time mood detection simulation

## 🛠️ Development

### 🔍 Debugging
```bash
# Backend logs
cd backend && npm start

# Frontend with debug info
cd frontend && npm run dev

# API testing
curl http://localhost:5000/api/health
```

### 🏗️ Building for Production
```bash
# Build frontend
cd frontend && npm run build

# The built files will be in frontend/dist/
```

## ❓ Troubleshooting

### Port Already in Use
- Frontend will automatically try ports 5173, 5174, 5175, etc.
- Backend uses port 5000 by default

### PostCSS Errors
- Clear Vite cache: `rm -rf frontend/node_modules/.vite`
- Restart the frontend server

### MongoDB Connection Issues
- App works without MongoDB using mock data
- Check MongoDB service is running: `sudo systemctl status mongod`

### API Not Working
- Check backend server is running on port 5000
- Verify CORS settings in backend/server.js
- Check browser console for errors

## 📞 Support

If you encounter any issues:
1. Check this setup guide
2. Review error messages in terminal
3. Check browser developer console
4. Ensure all dependencies are installed correctly

## 🎉 You're All Set!

Your FitMind journaling app should now be running with:
- Beautiful, responsive UI
- AI-powered mood analysis
- Complete journaling functionality
- Statistics and insights
- Local data storage

Start journaling and track your emotional wellness journey! 🌟
