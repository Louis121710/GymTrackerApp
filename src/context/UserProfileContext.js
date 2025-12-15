import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCurrentUser, loadUsers } from '../utils/storage';
import { useAuth } from './AuthContext';

// Create the context
const UserProfileContext = createContext();

// Custom hook to use the profile context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Profile Provider component
export const UserProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    height: '',
    age: '',
    goalWeight: '75',
    goal: 'lose_weight'
  });
  const [loading, setLoading] = useState(true);
  
  // Use ref to store the latest loadProfile function to avoid cascading dependencies
  const loadProfileRef = useRef(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile({
        username: '',
        email: '',
        height: '',
        age: '',
        goalWeight: '75',
        goal: 'lose_weight'
      });
      setLoading(false);
      return;
    }

    try {
      const username = await getCurrentUser();
      if (username) {
        const users = await loadUsers();
        const userData = users.find(u => u.username === username);
        if (userData) {
          setProfile({
            username: userData.username || '',
            email: userData.email || '',
            height: userData.height || '',
            age: userData.age || '',
            goalWeight: userData.goalWeight || '75',
            goal: userData.goal || 'lose_weight'
          });
        } else {
          setProfile({
            username: '',
            email: '',
            height: '',
            age: '',
            goalWeight: '75',
            goal: 'lose_weight'
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Store the latest loadProfile in ref
  loadProfileRef.current = loadProfile;

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // refreshProfile doesn't depend on loadProfile, uses ref instead
  const refreshProfile = useCallback(() => {
    setLoading(true);
    if (loadProfileRef.current) {
      loadProfileRef.current();
    }
  }, []); // Empty dependency array - stable function

  const value = useMemo(() => ({
    profile,
    loading,
    refreshProfile,
    goalWeight: parseFloat(profile.goalWeight) || 75,
    goal: profile.goal || 'lose_weight'
  }), [profile, loading, refreshProfile]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Default export
export default UserProfileContext;

