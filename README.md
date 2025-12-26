# GymTrackerApp

Mobile fitness tracker built with Expo SDK 54 (React Native 0.81). Tracks workouts and weight per user, shows charts, and lets users manage their profile—all with local, per-user storage.

## Highlights
- Add workouts with weight, cardio toggle, notes, and goal context.
- History list with delete; screens refresh on focus so new entries appear immediately.
- Progress charts (weight trend, workout frequency) scoped to the logged-in user.
- Profile management with shared user profile context and goal weight surfaced in UI.

## Tech stack
- Expo ~54.0.29, React Native 0.81, React 19
- React Navigation (bottom tabs + stack)
- AsyncStorage for per-user data/session
- react-native-chart-kit for charts
- Expo modules: font, linear-gradient, updates

## Architecture at a glance
- `App.js` — providers, navigation, theming.
- `src/context/AuthContext.js` — session/user handling.
- `src/context/UserProfileContext.js` — profile data shared across screens.
- `src/utils/storage.js` — per-user AsyncStorage helpers (`gym_entries_<username>`, `current_user`).
- Screens: `src/screens/*` (Home, AddRecord, Records, Charts, Profile, Setup).
- Config: `app.json`, `appStyle.js`.

## Getting started
```bash
# From project root
npm install

# Start Metro/Expo (uses local Expo CLI)
npm start
# or with cache clear
npx expo start --clear
```

### PowerShell execution policy (Windows)
If scripts are blocked, set once for your user:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Staying compatible with Expo SDK 54
Pinned versions:
- expo ~54.0.29
- expo-font ~14.0.10
- expo-linear-gradient ~15.0.8
- expo-updates ~29.0.15
Reinstall if needed:
```bash
npm install expo@~54.0.29 expo-font@~14.0.10 expo-linear-gradient@~15.0.8 expo-updates@~29.0.15
```

## Data behavior
- Entries are stored per username under `gym_entries_<username>` in AsyncStorage.
- Current user is saved as `current_user`; empty/whitespace usernames are treated as unauthenticated.
- Profile data loads from context first, then storage; `refreshProfile` updates all screens after edits.

## Project scripts
- `npm start` – start Expo dev server
- `npm run android` – start with Android device/emulator
- `npm run ios` – start with iOS simulator (macOS)
- `npm run web` – start web

## Building Android APK

This project uses **Expo Application Services (EAS)** to build installable Android APKs.

### Prerequisites
- Node.js and npm installed
- Expo account (free): https://expo.dev/signup
- EAS CLI installed: `npm install -g eas-cli`

### Step-by-step build process

1. **Login to Expo** (one-time setup):
   ```bash
   npx eas-cli login
   ```

2. **Build the APK** (cloud build - recommended):
   ```bash
   npm run build:apk
   ```
   Or use the direct command:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

3. **Wait for build to complete** (5-10 minutes):
   - The build runs in the cloud on Expo's servers
   - You'll see a progress indicator and a link to view build logs
   - You can press `Ctrl+C` to exit - the build continues in the background

4. **Download your APK**:
   - Once complete, you'll get a download URL like: `https://expo.dev/artifacts/eas/...apk`
   - Click the link or copy the URL to download
   - Or download via PowerShell:
     ```powershell
     Invoke-WebRequest -Uri "YOUR_APK_URL" -OutFile "gym-tracker.apk"
     ```

### Build profiles

- **Preview profile** (APK): `npm run build:apk`
  - Creates an `.apk` file you can install directly on Android devices
  - Good for testing and sharing with users
  
- **Production profile** (AAB): `npm run build:aab`
  - Creates an `.aab` file for Google Play Store submission
  - Required format for Play Store releases

### Important notes

- **After making code changes**, you must rebuild to get a new APK with your updates
- The project includes `.npmrc` with `legacy-peer-deps=true` to handle dependency conflicts
- Builds are tied to your Expo account - check https://expo.dev/accounts/[your-username]/projects/gym-tracker/builds for build history
- First build may take longer; subsequent builds are faster due to caching

### Troubleshooting builds

- **Build fails during dependencies**: Ensure `.npmrc` exists with `legacy-peer-deps=true`
- **Authentication errors**: Run `npx eas-cli login` again
- **Network issues**: Check your internet connection; EAS builds require upload/download

## Troubleshooting
- **Expo fetch failed**: check network/VPN; retry `npm start`, or `npx expo start --offline` if offline.
- **Execution policy**: see the PowerShell section above.
- **New entries not visible**: screens reload on focus; ensure you are logged in so per-user storage resolves correctly.

## Repo
GitHub: https://github.com/Louis121710/GymTrackerApp

