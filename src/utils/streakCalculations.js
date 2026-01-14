/**
 * Streak Calculation Utilities
 * 
 * Calculates workout streaks based on weekly entries.
 * A week qualifies for a streak point if it has at least 3 unique days with entries.
 * Multiple entries on the same day only count as one day.
 */

/**
 * Parse a date string that might be in localized format (MM/DD/YYYY, DD/MM/YYYY, etc.)
 * Handles various date formats and returns a Date object or null if parsing fails
 * 
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} Parsed date object or null if parsing fails
 */
const parseDateString = (dateString) => {
  if (!dateString) return null;
  
  // First try direct parsing
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    // Verify it's a reasonable date (not year 1970 or far future)
    const year = date.getFullYear();
    if (year >= 2020 && year <= 2100) {
      return date;
    }
  }
  
  // Try parsing common formats: MM/DD/YYYY or DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const part1 = parseInt(parts[0], 10);
    const part2 = parseInt(parts[1], 10);
    const part3 = parseInt(parts[2], 10);
    
    // Determine format: if part1 > 12, it's likely DD/MM/YYYY
    if (part1 > 12 && part2 <= 12) {
      // DD/MM/YYYY format
      const day = part1;
      const month = part2 - 1; // Month is 0-indexed
      const year = part3;
      date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
        return date;
      }
    } else if (part1 <= 12 && part2 <= 12) {
      // Could be either format, try MM/DD/YYYY first (US format)
      const month = part1 - 1;
      const day = part2;
      const year = part3;
      date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
        return date;
      }
      
      // Try DD/MM/YYYY as fallback
      const day2 = part1;
      const month2 = part2 - 1;
      const year2 = part3;
      date = new Date(year2, month2, day2);
      if (!isNaN(date.getTime()) && date.getMonth() === month2 && date.getDate() === day2 && date.getFullYear() === year2) {
        return date;
      }
    } else {
      // Try MM/DD/YYYY first (US format)
      const month = part1 - 1;
      const day = part2;
      const year = part3;
      date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
        return date;
      }
    }
  }
  
  // Try other formats like YYYY-MM-DD
  date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    if (year >= 2020 && year <= 2100) {
      return date;
    }
  }
  
  return null;
};

/**
 * Calculate workout streak based on weekly entries
 * 
 * Rules:
 * - A week qualifies if it has at least 3 unique days with entries
 * - Multiple entries on the same day only count as one day
 * - Streaks are calculated based on consecutive qualifying weeks
 * 
 * @param {Array} entries - Array of workout entry objects with date and/or timestamp
 * @returns {Object} Object with currentStreak and longestStreak properties
 */
export const calculateStreak = (entries) => {
  try {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    /**
     * Get the start of the week (Monday) for a given date
     * @param {Date} date - The date to get the week start for
     * @returns {Date} The Monday of that week
     */
    const getWeekStart = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const weekStart = new Date(d);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    };

    /**
     * Get entry date - prefer timestamp if available (more reliable)
     * @param {Object} entry - Entry object with date and/or timestamp
     * @returns {Date|null} Parsed date or null
     */
    const getEntryDate = (entry) => {
      // First try timestamp if available (most reliable)
      if (entry.timestamp) {
        return new Date(entry.timestamp);
      }
      // Otherwise parse the date string
      if (entry.date) {
        return parseDateString(entry.date);
      }
      return null;
    };

    /**
     * Get unique days in a week (one entry per day max)
     * @param {Date} weekStart - Start of the week (Monday)
     * @param {Array} allEntries - All entries to check
     * @returns {number} Number of unique days with entries in the week
     */
    const getWeekUniqueDays = (weekStart, allEntries) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Get all entries in the week
      const weekEntries = (Array.isArray(allEntries) ? allEntries : []).filter(entry => {
        if (!entry) return false;
        const entryDate = getEntryDate(entry);
        if (!entryDate) return false;
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      // Get unique days (one entry per day - use the date string without time)
      const uniqueDays = new Set();
      weekEntries.forEach(entry => {
        const entryDate = getEntryDate(entry);
        if (entryDate) {
          // Create a date string without time (YYYY-MM-DD) to track unique days
          const dayKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
          uniqueDays.add(dayKey);
        }
      });
      
      return uniqueDays.size;
    };

    // Group entries by week and count unique days per week
    const weekMap = new Map();
    (Array.isArray(entries) ? entries : []).forEach(entry => {
      if (!entry) return;
      const entryDate = getEntryDate(entry);
      if (!entryDate) return;
      
      const weekStart = getWeekStart(entryDate);
      const weekKey = weekStart.getTime();
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, new Set());
      }
      const uniqueDaysSet = weekMap.get(weekKey);
      if (uniqueDaysSet instanceof Set) {
        // Create a date string without time (YYYY-MM-DD) to track unique days
        const dayKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
        uniqueDaysSet.add(dayKey);
      }
    });

    // Get all weeks that have at least 3 unique days, sorted by date (newest first)
    const weekEntries = Array.from(weekMap.entries());
    const filteredWeeks = (Array.isArray(weekEntries) ? weekEntries : []).filter(([_, uniqueDaysSet]) => 
      uniqueDaysSet instanceof Set && uniqueDaysSet.size >= 3
    );
    const validWeeks = (Array.isArray(filteredWeeks) ? filteredWeeks : []).map(([weekKey, _]) => new Date(weekKey))
      .sort((a, b) => b - a);

    if (validWeeks.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Calculate current streak (consecutive weeks from current week backwards)
    let currentStreak = 0;
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    
    // Check if current week qualifies (at least 3 unique days)
    const currentWeekUniqueDays = getWeekUniqueDays(currentWeekStart, entries);
    
    if (currentWeekUniqueDays >= 3) {
      currentStreak = 1;
      
      // Count backwards through consecutive weeks
      let checkWeek = new Date(currentWeekStart);
      checkWeek.setDate(checkWeek.getDate() - 7);
      
      while (validWeeks.some(week => {
        const weekStart = getWeekStart(week);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.getTime() === checkWeek.getTime();
      })) {
        currentStreak++;
        checkWeek.setDate(checkWeek.getDate() - 7);
      }
    }

    // Calculate longest streak (all time)
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < validWeeks.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevWeek = getWeekStart(validWeeks[i - 1]);
        const currentWeek = getWeekStart(validWeeks[i]);
        const diffDays = Math.floor((prevWeek - currentWeek) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 7) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Get motivational streak message based on streak count
 * 
 * @param {number} streak - The current streak count
 * @returns {string} Motivational message
 */
export const getStreakMessage = (streak) => {
  if (streak === 0) return 'Start your journey!';
  if (streak === 1) return 'Great start!';
  if (streak <= 3) return 'Building momentum!';
  if (streak <= 7) return 'On fire! 🔥';
  if (streak <= 12) return 'Unstoppable! 💪';
  if (streak <= 24) return 'Legendary! 🏆';
  return 'Godlike! ⚡';
};
