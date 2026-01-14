import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getCurrentUser,
  loadCustomExercises,
  addCustomExercise,
  loadPersonalRecords,
  saveCustomWorkout,
  updateCustomWorkout,
  deleteCustomWorkout,
  addWorkoutLog
} from '../utils/storage';
import { calculateTotalVolume } from '../utils/workoutCalculations';

/**
 * Custom hook for managing workout data operations
 * Handles custom exercises, personal records, and workout CRUD operations
 * 
 * @returns {Object} Workout data state and management functions
 */
export const useWorkoutData = () => {
  const [customExercises, setCustomExercises] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});

  useEffect(() => {
    loadCustomExercisesList();
    loadPersonalRecordsData();
  }, []);

  /**
   * Load custom exercises from storage
   */
  const loadCustomExercisesList = async () => {
    try {
      const exercises = await loadCustomExercises();
      setCustomExercises(Array.isArray(exercises) ? exercises : []);
    } catch (error) {
      console.error('Error loading custom exercises:', error);
      setCustomExercises([]);
    }
  };

  /**
   * Load personal records for current user
   */
  const loadPersonalRecordsData = async () => {
    try {
      const username = await getCurrentUser();
      if (username) {
        const prs = await loadPersonalRecords(username);
        setPersonalRecords(prs || {});
      } else {
        setPersonalRecords({});
      }
    } catch (error) {
      console.error('Error loading personal records:', error);
      setPersonalRecords({});
    }
  };

  /**
   * Save a custom exercise to the global database
   * @param {string} exerciseName - Name of the exercise to save
   * @returns {Promise<boolean>} Success status
   */
  const saveCustomExercise = async (exerciseName) => {
    try {
      const success = await addCustomExercise(exerciseName);
      if (success) {
        await loadCustomExercisesList();
        Alert.alert('Success', `"${exerciseName}" has been added to the global exercise database!`);
        return true;
      } else {
        Alert.alert('Info', 'This exercise already exists in the database');
        return false;
      }
    } catch (error) {
      console.error('Error saving custom exercise:', error);
      Alert.alert('Error', 'Failed to save exercise');
      return false;
    }
  };

  /**
   * Get personal record for a specific exercise
   * @param {string} exerciseName - Name of the exercise
   * @returns {Object|null} Personal record or null
   */
  const getExercisePR = (exerciseName) => {
    if (!exerciseName) return null;
    return personalRecords[exerciseName.toLowerCase()] || null;
  };

  /**
   * Save a workout template
   * @param {Object} workout - Workout object to save
   * @returns {Promise<boolean>} Success status
   */
  const saveWorkoutTemplate = async (workout) => {
    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save workouts');
        return false;
      }

      await saveCustomWorkout(workout, username);
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
      return false;
    }
  };

  /**
   * Update an existing workout template
   * @param {string} workoutId - ID of workout to update
   * @param {Object} updatedWorkout - Updated workout object
   * @returns {Promise<boolean>} Success status
   */
  const updateWorkoutTemplate = async (workoutId, updatedWorkout) => {
    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to update workouts');
        return false;
      }

      await updateCustomWorkout(workoutId, updatedWorkout, username);
      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      Alert.alert('Error', 'Failed to update workout');
      return false;
    }
  };

  /**
   * Delete a workout template
   * @param {string} workoutId - ID of workout to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteWorkoutTemplate = async (workoutId) => {
    try {
      await deleteCustomWorkout(workoutId);
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      Alert.alert('Error', 'Failed to delete workout');
      return false;
    }
  };

  /**
   * Log a completed workout
   * @param {Object} workoutLog - Workout log object
   * @returns {Promise<boolean>} Success status
   */
  const logWorkout = async (workoutLog) => {
    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to log workouts');
        return false;
      }

      // Calculate total volume if not provided
      if (!workoutLog.totalVolume && workoutLog.exercises) {
        workoutLog.totalVolume = calculateTotalVolume(workoutLog.exercises);
      }

      await addWorkoutLog(workoutLog, username);
      await loadPersonalRecordsData();
      return true;
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout');
      return false;
    }
  };

  return {
    customExercises,
    personalRecords,
    loadCustomExercisesList,
    loadPersonalRecordsData,
    saveCustomExercise,
    getExercisePR,
    saveWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    logWorkout
  };
};
