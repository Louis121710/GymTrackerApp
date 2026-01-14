/**
 * Utility functions for workout calculations
 * Includes volume, 1RM, and exercise statistics calculations
 */

/**
 * Calculate total volume for a single exercise (weight × reps for all sets)
 */
export const calculateExerciseVolume = (exercise) => {
  if (!exercise.sets || !Array.isArray(exercise.sets)) return 0;
  return exercise.sets.reduce((total, set) => {
    const weight = parseFloat(set.weight) || 0;
    const reps = parseFloat(set.reps) || 0;
    return total + (weight * reps);
  }, 0);
};

/**
 * Calculate total volume for all exercises in a workout
 */
export const calculateTotalVolume = (exercises) => {
  if (!Array.isArray(exercises)) return 0;
  return exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
};

/**
 * Calculate estimated one-rep max using Epley formula
 * Formula: 1RM = weight × (1 + reps/30)
 */
export const calculateOneRepMax = (weight, reps) => {
  if (!weight || !reps || reps === 0) return 0;
  return weight * (1 + reps / 30);
};
