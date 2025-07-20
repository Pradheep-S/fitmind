# 🚀 FitMind Complete Setup Guide

## Overview
FitMind is now a complete full-stack application with user authentication, secure data storage, and personal journaling features. Each user has their own protected account and data.

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (free tier works perfectly)
- Git

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "FitMind"

### 2. Create Database Cluster
1. Click "Create a New Cluster"
2. Choose FREE tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "fitmind-cluster")
5. Click "Create Cluster"

### 3. Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and secure password (save these!)
5. Set role to "Atlas admin" (or read/write to any database)
6. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific server IP
5. Click "Confirm"

### 5. Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and your version
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `fitmind`

Example connection string:
```
mongodb+srv://myuser:mypassword@fitmind-cluster.xxxxx.mongodb.net/fitmind?retryWrites=true&w=majority
```

## 🛠️ Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

### 4. Configure Environment Variables

Edit your `.env` file with these values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration - REPLACE WITH YOUR ATLAS CONNECTION STRING
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fitmind?retryWrites=true&w=majority

# JWT Configuration - GENERATE A STRONG SECRET
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-like-this-one
JWT_EXPIRE=7d

# AI Service Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ Important Security Notes:**
- Replace `JWT_SECRET` with a long, random string (at least 32 characters)
- Keep your MongoDB credentials secure
- Never commit `.env` file to git

### 5. Start Backend Server
```bash
npm run dev
```

The backend should start on http://localhost:5000

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration (Optional)
Create a `.env` file if you need to customize the API URL:

```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend should start on http://localhost:5173

## 🗂️ Database Collections

The application automatically creates these MongoDB collections:

### Users Collection
- `_id`: Unique user identifier
- `name`: User's full name
- `email`: Unique email address (login identifier)
- `password`: Hashed password
- `preferences`: User settings (theme, notifications)
- `stats`: User statistics (streaks, totals)
- `timestamps`: Created and updated dates

### Journals Collection
- `_id`: Unique journal entry identifier
- `user`: Reference to user who created the entry
- `date`: Entry creation date
- `text`: Journal content
- `mood`: AI-detected mood
- `suggestions`: AI-generated suggestions
- `summary`: AI-generated summary
- `aiAnalysis`: Detailed AI analysis data
- `timestamps`: Created and updated dates

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected API routes
- Automatic token validation

### Data Privacy
- User data isolation (users can only access their own data)
- Secure API endpoints
- Input validation and sanitization
- CORS protection

### Password Security
- Minimum 6 character requirement
- Bcrypt hashing with salt
- Password change functionality

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### Security Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] Secure MongoDB credentials
- [ ] HTTPS enabled
- [ ] CORS configured for your domain
- [ ] Environment variables secured
- [ ] Regular database backups

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests (when implemented)
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📊 Features Overview

### ✅ Implemented Features

#### Authentication System
- ✅ User registration with email/password
- ✅ Secure login system
- ✅ JWT token-based sessions
- ✅ Protected routes and API endpoints
- ✅ User profile management
- ✅ Logout functionality

#### Journal Management
- ✅ Create personal journal entries
- ✅ AI-powered mood analysis
- ✅ Personalized suggestions
- ✅ Entry summaries
- ✅ View personal journal history
- ✅ Search and filter entries

#### User Experience
- ✅ Responsive design for all devices
- ✅ Smooth animations and transitions
- ✅ Real-time form validation
- ✅ Error handling and user feedback
- ✅ Loading states and progress indicators

#### Data & Analytics
- ✅ Personal statistics dashboard
- ✅ Mood tracking over time
- ✅ Journaling streaks
- ✅ Visual charts and insights

#### Settings & Preferences
- ✅ Profile management
- ✅ Theme preferences
- ✅ Notification settings
- ✅ Data export functionality

### 🔮 Future Enhancements
- Email verification
- Password reset via email
- Two-factor authentication
- Social login options
- Mobile app version
- Advanced AI insights
- Sharing and community features

## 🐛 Troubleshooting

### Common Issues

#### "MongoError: Authentication failed"
- Check your MongoDB Atlas credentials
- Ensure the user has correct permissions
- Verify the connection string format

#### "JWT must be provided"
- Clear browser localStorage
- Check if backend is running
- Verify JWT_SECRET is set

#### "CORS Error"
- Check FRONTEND_URL in backend .env
- Ensure ports match (frontend: 5173, backend: 5000)

#### "AI Analysis Failed"
- AI features will use mock data if API key is not provided
- Check GEMINI_API_KEY in .env file
- Ensure you have API credits available

### Getting Help
1. Check the browser console for errors
2. Check backend terminal for error logs
3. Verify all environment variables are set
4. Ensure MongoDB Atlas is properly configured

## 🎉 Success!

If everything is set up correctly:
1. Visit http://localhost:5173
2. Create a new account or login
3. Start journaling!

Your data will be securely stored in your personal MongoDB Atlas database, and only you can access your journal entries.

---

**Happy Journaling! 🌟**
