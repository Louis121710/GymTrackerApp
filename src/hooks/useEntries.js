/**
 * Custom hook for managing workout entries
 * Handles loading, refreshing, and state management
 */
import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { loadEntries, getCurrentUser } from '../utils/storage';

export const useEntries = () => {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadEntriesData = async () => {
    const username = await getCurrentUser();
    if (!username) {
      setEntries([]);
      return;
    }
    const loadedEntries = await loadEntries(username);
    const safeEntries = Array.isArray(loadedEntries) ? loadedEntries : [];
    const sortedEntries = safeEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    setEntries(sortedEntries);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntriesData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      loadEntriesData();
    }
  }, [isFocused]);

  return { entries, setEntries, refreshing, onRefresh, loadEntriesData };
};
