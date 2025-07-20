import { motion } from 'framer-motion';
import { Book, BarChart3, Settings, Home, User, LogOut, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  const getCurrentPage = () => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.id : 'home';
  };

  return (
    <motion.nav 
      className="glass-card p-4 m-4 rounded-2xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <motion.h1 
          className="text-2xl font-display font-bold text-gray-800"
          whileHover={{ scale: 1.05 }}
        >
          FitMind
        </motion.h1>
        
        <div className="flex space-x-1 md:space-x-2">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <motion.button
              key={id}
              onClick={() => handleNavigation(path)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                getCurrentPage() === id 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={18} />
              <span className="hidden sm:block text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="text-primary-600" size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:block text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
