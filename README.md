# GymTrackerApp

Mobile fitness tracker built with Expo SDK 54, React Native 0.81, and React Navigation. Tracks workouts and weight progress per user, with per-user storage in AsyncStorage.

## Key features
- Add workout records with weight, cardio flag, notes, and goal weight context.
- View history and delete entries; screens refresh on focus so new records show immediately.
- Progress charts (weight trend and workout frequency) scoped to the logged-in user.
- Profile management with shared user profile context.

## Tech stack
- Expo ~54.0.29, React Native 0.81, React 19
- React Navigation (bottom tabs/stack)
- AsyncStorage for per-user data and session
- react-native-chart-kit for charts
- Expo modules: font, linear-gradient, updates

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
The project is pinned to:
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
- Current user is saved as `current_user`; empty or whitespace usernames are treated as unauthenticated.
- Profile data loads from context first, then storage, and can be refreshed after edits.

## Project scripts
- `npm start` – start Expo dev server
- `npm run android` – start with Android device/emulator
- `npm run ios` – start with iOS simulator (macOS)
- `npm run web` – start web

## Troubleshooting
- **Expo fetch failed** during startup: check network/VPN; retry `npm start`, or `npx expo start --offline` if offline.
- **Execution policy** errors: see the PowerShell section above.
- **New entries not visible**: screens now reload on focus; ensure you are logged in so per-user storage resolves correctly.

## Repository
GitHub: https://github.com/Louis121710/GymTrackerApp

