import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Components
import Navbar from './components/Navbar'
import Layout from './components/Layout'

// Pages  
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import DiaryPage from './pages/DiaryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [journalEntries, setJournalEntries] = useState([])

  // Load saved page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem('fitmind-current-page')
    if (savedPage) {
      setCurrentPage(savedPage)
    }
  }, [])

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem('fitmind-current-page', currentPage)
  }, [currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleStartJournal = () => {
    setCurrentPage('journal')
  }

  const handleJournalSubmitted = (journalData) => {
    setJournalEntries(prev => [journalData, ...prev])
    // You could redirect to diary or home after successful submission
    setTimeout(() => {
      setCurrentPage('diary')
    }, 2000)
  }

  const renderPage = () => {
    const pageProps = {
      key: currentPage, // Important for animation transitions
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onStartJournal={handleStartJournal} {...pageProps} />
      case 'journal':
        return <JournalPage onJournalSubmitted={handleJournalSubmitted} {...pageProps} />
      case 'diary':
        return <DiaryPage {...pageProps} />
      case 'stats':
        return <StatsPage {...pageProps} />
      case 'settings':
        return <SettingsPage {...pageProps} />
      default:
        return <HomePage onStartJournal={handleStartJournal} {...pageProps} />
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </Layout>

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pastel-pink rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pastel-blue rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default App
