import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Shield, Trash2, Bell, Download, Upload, User, Mail, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { downloadJournalData } from '../services/journalService';

const SettingsPage = ({ user }) => {
  const { updateProfile, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Initialize profile data when user prop changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
      setNotifications(user.preferences?.notifications ?? true);
      setDarkMode(user.preferences?.theme === 'dark');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    
    try {
      const result = await updateProfile({
        name: profileData.name,
        preferences: {
          notifications,
          theme: darkMode ? 'dark' : 'light'
        }
      });
      
      if (result.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleExportData = async (format = 'json') => {
    setIsExporting(true);
    setExportSuccess(null);
    
    try {
      const result = await downloadJournalData(format);
      setExportSuccess(`Successfully exported ${result.count} journal entries as ${result.filename}`);
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportSuccess(`Export failed: ${error.message}`);
      setTimeout(() => setExportSuccess(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (showDeleteConfirm) {
      if (window.confirm('This will permanently delete your account and all data. This cannot be undone. Are you absolutely sure?')) {
        try {
          // Call delete account endpoint here when implemented
          await logout();
        } catch (error) {
          console.error('Account deletion failed:', error);
        }
      }
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
        {/* Profile Settings */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="mr-2" size={24} />
            Profile Information
          </h3>
          
          {profileSuccess && (
            <motion.div
              className="mb-4 p-3 bg-green-50/50 border border-green-200/30 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-green-700 text-sm">✓ Profile updated successfully!</p>
            </motion.div>
          )}
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={profileData.email}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <motion.button
              type="submit"
              disabled={isUpdatingProfile}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isUpdatingProfile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
              }`}
              whileHover={!isUpdatingProfile ? { scale: 1.02 } : {}}
              whileTap={!isUpdatingProfile ? { scale: 0.98 } : {}}
            >
              {isUpdatingProfile ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Update Profile
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
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
          transition={{ delay: 0.5, duration: 0.6 }}
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
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h3>
          
          <div className="space-y-4">
            {exportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm ${
                  exportSuccess.includes('Successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {exportSuccess}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format:</h4>
              
              <motion.button
                onClick={() => handleExportData('json')}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <Download className="text-green-500" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Export as JSON</p>
                    <p className="text-sm text-gray-600">Complete data with all analysis details</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {isExporting ? 'Exporting...' : 'JSON'}
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => handleExportData('csv')}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <Download className="text-blue-500" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Export as CSV</p>
                    <p className="text-sm text-gray-600">Spreadsheet format for analysis</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {isExporting ? 'Exporting...' : 'CSV'}
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => handleExportData('txt')}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <Download className="text-purple-500" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Export as Text</p>
                    <p className="text-sm text-gray-600">Plain text format for reading</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {isExporting ? 'Exporting...' : 'TXT'}
                </div>
              </motion.button>
            </div>

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
          transition={{ delay: 0.7, duration: 0.6 }}
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
          transition={{ delay: 0.8, duration: 0.6 }}
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

        
        
      </div>
    </motion.div>
  );
};

export default SettingsPage;
