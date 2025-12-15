import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, saveCurrentUser } from '../utils/storage';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('AuthContext - Current user:', currentUser);
      // Only set user if it's a valid non-empty string
      setUser(currentUser && currentUser.trim() !== '' ? currentUser : null);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username) => {
    console.log('AuthContext - Logging in:', username);
    await saveCurrentUser(username);
    setUser(username);
  };

  const logout = async () => {
    console.log('AuthContext - Logging out');
    await saveCurrentUser('');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export
export default AuthContext;