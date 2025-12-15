# Contributing

Quick notes for working on this project.

## Setup
```bash
npm install
npm start            # Expo dev server
# or
npx expo start --clear
```

Windows execution policy (if scripts are blocked):
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Coding guidelines
- Keep components small and focused.
- Prefer functional components and hooks.
- Keep comments purposeful and minimal; name things clearly instead.
- Follow existing styling in `appStyle.js`.

## Data rules
- Entries are per user: stored under `gym_entries_<username>` in AsyncStorage.
- `current_user` must be non-empty; otherwise treat as signed out.
- Use `refreshProfile` after profile updates so dependent screens refresh.

## Testing/verify
- Basic run: `npm start` then open on device/emulator/web.
- If you change storage or auth flows, smoke test add/view/delete entries and profile updates.

## Version alignment
- Expo SDK 54 pinned: see `package.json` for versions (expo ~54.0.29).
- If deps drift, reinstall with the pinned versions listed in the README.

