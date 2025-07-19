import { motion } from 'framer-motion';
import { Book, BarChart3, Settings, Home } from 'lucide-react';

const Navbar = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'diary', label: 'My Diary', icon: Book },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
          {navItems.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => onPageChange(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === id 
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
      </div>
    </motion.nav>
  );
};

export default Navbar;
