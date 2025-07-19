import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Shield, Trash2, Bell, Download, Upload } from 'lucide-react';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      exportDate: new Date().toISOString(),
      journalEntries: "Your journal data would be exported here",
      settings: { darkMode, notifications }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitmind-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (showDeleteConfirm) {
      // Implement actual delete functionality here
      console.log('Data deleted');
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">
          Settings ⚙️
        </h1>
        <p className="text-gray-600">
          Customize your FitMind experience
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="text-indigo-500" size={20} /> : <Sun className="text-yellow-500" size={20} />}
              <div>
                <p className="font-medium text-gray-800">Dark Mode</p>
                <p className="text-sm text-gray-600">Toggle between light and dark themes</p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-primary-500' : 'bg-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: darkMode ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="text-blue-500" size={20} />
              <div>
                <p className="font-medium text-gray-800">Daily Reminders</p>
                <p className="text-sm text-gray-600">Get reminded to write your daily journal</p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                notifications ? 'bg-primary-500' : 'bg-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: notifications ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h3>
          
          <div className="space-y-4">
            <motion.button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Download className="text-green-500" size={20} />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Export My Data</p>
                  <p className="text-sm text-gray-600">Download all your journal entries and data</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">JSON</div>
            </motion.button>

            <div className="flex items-center space-x-3 p-4 bg-white/20 border border-white/30 rounded-lg">
              <Upload className="text-blue-500" size={20} />
              <div>
                <p className="font-medium text-gray-800">Import Data</p>
                <p className="text-sm text-gray-600">Upload your journal backup (Coming Soon)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-green-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Privacy & Security</h3>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-green-50/50 rounded-lg border border-green-200/30">
              <h4 className="font-semibold text-green-800 mb-2">🔒 Your Data is Secure</h4>
              <ul className="text-sm space-y-1">
                <li>• All journal entries are stored locally and encrypted</li>
                <li>• AI analysis is processed securely without storing personal data</li>
                <li>• No third-party tracking or analytics</li>
                <li>• Your privacy is our top priority</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <h4 className="font-semibold text-blue-800 mb-2">📊 AI Analysis</h4>
              <p className="text-sm">
                Your journal text is sent to AI services (OpenAI/Gemini) for mood analysis and suggestions. 
                The text is not stored by the AI provider and is only used for generating insights.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          className="glass-card p-6 border-red-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h3>
          
          <motion.button
            onClick={handleDeleteData}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
              showDeleteConfirm 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={20} />
            <span className="font-medium">
              {showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete All My Data'}
            </span>
          </motion.button>
          
          {showDeleteConfirm && (
            <motion.div 
              className="mt-4 p-4 bg-red-50/50 rounded-lg border border-red-200/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-red-700">
                ⚠️ This action cannot be undone. All your journal entries, mood data, and settings will be permanently deleted.
              </p>
              <motion.button
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
                whileHover={{ scale: 1.05 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* About */}
        <motion.div 
          className="glass-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">About FitMind</h3>
          <p className="text-gray-600 mb-2">Version 1.0.0</p>
          <p className="text-sm text-gray-500">
            Built with ❤️ to support your mental wellness journey through mindful journaling.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
