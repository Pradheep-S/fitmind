import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

const AuthContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Update state based on current route
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
    navigate('/signup');
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    navigate('/login');
  };

  return (
    <>
      {isLogin ? (
        <LoginPage onSwitchToSignup={handleSwitchToSignup} />
      ) : (
        <SignupPage onSwitchToLogin={handleSwitchToLogin} />
      )}
    </>
  );
};

export default AuthContainer;
