// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gym_entries';

export const loadEntries = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const entries = json ? JSON.parse(json) : [];
    return entries.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
  } catch (e) {
    console.error('Load error:', e);
    return [];
  }
};

export const saveEntries = async (entries) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Save error:', e);
  }
};