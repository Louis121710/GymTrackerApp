import { useState } from 'react';
import { Alert } from 'react-native';
import { EXERCISE_LIBRARY } from '../constants/exercises';

const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY).flat();

/**
 * Custom hook for managing exercise operations in workout creation
 * Handles adding, editing, deleting exercises and custom exercise prompts
 * 
 * @param {Array} customExercises - Array of custom exercises from database
 * @param {Function} onSaveCustomExercise - Callback to save custom exercise
 * @returns {Object} Exercise management state and functions
 */
export const useExerciseManagement = (customExercises = [], onSaveCustomExercise) => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '' });
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [showSaveExercisePrompt, setShowSaveExercisePrompt] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');

  /**
   * Add an exercise to the workout template
   * @param {boolean} skipPrompt - Skip the save prompt for custom exercises
   */
  const handleAddExercise = async (skipPrompt = false) => {
    if (!newExercise.name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const exerciseName = newExercise.name.trim();
    const safeCustomExercises = Array.isArray(customExercises) ? customExercises : [];
    const isCustomExercise = !COMMON_EXERCISES.includes(exerciseName) && 
                             !safeCustomExercises.some(ex => ex.toLowerCase() === exerciseName.toLowerCase());

    // If it's a new custom exercise and we haven't shown the prompt, offer to save it
    if (isCustomExercise && !skipPrompt && !showSaveExercisePrompt && onSaveCustomExercise) {
      setShowSaveExercisePrompt(true);
      return;
    }

    // Just save the exercise name for the template
    const exercise = {
      name: exerciseName
    };

    if (editingExerciseIndex !== null) {
      const safeExercises = Array.isArray(exercises) ? exercises : [];
      const updatedExercises = [...safeExercises];
      updatedExercises[editingExerciseIndex] = exercise;
      setExercises(updatedExercises);
      setEditingExerciseIndex(null);
    } else {
      const safeExercises = Array.isArray(exercises) ? exercises : [];
      setExercises([...safeExercises, exercise]);
    }

    setNewExercise({ name: '' });
    setCustomExerciseName('');
    setShowSaveExercisePrompt(false);
  };

  /**
   * Save custom exercise to database and continue adding
   */
  const handleSaveCustomExercise = async () => {
    const exerciseName = newExercise.name.trim();
    if (onSaveCustomExercise) {
      const success = await onSaveCustomExercise(exerciseName);
      setShowSaveExercisePrompt(false);
      setExerciseSearchQuery('');
      if (success) {
        handleAddExercise(true);
      }
    }
  };

  /**
   * Edit an existing exercise
   * @param {number} index - Index of exercise to edit
   */
  const handleEditExercise = (index) => {
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    const exercise = safeExercises[index];
    if (exercise) {
      setNewExercise({
        name: exercise.name || ''
      });
      setEditingExerciseIndex(index);
    }
  };

  /**
   * Delete an exercise from the workout
   * @param {number} index - Index of exercise to delete
   */
  const handleDeleteExercise = (index) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const safeExercises = Array.isArray(exercises) ? exercises : [];
            setExercises(safeExercises.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  /**
   * Select an exercise from the search
   * @param {string} exerciseName - Name of selected exercise
   */
  const handleSelectExercise = (exerciseName) => {
    setNewExercise({ ...newExercise, name: exerciseName });
    setCustomExerciseName('');
    setExerciseSearchQuery('');
  };

  /**
   * Reset exercise form
   */
  const resetExerciseForm = () => {
    setNewExercise({ name: '' });
    setCustomExerciseName('');
    setExerciseSearchQuery('');
    setEditingExerciseIndex(null);
    setShowSaveExercisePrompt(false);
  };

  /**
   * Reset all exercises
   */
  const resetExercises = () => {
    setExercises([]);
  };

  return {
    exercises,
    setExercises,
    newExercise,
    setNewExercise,
    editingExerciseIndex,
    showSaveExercisePrompt,
    exerciseSearchQuery,
    setExerciseSearchQuery,
    customExerciseName,
    setCustomExerciseName,
    handleAddExercise,
    handleSaveCustomExercise,
    handleEditExercise,
    handleDeleteExercise,
    handleSelectExercise,
    resetExerciseForm,
    resetExercises
  };
};
