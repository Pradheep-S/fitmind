import { motion } from 'framer-motion';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        {children}
      </div>
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
    </motion.div>
  );
};

export default Layout;
