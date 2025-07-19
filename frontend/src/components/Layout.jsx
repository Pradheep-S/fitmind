import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </motion.div>
  );
};

export default Layout;
