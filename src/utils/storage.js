import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadEntries = async () => {
  try {
    const json = await AsyncStorage.getItem('gym_entries');
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load error:', e);
    return [];
  }
};

export const saveEntries = async (entries) => {
  try {
    await AsyncStorage.setItem('gym_entries', JSON.stringify(entries));
  } catch (e) {
    console.error('Save error:', e);
  }
};