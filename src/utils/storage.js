import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseStorage from './firebaseStorage';

// User-specific workout entries functions
export const loadEntries = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    
    // Load from local storage first (fast)
    const key = `gym_entries_${username}`;
    const json = await AsyncStorage.getItem(key);
    const localEntries = json ? JSON.parse(json) : [];
    
    // Try to sync from Firebase in background (non-blocking)
    firebaseStorage.loadEntriesFromFirebase(username).then(cloudEntries => {
      if (cloudEntries && cloudEntries.length > 0) {
        // Merge: cloud data takes precedence for conflicts
        const merged = [...localEntries];
        cloudEntries.forEach(cloudEntry => {
          const index = merged.findIndex(e => e.id === cloudEntry.id);
          if (index >= 0) {
            merged[index] = cloudEntry;
          } else {
            merged.push(cloudEntry);
          }
        });
        // Save merged data locally
        AsyncStorage.setItem(key, JSON.stringify(merged)).catch(console.error);
      }
    }).catch(err => {
      console.warn('Firebase load failed, using local data:', err);
    });
    
    return localEntries;
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
    // Save locally first (fast, works offline)
    const key = `gym_entries_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(entries));
    
    // Sync to Firebase in background (non-blocking)
    firebaseStorage.saveEntriesToFirebase(entries, username).catch(err => {
      console.warn('Firebase sync failed (will retry later):', err);
    });
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
    
    // Also add directly to Firebase
    firebaseStorage.addEntryToFirebase(entry, username).catch(console.error);
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
    
    // Also delete from Firebase
    firebaseStorage.deleteEntryFromFirebase(entryId, username).catch(console.error);
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
    // Save locally first
    await AsyncStorage.setItem('gym_users', JSON.stringify(users));
    
    // Sync each user profile to Firebase in background
    users.forEach(user => {
      if (user.username) {
        firebaseStorage.saveUserProfileToFirebase(user, user.username).catch(console.error);
      }
    });
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
    
    // Also update directly in Firebase
    const updatedUser = updatedUsers.find(u => u.username === username);
    if (updatedUser) {
      firebaseStorage.saveUserProfileToFirebase(updatedUser, username).catch(console.error);
    }
  } catch (e) {
    console.error('Update user profile error:', e);
  }
};

// Custom workout functions
export const loadCustomWorkouts = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    const key = `custom_workouts_${username}`;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load custom workouts error:', e);
    return [];
  }
};

export const saveCustomWorkouts = async (workouts, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save workouts: no user logged in');
      return;
    }
    const key = `custom_workouts_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(workouts));
  } catch (e) {
    console.error('Save custom workouts error:', e);
  }
};

export const saveCustomWorkout = async (workout, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save workout: no user logged in');
      return;
    }
    const workouts = await loadCustomWorkouts(username);
    const updatedWorkouts = [...workouts, workout];
    await saveCustomWorkouts(updatedWorkouts, username);
  } catch (e) {
    console.error('Save custom workout error:', e);
  }
};

export const updateCustomWorkout = async (workoutId, updates, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot update workout: no user logged in');
      return;
    }
    const workouts = await loadCustomWorkouts(username);
    const updatedWorkouts = workouts.map(workout =>
      workout.id === workoutId ? { ...workout, ...updates } : workout
    );
    await saveCustomWorkouts(updatedWorkouts, username);
  } catch (e) {
    console.error('Update custom workout error:', e);
  }
};

export const deleteCustomWorkout = async (workoutId, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot delete workout: no user logged in');
      return;
    }
    const workouts = await loadCustomWorkouts(username);
    const updatedWorkouts = workouts.filter(workout => workout.id !== workoutId);
    await saveCustomWorkouts(updatedWorkouts, username);
  } catch (e) {
    console.error('Delete custom workout error:', e);
  }
};

// Global custom exercise functions (shared by all users)
export const loadCustomExercises = async () => {
  try {
    const key = 'global_custom_exercises';
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load custom exercises error:', e);
    return [];
  }
};

export const saveCustomExercises = async (exercises) => {
  try {
    const key = 'global_custom_exercises';
    await AsyncStorage.setItem(key, JSON.stringify(exercises));
  } catch (e) {
    console.error('Save custom exercises error:', e);
  }
};

export const addCustomExercise = async (exerciseName) => {
  try {
    const exercises = await loadCustomExercises();
    const exerciseLower = exerciseName.trim().toLowerCase();
    // Check if exercise already exists (in global or common exercises)
    if (exercises.some(ex => ex.toLowerCase() === exerciseLower)) {
      return false; // Exercise already exists
    }
    const updatedExercises = [...exercises, exerciseName.trim()];
    await saveCustomExercises(updatedExercises);
    return true;
  } catch (e) {
    console.error('Add custom exercise error:', e);
    return false;
  }
};

export const deleteCustomExercise = async (exerciseName) => {
  try {
    const exercises = await loadCustomExercises();
    const updatedExercises = exercises.filter(ex => ex.toLowerCase() !== exerciseName.toLowerCase());
    await saveCustomExercises(updatedExercises);
  } catch (e) {
    console.error('Delete custom exercise error:', e);
  }
};

// Workout logs - completed workout sessions
export const loadWorkoutLogs = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    
    // Load from local storage first
    const key = `workout_logs_${username}`;
    const json = await AsyncStorage.getItem(key);
    const localLogs = json ? JSON.parse(json) : [];
    
    // Try to sync from Firebase in background
    firebaseStorage.loadWorkoutLogsFromFirebase(username).then(cloudLogs => {
      if (cloudLogs && cloudLogs.length > 0) {
        const merged = [...localLogs];
        cloudLogs.forEach(cloudLog => {
          const index = merged.findIndex(l => l.id === cloudLog.id);
          if (index >= 0) {
            merged[index] = cloudLog;
          } else {
            merged.push(cloudLog);
          }
        });
        AsyncStorage.setItem(key, JSON.stringify(merged)).catch(console.error);
      }
    }).catch(console.error);
    
    return localLogs;
  } catch (e) {
    console.error('Load workout logs error:', e);
    return [];
  }
};

export const saveWorkoutLogs = async (logs, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save logs: no user logged in');
      return;
    }
    // Save locally first
    const key = `workout_logs_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(logs));
    
    // Sync to Firebase in background
    firebaseStorage.saveWorkoutLogsToFirebase(logs, username).catch(console.error);
  } catch (e) {
    console.error('Save workout logs error:', e);
  }
};

export const addWorkoutLog = async (log, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot add log: no user logged in');
      return;
    }
    const logs = await loadWorkoutLogs(username);
    const updatedLogs = [...logs, log];
    await saveWorkoutLogs(updatedLogs, username);
    
    // Also add directly to Firebase
    firebaseStorage.addWorkoutLogToFirebase(log, username).catch(console.error);
    
    // Update PRs when logging workout
    await updatePersonalRecords(log.exercises || [], username);
  } catch (e) {
    console.error('Add workout log error:', e);
  }
};

// Personal Records (PRs) tracking
export const loadPersonalRecords = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return {};
    }
    
    // Load from local storage first
    const key = `personal_records_${username}`;
    const json = await AsyncStorage.getItem(key);
    const localRecords = json ? JSON.parse(json) : {};
    
    // Try to sync from Firebase in background
    firebaseStorage.loadPersonalRecordsFromFirebase(username).then(cloudRecords => {
      if (cloudRecords && Object.keys(cloudRecords).length > 0) {
        // Merge: cloud takes precedence
        const merged = { ...localRecords, ...cloudRecords };
        AsyncStorage.setItem(key, JSON.stringify(merged)).catch(console.error);
      }
    }).catch(console.error);
    
    return localRecords;
  } catch (e) {
    console.error('Load personal records error:', e);
    return {};
  }
};

export const savePersonalRecords = async (records, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save PRs: no user logged in');
      return;
    }
    const key = `personal_records_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(records));
  } catch (e) {
    console.error('Save personal records error:', e);
  }
};

export const updatePersonalRecords = async (exercises, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return;
    }
    const currentPRs = await loadPersonalRecords(username);
    const updatedPRs = { ...currentPRs };

    exercises.forEach(exercise => {
      if (!exercise.name || !exercise.sets || !Array.isArray(exercise.sets)) return;
      
      const exerciseName = exercise.name.toLowerCase();
      if (!updatedPRs[exerciseName]) {
        updatedPRs[exerciseName] = {
          maxWeight: 0,
          maxReps: 0,
          maxVolume: 0,
          maxOneRepMax: 0,
          lastUpdated: null
        };
      }

      exercise.sets.forEach(set => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseFloat(set.reps) || 0;
        const volume = weight * reps;
        
        // Calculate 1RM using Epley formula: 1RM = weight × (1 + reps/30)
        const oneRepMax = reps > 0 ? weight * (1 + reps / 30) : 0;

        if (weight > updatedPRs[exerciseName].maxWeight) {
          updatedPRs[exerciseName].maxWeight = weight;
        }
        if (reps > updatedPRs[exerciseName].maxReps) {
          updatedPRs[exerciseName].maxReps = reps;
        }
        if (volume > updatedPRs[exerciseName].maxVolume) {
          updatedPRs[exerciseName].maxVolume = volume;
        }
        if (oneRepMax > updatedPRs[exerciseName].maxOneRepMax) {
          updatedPRs[exerciseName].maxOneRepMax = oneRepMax;
        }
      });

      updatedPRs[exerciseName].lastUpdated = new Date().getTime();
    });

    await savePersonalRecords(updatedPRs, username);
  } catch (e) {
    console.error('Update personal records error:', e);
  }
};

// Sync helper function - call this on app start or login
export const syncAllUserData = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return false;
    }
    
    // Sync all data to Firebase (upload local to cloud)
    await firebaseStorage.syncAllDataToFirebase(username);
    
    // Then sync from Firebase (download cloud to local and merge)
    await firebaseStorage.syncAllDataFromFirebase(username);
    
    return true;
  } catch (error) {
    console.error('Error syncing user data:', error);
    return false;
  }
};

// Exercise history - all past performances of an exercise
export const loadExerciseHistory = async (exerciseName, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    const logs = await loadWorkoutLogs(username);
    const history = [];
    
    logs.forEach(log => {
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
          if (ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()) {
            history.push({
              date: log.date,
              timestamp: log.timestamp,
              sets: ex.sets || [],
              workoutId: log.id
            });
          }
        });
      }
    });
    
    return history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (e) {
    console.error('Load exercise history error:', e);
    return [];
  }
};

// Body measurements tracking
export const loadBodyMeasurements = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return [];
    }
    
    // Load from local storage first
    const key = `body_measurements_${username}`;
    const json = await AsyncStorage.getItem(key);
    const localMeasurements = json ? JSON.parse(json) : [];
    
    // Try to sync from Firebase in background
    firebaseStorage.loadBodyMeasurementsFromFirebase(username).then(cloudMeasurements => {
      if (cloudMeasurements && cloudMeasurements.length > 0) {
        const merged = [...localMeasurements];
        cloudMeasurements.forEach(cloudMeasurement => {
          const index = merged.findIndex(m => m.id === cloudMeasurement.id);
          if (index >= 0) {
            merged[index] = cloudMeasurement;
          } else {
            merged.push(cloudMeasurement);
          }
        });
        AsyncStorage.setItem(key, JSON.stringify(merged)).catch(console.error);
      }
    }).catch(console.error);
    
    return localMeasurements;
  } catch (e) {
    console.error('Load body measurements error:', e);
    return [];
  }
};

export const saveBodyMeasurements = async (measurements, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save measurements: no user logged in');
      return;
    }
    const key = `body_measurements_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(measurements));
  } catch (e) {
    console.error('Save body measurements error:', e);
  }
};

export const addBodyMeasurement = async (measurement, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot add measurement: no user logged in');
      return;
    }
    const measurements = await loadBodyMeasurements(username);
    const newMeasurement = {
      id: Date.now().toString(),
      timestamp: new Date().getTime(),
      date: new Date().toLocaleDateString(),
      ...measurement
    };
    const updatedMeasurements = [...measurements, newMeasurement];
    await saveBodyMeasurements(updatedMeasurements, username);
  } catch (e) {
    console.error('Add body measurement error:', e);
  }
};

// Social features - followers and following
export const loadSocialData = async (username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      return { followers: [], following: [] };
    }
    const key = `social_data_${username}`;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : { followers: [], following: [] };
  } catch (e) {
    console.error('Load social data error:', e);
    return { followers: [], following: [] };
  }
};

export const saveSocialData = async (socialData, username = null) => {
  try {
    if (!username) {
      username = await getCurrentUser();
    }
    if (!username) {
      console.error('Cannot save social data: no user logged in');
      return;
    }
    const key = `social_data_${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(socialData));
  } catch (e) {
    console.error('Save social data error:', e);
  }
};