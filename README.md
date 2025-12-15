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

## Troubleshooting
- **Expo fetch failed**: check network/VPN; retry `npm start`, or `npx expo start --offline` if offline.
- **Execution policy**: see the PowerShell section above.
- **New entries not visible**: screens reload on focus; ensure you are logged in so per-user storage resolves correctly.

## Repo
GitHub: https://github.com/Louis121710/GymTrackerApp

