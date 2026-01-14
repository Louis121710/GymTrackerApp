import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from './storage';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return db !== null && db !== undefined;
};

// Helper to get user's Firestore document reference
const getUserDocRef = async (userId = null) => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase not available');
  }
  if (!userId) {
    userId = await getCurrentUser();
  }
  if (!userId) {
    throw new Error('No user ID provided');
  }
  return doc(db, 'users', userId);
};

// Helper to get user's subcollection reference
const getUserCollectionRef = async (collectionName, userId = null) => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase not available');
  }
  if (!userId) {
    userId = await getCurrentUser();
  }
  if (!userId) {
    throw new Error('No user ID provided');
  }
  const userDocRef = await getUserDocRef(userId);
  return collection(userDocRef, collectionName);
};

// Convert Firestore timestamp to JS timestamp
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().getTime();
  }
  if (timestamp.seconds) {
    return timestamp.seconds * 1000;
  }
  return timestamp;
};

// Convert data for Firestore (handle timestamps)
const prepareForFirestore = (data) => {
  const prepared = { ...data };
  if (prepared.timestamp && typeof prepared.timestamp === 'number') {
    prepared.timestamp = Timestamp.fromMillis(prepared.timestamp);
  }
  if (prepared.date && typeof prepared.date === 'string') {
    // Keep date as string, Firestore can handle it
  }
  return prepared;
};

// Convert data from Firestore (handle timestamps)
const prepareFromFirestore = (data) => {
  const prepared = { ...data };
  if (prepared.timestamp) {
    prepared.timestamp = convertTimestamp(prepared.timestamp);
  }
  return prepared;
};

// ============ USER PROFILE ============

export const saveUserProfileToFirebase = async (userData, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const userDocRef = await getUserDocRef(userId);
    const profileData = {
      ...userData,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(userDocRef, profileData, { merge: true });
    console.log('User profile saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving user profile to Firebase:', error);
    return false;
  }
};

export const loadUserProfileFromFirebase = async (userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return null;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return null;
    }

    const userDocRef = await getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return prepareFromFirestore(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile from Firebase:', error);
    return null;
  }
};

// ============ WORKOUT ENTRIES ============

export const saveEntriesToFirebase = async (entries, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const entriesRef = await getUserCollectionRef('entries', userId);
    
    // Save each entry as a document
    const safeEntries = Array.isArray(entries) ? entries : [];
    const promises = safeEntries.map(async (entry) => {
      const entryRef = doc(entriesRef, entry.id);
      const preparedEntry = prepareForFirestore(entry);
      await setDoc(entryRef, preparedEntry, { merge: true });
    });
    
    await Promise.all(promises);
    console.log('Entries saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving entries to Firebase:', error);
    return false;
  }
};

export const loadEntriesFromFirebase = async (userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return [];
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return [];
    }

    const entriesRef = await getUserCollectionRef('entries', userId);
    const querySnapshot = await getDocs(entriesRef);
    
    const entries = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push(prepareFromFirestore({ ...data, id: doc.id }));
    });
    
    // Sort by timestamp
    entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return entries;
  } catch (error) {
    console.error('Error loading entries from Firebase:', error);
    return [];
  }
};

export const addEntryToFirebase = async (entry, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const entriesRef = await getUserCollectionRef('entries', userId);
    const entryRef = doc(entriesRef, entry.id);
    const preparedEntry = prepareForFirestore(entry);
    
    await setDoc(entryRef, preparedEntry);
    console.log('Entry added to Firebase');
    return true;
  } catch (error) {
    console.error('Error adding entry to Firebase:', error);
    return false;
  }
};

export const deleteEntryFromFirebase = async (entryId, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const entriesRef = await getUserCollectionRef('entries', userId);
    const entryRef = doc(entriesRef, entryId);
    
    await deleteDoc(entryRef);
    console.log('Entry deleted from Firebase');
    return true;
  } catch (error) {
    console.error('Error deleting entry from Firebase:', error);
    return false;
  }
};

// ============ WORKOUT LOGS ============

export const saveWorkoutLogsToFirebase = async (logs, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const logsRef = await getUserCollectionRef('workoutLogs', userId);
    
    const safeLogs = Array.isArray(logs) ? logs : [];
    const promises = safeLogs.map(async (log) => {
      const logRef = doc(logsRef, log.id);
      const preparedLog = prepareForFirestore(log);
      await setDoc(logRef, preparedLog, { merge: true });
    });
    
    await Promise.all(promises);
    console.log('Workout logs saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving workout logs to Firebase:', error);
    return false;
  }
};

export const loadWorkoutLogsFromFirebase = async (userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return [];
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return [];
    }

    const logsRef = await getUserCollectionRef('workoutLogs', userId);
    const querySnapshot = await getDocs(logsRef);
    
    const logs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push(prepareFromFirestore({ ...data, id: doc.id }));
    });
    
    logs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return logs;
  } catch (error) {
    console.error('Error loading workout logs from Firebase:', error);
    return [];
  }
};

export const addWorkoutLogToFirebase = async (log, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const logsRef = await getUserCollectionRef('workoutLogs', userId);
    const logRef = doc(logsRef, log.id);
    const preparedLog = prepareForFirestore(log);
    
    await setDoc(logRef, preparedLog);
    console.log('Workout log added to Firebase');
    return true;
  } catch (error) {
    console.error('Error adding workout log to Firebase:', error);
    return false;
  }
};

// ============ BODY MEASUREMENTS ============

export const saveBodyMeasurementsToFirebase = async (measurements, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const measurementsRef = await getUserCollectionRef('bodyMeasurements', userId);
    
    const promises = measurements.map(async (measurement) => {
      const measurementRef = doc(measurementsRef, measurement.id);
      const preparedMeasurement = prepareForFirestore(measurement);
      await setDoc(measurementRef, preparedMeasurement, { merge: true });
    });
    
    await Promise.all(promises);
    console.log('Body measurements saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving body measurements to Firebase:', error);
    return false;
  }
};

export const loadBodyMeasurementsFromFirebase = async (userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return [];
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return [];
    }

    const measurementsRef = await getUserCollectionRef('bodyMeasurements', userId);
    const querySnapshot = await getDocs(measurementsRef);
    
    const measurements = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      measurements.push(prepareFromFirestore({ ...data, id: doc.id }));
    });
    
    measurements.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return measurements;
  } catch (error) {
    console.error('Error loading body measurements from Firebase:', error);
    return [];
  }
};

// ============ PERSONAL RECORDS ============

export const savePersonalRecordsToFirebase = async (records, userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const userDocRef = await getUserDocRef(userId);
    
    await setDoc(userDocRef, { personalRecords: records }, { merge: true });
    console.log('Personal records saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving personal records to Firebase:', error);
    return false;
  }
};

export const loadPersonalRecordsFromFirebase = async (userId = null) => {
  try {
    if (!isFirebaseAvailable()) {
      return {};
    }
    
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return {};
    }

    const userDocRef = await getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.personalRecords || {};
    }
    return {};
  } catch (error) {
    console.error('Error loading personal records from Firebase:', error);
    return {};
  }
};

// ============ SYNC FUNCTIONS ============

export const syncAllDataToFirebase = async (userId = null) => {
  try {
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return false;
    }

    // Import local storage functions
    const { 
      loadEntries, 
      loadWorkoutLogs, 
      loadBodyMeasurements, 
      loadPersonalRecords,
      loadUsers
    } = await import('./storage');

    // Load all local data
    const entries = await loadEntries(userId);
    const workoutLogs = await loadWorkoutLogs(userId);
    const bodyMeasurements = await loadBodyMeasurements(userId);
    const personalRecords = await loadPersonalRecords(userId);
    const users = await loadUsers();
    const userProfile = users.find(u => u.username === userId);

    // Save all to Firebase
    if (entries.length > 0) {
      await saveEntriesToFirebase(entries, userId);
    }
    if (workoutLogs.length > 0) {
      await saveWorkoutLogsToFirebase(workoutLogs, userId);
    }
    if (bodyMeasurements.length > 0) {
      await saveBodyMeasurementsToFirebase(bodyMeasurements, userId);
    }
    if (Object.keys(personalRecords).length > 0) {
      await savePersonalRecordsToFirebase(personalRecords, userId);
    }
    if (userProfile) {
      await saveUserProfileToFirebase(userProfile, userId);
    }

    console.log('All data synced to Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing data to Firebase:', error);
    return false;
  }
};

export const syncAllDataFromFirebase = async (userId = null) => {
  try {
    if (!userId) {
      userId = await getCurrentUser();
    }
    if (!userId) {
      return false;
    }

    // Import local storage functions
    const { 
      saveEntries, 
      saveWorkoutLogs, 
      saveBodyMeasurements, 
      savePersonalRecords,
      saveUsers
    } = await import('./storage');

    // Load all from Firebase
    const entries = await loadEntriesFromFirebase(userId);
    const workoutLogs = await loadWorkoutLogsFromFirebase(userId);
    const bodyMeasurements = await loadBodyMeasurementsFromFirebase(userId);
    const personalRecords = await loadPersonalRecordsFromFirebase(userId);
    const userProfile = await loadUserProfileFromFirebase(userId);

    // Merge with local data (Firebase takes precedence for conflicts)
    if (entries.length > 0) {
      const localEntries = await (await import('./storage')).loadEntries(userId);
      const mergedEntries = [...localEntries];
      
      entries.forEach(cloudEntry => {
        const index = mergedEntries.findIndex(e => e.id === cloudEntry.id);
        if (index >= 0) {
          // Cloud data takes precedence
          mergedEntries[index] = cloudEntry;
        } else {
          mergedEntries.push(cloudEntry);
        }
      });
      
      await saveEntries(mergedEntries, userId);
    }

    if (workoutLogs.length > 0) {
      const localLogs = await (await import('./storage')).loadWorkoutLogs(userId);
      const mergedLogs = [...localLogs];
      
      workoutLogs.forEach(cloudLog => {
        const index = mergedLogs.findIndex(l => l.id === cloudLog.id);
        if (index >= 0) {
          mergedLogs[index] = cloudLog;
        } else {
          mergedLogs.push(cloudLog);
        }
      });
      
      await saveWorkoutLogs(mergedLogs, userId);
    }

    if (bodyMeasurements.length > 0) {
      await saveBodyMeasurements(bodyMeasurements, userId);
    }

    if (Object.keys(personalRecords).length > 0) {
      await savePersonalRecords(personalRecords, userId);
    }

    if (userProfile) {
      const users = await (await import('./storage')).loadUsers();
      const updatedUsers = users.map(u => 
        u.username === userId ? { ...u, ...userProfile } : u
      );
      await saveUsers(updatedUsers);
    }

    console.log('All data synced from Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing data from Firebase:', error);
    return false;
  }
};
