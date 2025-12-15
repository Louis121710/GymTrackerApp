import AsyncStorage from '@react-native-async-storage/async-storage';

// User-specific workout entries functions
export const loadEntries = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    const key = `gym_entries_${username}`;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load entries error:', e);
    return [];
  }
};

export const saveEntries = async (entries, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save entries: no user logged in');
      return;
    }
    const key = `gym_entries_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(entries));
  } catch (e) {
    console.error('Save entries error:', e);
  }
};

export const addEntry = async (entry, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot add entry: no user logged in');
      return;
    }
    const entries = await loadEntries(username);
    const updatedEntries = [...entries, entry];
    await saveEntries(updatedEntries, username);
  } catch (e) {
    console.error('Add entry error:', e);
  }
};

export const updateEntry = async (entryId, updates, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot update entry: no user logged in');
      return;
    }
    const entries = await loadEntries(username);
    const updatedEntries = entries.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    await saveEntries(updatedEntries, username);
  } catch (e) {
    console.error('Update entry error:', e);
  }
};

export const deleteEntry = async (entryId, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot delete entry: no user logged in');
      return;
    }
    const entries = await loadEntries(username);
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    await saveEntries(updatedEntries, username);
  } catch (e) {
    console.error('Delete entry error:', e);
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
    // Save username, or remove if empty/null
    if (username && username.trim() !== '') {
      await AsyncStorage.setItem('current_user', username.trim());
    } else {
      await AsyncStorage.removeItem('current_user');
    }
  } catch (e) {
    console.error('Save current user error:', e);
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await AsyncStorage.getItem('current_user');
    // Return null for empty strings or null values
    return user && user.trim() !== '' ? user : null;
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