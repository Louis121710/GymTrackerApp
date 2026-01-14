/**
 * Utility functions for calculating progress percentages and text
 */

/**
 * Calculate progress percentage based on goal type (lose/gain/maintain weight)
 */
export const getProgressPercentage = (currentWeight, goalWeight, goal, entries) => {
  if (!currentWeight || !goalWeight) return 0;

  // For weight loss goal (current > goal)
  if (goal === 'lose_weight') {
    if (currentWeight <= goalWeight) {
      return 100; // Goal achieved
    } else {
      const startingWeight = (Array.isArray(entries) && entries.length > 0) ? entries[0].body_weight : currentWeight;
      const totalToLose = startingWeight - goalWeight;
      const lostSoFar = startingWeight - currentWeight;

      if (totalToLose <= 0) return 100;
      return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    }
  }
  // For weight gain goal (current < goal)
  else if (goal === 'gain_muscle') {
    if (currentWeight >= goalWeight) {
      return 100;
    } else {
      const startingWeight = (Array.isArray(entries) && entries.length > 0) ? entries[0].body_weight : currentWeight;
      const totalToGain = goalWeight - startingWeight;
      const gainedSoFar = currentWeight - startingWeight;

      if (totalToGain <= 0) return 100;
      return Math.min(100, Math.max(0, (gainedSoFar / totalToGain) * 100));
    }
  }
  // For maintain goal
  else {
    return currentWeight === goalWeight ? 100 : 50;
  }
};

/**
 * Get progress text based on goal and current progress
 */
export const getProgressText = (currentWeight, goalWeight, goal) => {
  if (!currentWeight || !goalWeight) return 'Start tracking to see progress';

  const difference = currentWeight - goalWeight;

  if (goal === 'lose_weight') {
    if (difference > 0) {
      return `${difference.toFixed(1)}kg to lose`;
    } else if (difference < 0) {
      return `${Math.abs(difference).toFixed(1)}kg below goal`;
    } else {
      return 'Goal achieved! 🎉';
    }
  } else if (goal === 'gain_muscle') {
    if (difference < 0) {
      return `${Math.abs(difference).toFixed(1)}kg to gain`;
    } else if (difference > 0) {
      return `${difference.toFixed(1)}kg above goal`;
    } else {
      return 'Goal achieved! 🎉';
    }
  } else {
    if (difference === 0) {
      return 'Perfectly maintaining! 🎉';
    } else {
      return `${Math.abs(difference).toFixed(1)}kg from target`;
    }
  }
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (progress) => {
  if (progress >= 100) return '#22C55E';
  if (progress >= 75) return '#F87171';
  if (progress >= 50) return '#EF4444';
  if (progress >= 25) return '#DC2626';
  return '#991B1B';
};
