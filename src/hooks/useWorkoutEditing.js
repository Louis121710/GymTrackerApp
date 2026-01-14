import { useState } from 'react';
import { Alert } from 'react-native';
import { calculateTotalVolume } from '../utils/workoutCalculations';

/**
 * Custom hook for managing workout editing and logging operations
 * Handles editing workout templates, managing sets, and logging workouts
 * 
 * @param {Function} onLogWorkout - Callback to log a workout
 * @param {Function} onUpdateWorkout - Callback to update workout template
 * @param {Function} onLoadWorkouts - Callback to reload workouts
 * @returns {Object} Workout editing state and functions
 */
export const useWorkoutEditing = (onLogWorkout, onUpdateWorkout, onLoadWorkouts) => {
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingWorkoutDay, setEditingWorkoutDay] = useState('');
  const [editingWorkoutTypes, setEditingWorkoutTypes] = useState([]);
  const [editingWorkoutExercises, setEditingWorkoutExercises] = useState([]);
  const [editingWorkoutNotes, setEditingWorkoutNotes] = useState('');

  /**
   * Initialize workout for editing
   * @param {Object} workout - Workout object to edit
   */
  const handleEditWorkout = (workout) => {
    // Handle backward compatibility
    const workoutTypes = Array.isArray(workout.workoutType)
      ? workout.workoutType
      : workout.workoutType ? [workout.workoutType] : [];
    
    // Normalize exercises - ensure they have sets array
    const normalizedExercises = (Array.isArray(workout.exercises) ? workout.exercises : []).map(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0) {
        return exercise;
      } else if (exercise.weight !== undefined && exercise.reps !== undefined) {
        // Old format - convert to new format
        return {
          name: exercise.name,
          sets: [{ weight: exercise.weight, reps: exercise.reps }]
        };
      } else {
        // Just name, no sets yet - add one empty set for easy entry
        return {
          name: exercise.name,
          sets: [{ weight: '', reps: '' }]
        };
      }
    });

    setEditingWorkout(workout);
    setEditingWorkoutDay(workout.day || '');
    setEditingWorkoutTypes(workoutTypes);
    setEditingWorkoutExercises(normalizedExercises);
    setEditingWorkoutNotes(workout.notes || '');
  };

  /**
   * Save edited workout and log it
   */
  const handleSaveEditedWorkout = async () => {
    if (!editingWorkout) return;
    
    const safeTypes = Array.isArray(editingWorkoutTypes) ? editingWorkoutTypes : [];
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    
    if (safeTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one workout type');
      return;
    }
    if (safeExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise with sets');
      return;
    }

    // Calculate total volume
    const totalVolume = calculateTotalVolume(safeExercises);

    // Create workout log entry
    const workoutLog = {
      id: Date.now().toString(),
      workoutId: editingWorkout.id,
      day: editingWorkoutDay,
      workoutType: safeTypes,
      exercises: safeExercises,
      notes: editingWorkoutNotes.trim(),
      totalVolume: totalVolume,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime()
    };

    // Log the workout
    const logged = await onLogWorkout(workoutLog);
    
    if (logged) {
      // Also update the template
      const updatedWorkout = {
        ...editingWorkout,
        day: editingWorkoutDay,
        workoutType: safeTypes,
        exercises: safeExercises,
        notes: editingWorkoutNotes.trim(),
        timestamp: editingWorkout.timestamp
      };
      
      if (onUpdateWorkout) {
        await onUpdateWorkout(editingWorkout.id, updatedWorkout);
      }
      
      if (onLoadWorkouts) {
        await onLoadWorkouts();
      }
      
      setEditingWorkout(null);
      Alert.alert('Success', `Workout logged! Total volume: ${totalVolume.toFixed(0)}kg`);
      return true;
    }
    
    return false;
  };

  /**
   * Add a set to an exercise
   * @param {number} exerciseIndex - Index of the exercise
   */
  const handleAddSetToExercise = (exerciseIndex) => {
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    const updatedExercises = [...safeExercises];
    
    if (updatedExercises[exerciseIndex]) {
      if (!updatedExercises[exerciseIndex].sets) {
        updatedExercises[exerciseIndex].sets = [];
      }
      updatedExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
      setEditingWorkoutExercises(updatedExercises);
    }
  };

  /**
   * Remove a set from an exercise
   * @param {number} exerciseIndex - Index of the exercise
   * @param {number} setIndex - Index of the set to remove
   */
  const handleRemoveSetFromExercise = (exerciseIndex, setIndex) => {
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    const updatedExercises = [...safeExercises];
    
    if (updatedExercises[exerciseIndex]?.sets && Array.isArray(updatedExercises[exerciseIndex].sets)) {
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setEditingWorkoutExercises(updatedExercises);
    }
  };

  /**
   * Update a set value
   * @param {number} exerciseIndex - Index of the exercise
   * @param {number} setIndex - Index of the set
   * @param {string} field - Field to update ('weight' or 'reps')
   * @param {string} value - New value
   */
  const handleUpdateExerciseSet = (exerciseIndex, setIndex, field, value) => {
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    const updatedExercises = [...safeExercises];
    
    if (!updatedExercises[exerciseIndex]) return;
    
    if (!updatedExercises[exerciseIndex].sets) {
      updatedExercises[exerciseIndex].sets = [];
    }
    if (!updatedExercises[exerciseIndex].sets[setIndex]) {
      updatedExercises[exerciseIndex].sets[setIndex] = { weight: '', reps: '' };
    }
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setEditingWorkoutExercises(updatedExercises);
  };

  /**
   * Increment exercise weight
   * @param {number} exerciseIndex - Index of the exercise
   * @param {number} setIndex - Index of the set
   * @param {number} amount - Amount to increment (default 2.5)
   */
  const handleIncrementExerciseWeight = (exerciseIndex, setIndex, amount = 2.5) => {
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    const exercise = safeExercises[exerciseIndex];
    if (!exercise?.sets?.[setIndex]) return;
    
    const currentWeight = parseFloat(exercise.sets[setIndex].weight) || 0;
    handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', (currentWeight + amount).toString());
  };

  /**
   * Decrement exercise weight
   * @param {number} exerciseIndex - Index of the exercise
   * @param {number} setIndex - Index of the set
   * @param {number} amount - Amount to decrement (default 2.5)
   */
  const handleDecrementExerciseWeight = (exerciseIndex, setIndex, amount = 2.5) => {
    const safeExercises = Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : [];
    const exercise = safeExercises[exerciseIndex];
    if (!exercise?.sets?.[setIndex]) return;
    
    const currentWeight = parseFloat(exercise.sets[setIndex].weight) || 0;
    if (currentWeight >= amount) {
      handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', (currentWeight - amount).toString());
    }
  };

  /**
   * Reset editing state
   */
  const resetEditingState = () => {
    setEditingWorkout(null);
    setEditingWorkoutDay('');
    setEditingWorkoutTypes([]);
    setEditingWorkoutExercises([]);
    setEditingWorkoutNotes('');
  };

  return {
    editingWorkout,
    setEditingWorkout,
    editingWorkoutDay,
    setEditingWorkoutDay,
    editingWorkoutTypes,
    setEditingWorkoutTypes,
    editingWorkoutExercises,
    setEditingWorkoutExercises,
    editingWorkoutNotes,
    setEditingWorkoutNotes,
    handleEditWorkout,
    handleSaveEditedWorkout,
    handleAddSetToExercise,
    handleRemoveSetFromExercise,
    handleUpdateExerciseSet,
    handleIncrementExerciseWeight,
    handleDecrementExerciseWeight,
    resetEditingState
  };
};
