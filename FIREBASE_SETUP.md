# Firebase Setup Guide

This app now supports cloud storage using Firebase! Your data will be automatically synced across all your devices.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "Gym Tracker")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Add iOS and Android Apps

### For Android:
1. In Firebase Console, click the Android icon (or "Add app")
2. Register app:
   - **Android package name**: `com.louis121710.gymtracker` (from `app.json`)
   - **App nickname**: "Gym Tracker Android" (optional)
   - **Debug signing certificate**: Leave blank for now
3. Click "Register app"
4. Download `google-services.json` (we'll add this later if needed)

### For iOS:
1. In Firebase Console, click the iOS icon (or "Add app")
2. Register app:
   - **iOS bundle ID**: `com.louis121710.gymtracker` (from `app.json`)
   - **App nickname**: "Gym Tracker iOS" (optional)
3. Click "Register app"
4. Download `GoogleService-Info.plist` (we'll add this later if needed)

## Step 3: Enable Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Enable"

### Set up Security Rules (Important!)

Go to Firestore Database > Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's subcollections
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /workoutLogs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /bodyMeasurements/{measurementId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /personalRecords {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

**Note**: For now, the app uses username-based auth (not Firebase Auth), so you can use these rules temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for now (will update when we add Firebase Auth)
    match /users/{userId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 4: Get Your Firebase Config

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on your web app (or create one if you don't have it)
4. Copy the Firebase configuration object

## Step 5: Update Firebase Config in App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Test the Integration

1. Start your app: `npm start`
2. Log in with an existing account
3. Add a workout entry
4. Check Firebase Console > Firestore Database to see if data appears

## How It Works

### Hybrid Storage System

The app uses a **hybrid approach**:

1. **Local Storage (AsyncStorage)**: 
   - Saves data immediately (fast, works offline)
   - Always available, even without internet

2. **Cloud Storage (Firebase)**:
   - Syncs in the background
   - Backs up your data
   - Syncs across devices

### Data Flow

- **When you save data**: 
  - Saves to local storage first (instant)
  - Syncs to Firebase in background (non-blocking)

- **When you load data**:
  - Loads from local storage first (fast)
  - Syncs from Firebase in background
  - Merges cloud data with local data

### Automatic Sync

- Data syncs automatically when:
  - You log in
  - You save new entries
  - App starts (background sync)

## Troubleshooting

### Firebase not initializing?
- Check your config values in `src/config/firebase.js`
- Make sure Firestore is enabled in Firebase Console
- Check console for error messages

### Data not syncing?
- Check internet connection
- Verify Firestore security rules allow read/write
- Check Firebase Console for any errors
- App will still work with local storage if Firebase fails

### Want to disable Firebase?
- The app works fine with local storage only
- Firebase sync is non-blocking
- If Firebase fails, app continues with local storage

## Next Steps (Optional)

1. **Enable Firebase Authentication**: 
   - Replace username/password with Firebase Auth
   - Better security and password recovery

2. **Add Real-time Sync**:
   - Use Firestore listeners for real-time updates
   - See changes instantly across devices

3. **Add Offline Persistence**:
   - Enable Firestore offline persistence
   - Better offline experience

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Check app console logs
3. Verify your Firebase config is correct
4. Ensure Firestore is enabled and rules are set