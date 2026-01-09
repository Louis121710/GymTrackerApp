# Quick Firebase Setup Guide

Follow these steps to configure Firebase for your Gym Tracker app:

## Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Gym Tracker"** (or any name you prefer)
4. Click **"Continue"**
5. (Optional) Enable Google Analytics - you can skip this
6. Click **"Create project"**
7. Wait for project creation, then click **"Continue"**

## Step 2: Enable Firestore Database (2 minutes)

1. In Firebase Console, click **"Build"** in the left menu
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Select **"Start in test mode"** (for development)
5. Choose a location (pick the closest to you)
6. Click **"Enable"**

### Set Security Rules (Important!)

1. In Firestore Database, click the **"Rules"** tab
2. Replace the rules with this (allows read/write for now):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

## Step 3: Get Your Firebase Config (2 minutes)

1. In Firebase Console, click the **gear icon** ⚙️ (top left)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app, click **"</>"** (web icon) to add one
5. Register your app:
   - **App nickname**: "Gym Tracker Web" (optional)
   - Click **"Register app"**
6. You'll see your Firebase configuration object - **COPY IT!**

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Add Config to Your App (1 minute)

### Option A: Direct Config (Easiest)

1. Open `src/config/firebase.js`
2. Find the `firebaseConfig` object
3. Replace all the `YOUR_*` values with your actual Firebase config values
4. Save the file

### Option B: Environment Variables (Recommended for Production)

1. Create a `.env` file in the root directory (same level as `package.json`)
2. Add your Firebase config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Replace the values with your actual Firebase config
4. The `.env` file is already in `.gitignore` so it won't be committed

## Step 5: Test It! (1 minute)

1. Start your app: `npm start`
2. Log in with an account
3. Add a workout entry
4. Check Firebase Console > Firestore Database
5. You should see a `users` collection with your data!

## ✅ Done!

Your app now syncs data to Firebase! 

### What Happens Now:

- ✅ All data saves locally first (fast, works offline)
- ✅ Data automatically syncs to Firebase in background
- ✅ Data syncs across all your devices
- ✅ Your data is backed up in the cloud

### Troubleshooting

**Firebase not working?**
- Check console for error messages
- Verify your config values are correct
- Make sure Firestore is enabled
- App will still work with local storage if Firebase fails

**Data not appearing in Firebase?**
- Check internet connection
- Verify Firestore security rules allow read/write
- Check browser console for errors

## Next Steps (Optional)

- **Add Firebase Authentication**: Replace username/password with Firebase Auth
- **Improve Security Rules**: Add proper authentication checks
- **Enable Offline Persistence**: Better offline experience

Need help? Check `FIREBASE_SETUP.md` for detailed instructions.
