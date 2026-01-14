# Gym Tracker App

A mobile fitness tracking app built with React Native and Expo. Track your workouts, monitor your weight progress, and stay motivated on your fitness journey.

## What It Does

This app helps you:
- **Track your weight** - Log your daily weight and see your progress over time
- **Record workouts** - Save your workout sessions with exercises, sets, reps, and weights
- **View statistics** - See charts and graphs of your progress, workout volume, and exercise trends
- **Set goals** - Define your fitness goals and track how close you are to achieving them
- **Build routines** - Create custom workout templates for different days of the week
- **Track streaks** - See how consistent you've been with your fitness routine

## Features

### Home Dashboard
- Daily motivational quotes
- Quick stats overview (streaks, total records, longest streak)
- Quick actions to add records or view stats

### Records
- Add weight entries with optional cardio tracking and notes
- View your weight history in a clean list
- Edit or delete previous entries
- See progress towards your goal weight

### Workouts
- Create custom workout templates
- Log completed workouts with all exercises, sets, and reps
- View workout history
- Track personal records for each exercise

### Statistics
- Weight progress charts over time
- Workout volume progression
- Exercise-specific charts (weight, reps, volume)
- Personal records tracking

### Profile
- Set your fitness goals (lose weight, gain muscle, maintain)
- View your stats and achievements
- Calendar view showing when you logged workouts or weight
- Customize your profile information

## Tech Stack

- **React Native** with Expo SDK 54
- **React Navigation** for navigation
- **AsyncStorage** for local data storage
- **Firebase** for cloud sync (optional)
- **react-native-chart-kit** for charts and graphs

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Scan the QR code with Expo Go app or run on an emulator

## Building the App

To build an APK for Android:
```bash
npm run build:apk
```

The app uses EAS Build for production builds. Make sure you have EAS CLI installed and configured.

## Project Structure

```
src/
  ├── screens/          # Main app screens
  ├── components/       # Reusable components
  ├── navigation/       # Navigation setup
  ├── context/         # React context providers
  ├── utils/           # Helper functions and storage
  ├── hooks/           # Custom React hooks
  └── constants/       # App constants and data
```

## Notes

- Data is stored locally on your device using AsyncStorage
- Firebase integration is optional for cloud sync
- The app supports multiple user accounts with separate data storage
- All data is stored per-user, so each account has its own workout history and progress

## License

This project is for personal use.
