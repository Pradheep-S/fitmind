# FitMind - Complete Full-Stack Mental Wellness Journal 🧠✨

A beautiful, secure, and intelligent journaling application that helps you track your mental wellness journey with AI-powered insights. Now with complete user authentication and personal data management!

![FitMind Banner](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=FitMind+%7C+Secure+Personal+Journaling)

## 🌟 What's New - Authentication & Personal Data

FitMind now includes:
- **🔐 Secure User Authentication** - Personal accounts with email/password
- **📊 Personal Dashboard** - Your own private journal entries and statistics  
- **🛡️ Data Privacy** - Each user's data is completely private and secure
- **☁️ Cloud Storage** - Journal entries saved to MongoDB Atlas
- **📱 Enhanced Mobile Experience** - Works perfectly on all devices

## ✨ Core Features

### ✍️ **Intelligent Journaling**
- Beautiful, distraction-free writing interface
- Real-time word count and writing tips
- Seamless auto-save and local storage backup

### 🤖 **AI-Powered Insights**
- **Emotion Detection**: Automatically analyzes your mood using Gemini Pro AI
- **Personalized Suggestions**: Get tailored wellness recommendations
- **Smart Summaries**: AI-generated insights about your emotional patterns
- **Sentiment Analysis**: Track your emotional trends over time

### 📊 **Analytics & Progress**
- **Mood Tracking**: Visual charts showing your emotional journey
- **Writing Streaks**: Gamified daily journaling habits
- **Weekly Reflections**: AI-generated insights about your week
- **Progress Statistics**: Track your journaling consistency

### 🎨 **Beautiful Design**
- **Glassmorphism UI**: Modern, aesthetic interface with glass-like cards
- **Pastel Color Palette**: Calming colors designed for mental wellness
- **Smooth Animations**: Framer Motion animations for delightful interactions
- **Responsive Design**: Perfect experience on all devices

### 🛡️ **Privacy & Security**
- **Local-First**: Your data stays on your device
- **Encrypted Storage**: Secure journal entry storage
- **No Tracking**: Your privacy is our top priority
- **Data Export**: Download all your data anytime

## 🚀 Quick Start

### Option 1: Easy Startup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd fitmind

# Run the complete setup script
./start-fitmind.sh
```
The script will:
- Install all dependencies automatically
- Guide you through MongoDB setup
- Start both backend and frontend servers
- Open the app in your browser

### Option 2: Detailed Setup
For complete setup instructions including MongoDB Atlas configuration, see **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)**

### Quick Prerequisites
- **Node.js** 16+ and npm
- **MongoDB Atlas** account (free tier available)
- **Gemini API Key** (optional, for AI features)

## 🔐 New Authentication System

### User Features
- **Secure Registration** - Create account with email/password
- **JWT Authentication** - Secure session management
- **Profile Management** - Update personal information
- **Password Security** - Encrypted with bcrypt
- **Private Data** - Each user has isolated data access

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- Gemini Pro API key (optional, works with mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fitmind.git
   cd fitmind
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend  
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful data visualizations
- **Lucide React** - Consistent icon library
- **Axios** - HTTP client
- **Date-fns** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Google Gemini AI** - Advanced AI analysis
- **CORS** - Cross-origin support
- **Dotenv** - Environment configuration

## 📁 Project Structure

```
fitmind/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API calls and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   └── assets/         # Images and static files
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend API
│   ├── models/             # Database schemas
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitmind
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤖 AI Integration

### Gemini Pro Setup
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file: `GEMINI_API_KEY=your_key_here`
3. The app automatically falls back to mock data if no API key is provided

### Features Powered by AI
- **Emotion Classification**: Detects primary emotions from journal text
- **Sentiment Analysis**: Measures emotional tone (-1 to +1 scale)
- **Personalized Suggestions**: Contextual wellness recommendations
- **Smart Summaries**: Concise insights about your entries
- **Keyword Extraction**: Important themes from your writing

## 📱 Pages Overview

### 🏠 **Home Page**
- Welcome message with daily inspiration
- Current streak and statistics
- Quick access to start journaling
- Daily motivational quotes

### ✍️ **Journal Page**
- Distraction-free writing environment
- Real-time AI analysis sidebar
- Writing tips and prompts
- Instant feedback on mood and suggestions

### 📖 **Diary View**
- Browse all past entries
- Search and filter by mood/date
- Expandable entries with AI insights
- Card-based layout for easy reading

### 📊 **Stats Page**
- Mood trend visualization
- Writing streak tracking
- Weekly AI-generated reflections
- Achievement badges and milestones

### ⚙️ **Settings**
- Dark/light mode toggle
- Data export and privacy controls
- Notification preferences
- About and app information

## 🎨 Design System

### Color Palette
```css
/* Primary Blues */
primary-500: #0ea5e9
primary-600: #0284c7

/* Pastel Background */
pastel-pink: #fce7f3
pastel-purple: #f3e8ff  
pastel-blue: #dbeafe

/* Mood Colors */
happy: #10B981 (emerald)
calm: #3B82F6 (blue)
stressed: #EF4444 (red)
grateful: #8B5CF6 (purple)
```

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (body text)
- **Weight Scale**: 300, 400, 500, 600, 700

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Set environment variables
npm start
```

### Database
- **Local**: MongoDB Community Server
- **Cloud**: MongoDB Atlas (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful text analysis
- **Recharts** for beautiful data visualizations
- **Framer Motion** for smooth animations
- **Lucide** for consistent iconography
- **Tailwind CSS** for rapid styling

## 📞 Support

If you have any questions or need help getting started:

- 📧 Email: support@fitmind.app
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/fitmind/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/fitmind/discussions)

---

**Made with ❤️ for mental wellness and mindful living**

*Start your journey to better mental health through the power of journaling and AI insights.*