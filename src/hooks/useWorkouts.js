/**
 * Custom hook for managing custom workouts
 * Handles loading, saving, and state management
 */
import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { loadCustomWorkouts, getCurrentUser } from '../utils/storage';

export const useWorkouts = () => {
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadWorkouts = async () => {
    const username = await getCurrentUser();
    if (!username) {
      setSavedWorkouts([]);
      return;
    }
    const workouts = await loadCustomWorkouts(username);
    setSavedWorkouts(Array.isArray(workouts) ? workouts : []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      loadWorkouts();
    }
  }, [isFocused]);

  return { savedWorkouts, setSavedWorkouts, refreshing, onRefresh, loadWorkouts };
};
