import { motion } from 'framer-motion';
import { Book, BarChart3, Settings, Home, User, LogOut, PenTool, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'journal', label: 'Journal', icon: PenTool, path: '/journal' },
    { id: 'diary', label: 'My Diary', icon: Book, path: '/diary' },
    { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const getCurrentPage = () => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.id : 'home';
  };

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-white/20' 
          : 'bg-white/80 backdrop-blur-md shadow-lg'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigation('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h1 className="text-2xl font-display font-bold text-black">
              FitMind
            </h1>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ id, label, icon: Icon, path }) => (
              <motion.button
                key={id}
                onClick={() => handleNavigation(path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  getCurrentPage() === id 
                    ? 'bg-primary-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:scale-105'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50/50 rounded-xl">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <User className="text-white" size={16} />
              </motion.div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-50 rounded-xl text-gray-600"
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={14} />
              </div>
              <ChevronDown 
                className={`transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
                size={16} 
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden overflow-hidden ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="py-4 border-t border-gray-200/20">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50/50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1 mb-4">
              {navItems.map(({ id, label, icon: Icon, path }) => (
                <motion.button
                  key={id}
                  onClick={() => handleNavigation(path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    getCurrentPage() === id 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>

            {/* Logout Button Mobile */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
