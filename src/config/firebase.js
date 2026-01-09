import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Option 1: Use environment variables (recommended for production)
// Option 2: Replace the values below with your Firebase config
// Get your config from: Firebase Console > Project Settings > General > Your apps

const getFirebaseConfig = () => {
  // Check if config is provided via environment variables (Expo)
  const configFromEnv = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  // If environment variables are set, use them
  if (configFromEnv.apiKey && configFromEnv.projectId) {
    return configFromEnv;
  }

  // Otherwise, use hardcoded config
  return {
    apiKey: "AIzaSyCCkMJy7Kob1damjZ8elE_3eQcORkjEl3Y",
    authDomain: "gym-tracker-e8e1c.firebaseapp.com",
    projectId: "gym-tracker-e8e1c",
    storageBucket: "gym-tracker-e8e1c.firebasestorage.app",
    messagingSenderId: "536046151450",
    appId: "1:536046151450:web:e74ceb7c2aae943eae6ea3"
  };
};

const firebaseConfig = getFirebaseConfig();

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== "YOUR_API_KEY" &&
         firebaseConfig.projectId && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
let isInitialized = false;

const initializeFirebase = () => {
  if (isInitialized) {
    return { app, auth, db, storage, isConfigured: isFirebaseConfigured() };
  }

  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. App will use local storage only.');
    console.warn('📝 To enable cloud sync, update src/config/firebase.js with your Firebase config');
    console.warn('📖 See FIREBASE_SETUP.md for setup instructions');
    isInitialized = true;
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }

  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Storage (for future use if needed)
    storage = getStorage(app);
    
    isInitialized = true;
    console.log('✅ Firebase initialized successfully');
    return { app, auth, db, storage, isConfigured: true };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ App will continue with local storage only');
    isInitialized = true;
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }
};

// Initialize on import
const firebase = initializeFirebase();

export { app, auth, db, storage };
export default firebase;
