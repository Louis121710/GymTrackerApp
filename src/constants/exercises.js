/**
 * Exercise library organized by muscle groups
 * Used across the app for exercise selection and categorization
 */
export const EXERCISE_LIBRARY = {
  'Chest': [
    'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Press',
    'Chest Flyes', 'Cable Crossover', 'Push-ups', 'Dips', 'Pec Deck'
  ],
  'Back': [
    'Deadlift', 'Barbell Row', 'T-Bar Row', 'Lat Pulldown', 'Pull-ups',
    'Chin-ups', 'Cable Row', 'One-Arm Row', 'Face Pulls', 'Shrugs'
  ],
  'Shoulders': [
    'Overhead Press', 'Shoulder Press', 'Lateral Raises', 'Front Raises',
    'Rear Delt Flyes', 'Arnold Press', 'Upright Row', 'Face Pulls'
  ],
  'Biceps': [
    'Bicep Curls', 'Hammer Curls', 'Preacher Curls', 'Cable Curls',
    'Concentration Curls', 'Barbell Curls', 'Incline Curls'
  ],
  'Triceps': [
    'Tricep Dips', 'Close-Grip Bench Press', 'Overhead Extension', 'Skull Crushers',
    'Tricep Pushdowns', 'Diamond Push-ups', 'Kickbacks'
  ],
  'Legs': [
    'Squats', 'Leg Press', 'Leg Curls', 'Leg Extensions', 'Romanian Deadlift',
    'Lunges', 'Calf Raises', 'Bulgarian Split Squats', 'Hack Squats', 'Leg Press'
  ],
  'Core': [
    'Crunches', 'Plank', 'Russian Twists', 'Leg Raises', 'Sit-ups',
    'Mountain Climbers', 'Dead Bug', 'Bicycle Crunches'
  ],
  'Cardio': [
    'Running', 'Cycling', 'Rowing', 'Elliptical', 'Stair Climber',
    'Jump Rope', 'HIIT', 'Swimming'
  ]
};

export const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY).flat();

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const WORKOUT_TYPES = [
  'Chest',
  'Triceps',
  'Back',
  'Biceps',
  'Shoulders',
  'Legs',
  'Full Body',
  'Cardio',
  'Core',
  'Other'
];
