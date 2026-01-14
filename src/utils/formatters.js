/**
 * Utility functions for formatting dates, times, and text
 */

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date label based on time range
 */
export const formatDateLabel = (timestamp, range) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (range === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Get time icon based on time of day
 */
export const getTimeIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'weather-sunny';
  if (hour < 18) return 'weather-partly-cloudy';
  return 'weather-night';
};

/**
 * Format member since date
 */
export const formatMemberSince = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
