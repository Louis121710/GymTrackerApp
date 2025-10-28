import AsyncStorage from '@react-native-async-storage/async-storage';

// Existing functions for workout entries
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

// New functions for user accounts
export const loadUsers = async () => {
  try {
    const json = await AsyncStorage.getItem('gym_users');
    return json ? JSON.parse(json) : [{ username: 'demo', password: 'demo123' }];
  } catch (e) {
    console.error('Load users error:', e);
    return [{ username: 'demo', password: 'demo123' }];
  }
};

export const saveUsers = async (users) => {
  try {
    await AsyncStorage.setItem('gym_users', JSON.stringify(users));
  } catch (e) {
    console.error('Save users error:', e);
  }
};

export const saveCurrentUser = async (username) => {
  try {
    await AsyncStorage.setItem('current_user', username);
  } catch (e) {
    console.error('Save current user error:', e);
  }
};

export const getCurrentUser = async () => {
  try {
    return await AsyncStorage.getItem('current_user');
  } catch (e) {
    console.error('Get current user error:', e);
    return null;
  }
};

export const clearCurrentUser = async () => {
  try {
    await AsyncStorage.removeItem('current_user');
  } catch (e) {
    console.error('Clear current user error:', e);
  }
};

export const updateUserProfile = async (username, updates) => {
  try {
    const users = await loadUsers();
    const updatedUsers = users.map(user =>
      user.username === username ? { ...user, ...updates } : user
    );
    await saveUsers(updatedUsers);
  } catch (e) {
    console.error('Update user profile error:', e);
  }
};