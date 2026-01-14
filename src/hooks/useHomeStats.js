import { useState, useEffect } from 'react';
import { loadEntries, getCurrentUser } from '../utils/storage';
import { calculateStreak } from '../utils/streakCalculations';

/**
 * Custom hook for managing home page statistics
 * Handles loading entries, calculating stats, and managing user data
 * 
 * @param {number} goalWeight - User's goal weight
 * @returns {Object} Stats state and loading function
 */
export const useHomeStats = (goalWeight) => {
  const [entries, setEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentWeight: 0,
    goalWeight: goalWeight || 75,
    cardioSessions: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  /**
   * Load user entries and calculate statistics
   */
  const loadUserData = async () => {
    try {
      const username = await getCurrentUser();
      setCurrentUser(username || '');

      if (!username) {
        setEntries([]);
        setStats(prev => ({
          ...prev,
          totalWorkouts: 0,
          currentWeight: 0,
          goalWeight: goalWeight || 75,
          cardioSessions: 0,
          currentStreak: 0,
          longestStreak: 0
        }));
        return;
      }

      const loadedEntries = await loadEntries(username);
      const safeEntries = Array.isArray(loadedEntries) ? loadedEntries : [];
      setEntries(safeEntries);

      const { currentStreak, longestStreak } = calculateStreak(safeEntries);

      if (safeEntries.length > 0) {
        const latestEntry = safeEntries[safeEntries.length - 1];
        const cardioSessions = safeEntries.filter(entry => entry.did_cardio).length;

        setStats({
          totalWorkouts: safeEntries.length,
          currentWeight: latestEntry.body_weight || 0,
          goalWeight: goalWeight || 75,
          cardioSessions: cardioSessions,
          currentStreak,
          longestStreak
        });
      } else {
        setStats(prev => ({
          ...prev,
          goalWeight: goalWeight || 75,
          currentStreak,
          longestStreak
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setEntries([]);
      setStats(prev => ({
        ...prev,
        totalWorkouts: 0,
        currentWeight: 0,
        goalWeight: goalWeight || 75,
        cardioSessions: 0,
        currentStreak: 0,
        longestStreak: 0
      }));
    }
  };

  useEffect(() => {
    loadUserData();
  }, [goalWeight]);

  return {
    entries,
    currentUser,
    stats,
    loadUserData
  };
};
