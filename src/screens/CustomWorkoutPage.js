import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../appStyle';
import {
  saveCustomWorkout,
  loadCustomWorkouts,
  deleteCustomWorkout,
  updateCustomWorkout,
  getCurrentUser,
  loadCustomExercises,
  addCustomExercise,
  addWorkoutLog,
  loadWorkoutLogs,
  loadPersonalRecords,
  loadExerciseHistory
} from '../utils/storage';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const WORKOUT_TYPES = [
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

// Enhanced exercise library organized by muscle groups
const EXERCISE_LIBRARY = {
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

const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY).flat();

const CustomWorkoutPage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [viewMode, setViewMode] = useState('create'); // 'create', 'list', 'log', 'history', 'analytics'
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState([]);
  const [exercises, setExercises] = useState([]); // For creating workout template (just names)
  const [notes, setNotes] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWorkoutTypeModal, setShowWorkoutTypeModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '' }); // Just name for template
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSaveExercisePrompt, setShowSaveExercisePrompt] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  // For editing/logging workout
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingWorkoutDay, setEditingWorkoutDay] = useState('');
  const [editingWorkoutTypes, setEditingWorkoutTypes] = useState([]);
  const [editingWorkoutExercises, setEditingWorkoutExercises] = useState([]);
  const [editingWorkoutNotes, setEditingWorkoutNotes] = useState('');
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [editingSetExerciseIndex, setEditingSetExerciseIndex] = useState(null);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [currentSet, setCurrentSet] = useState({ weight: '', reps: '' });
  
  // New state for Hevy-like features
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [restTimer, setRestTimer] = useState(0); // in seconds
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [defaultRestTime, setDefaultRestTime] = useState(90); // default 90 seconds
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedExerciseForPR, setSelectedExerciseForPR] = useState(null);
  const [showExerciseLibraryModal, setShowExerciseLibraryModal] = useState(false);

  const notesInputRef = React.useRef(null);
  const restTimerIntervalRef = React.useRef(null);
  const workoutTimerIntervalRef = React.useRef(null);

  useEffect(() => {
    if (isFocused) {
      loadWorkouts();
      loadCustomExercisesList();
      loadWorkoutLogsData();
      loadPersonalRecordsData();
    }
    return () => {
      // Cleanup timers on unmount
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    };
  }, [isFocused]);

  // Rest timer effect
  useEffect(() => {
    if (restTimerActive && restTimer > 0) {
      restTimerIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    }
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    };
  }, [restTimerActive, restTimer]);

  // Workout duration timer effect
  useEffect(() => {
    if (isWorkoutActive && workoutStartTime) {
      workoutTimerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - workoutStartTime) / 1000);
        setWorkoutDuration(elapsed);
      }, 1000);
    } else {
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    }
    return () => {
      if (workoutTimerIntervalRef.current) {
        clearInterval(workoutTimerIntervalRef.current);
      }
    };
  }, [isWorkoutActive, workoutStartTime]);

  const loadWorkouts = async () => {
    const username = await getCurrentUser();
    if (username) {
      const workouts = await loadCustomWorkouts(username);
      const sortedWorkouts = Array.isArray(workouts) ? workouts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : [];
      setSavedWorkouts(sortedWorkouts);
    } else {
      setSavedWorkouts([]);
    }
  };

  const loadCustomExercisesList = async () => {
    const exercises = await loadCustomExercises();
    setCustomExercises(Array.isArray(exercises) ? exercises : []);
  };

  const loadWorkoutLogsData = async () => {
    const username = await getCurrentUser();
    if (username) {
      const logs = await loadWorkoutLogs(username);
      setWorkoutLogs(Array.isArray(logs) ? logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : []);
    } else {
      setWorkoutLogs([]);
    }
  };

  const loadPersonalRecordsData = async () => {
    const username = await getCurrentUser();
    if (username) {
      const prs = await loadPersonalRecords(username);
      setPersonalRecords(prs || {});
    } else {
      setPersonalRecords({});
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    await loadCustomExercisesList();
    setRefreshing(false);
  };

  const handleAddExercise = async (skipPrompt = false) => {
    if (!newExercise.name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    // For workout template creation, we only need the exercise name (no sets yet)
    const exerciseName = newExercise.name.trim();
    const isCustomExercise = !COMMON_EXERCISES.includes(exerciseName) && 
                             !customExercises.some(ex => ex.toLowerCase() === exerciseName.toLowerCase());

    // If it's a new custom exercise and we haven't shown the prompt, offer to save it
    if (isCustomExercise && !skipPrompt && !showSaveExercisePrompt) {
      setShowSaveExercisePrompt(true);
      return;
    }

    // Just save the exercise name for the template
    const exercise = {
      name: exerciseName
    };

    if (editingExerciseIndex !== null) {
      const updatedExercises = [...exercises];
      updatedExercises[editingExerciseIndex] = exercise;
      setExercises(updatedExercises);
      setEditingExerciseIndex(null);
    } else {
      setExercises([...exercises, exercise]);
    }

    setNewExercise({ name: '' });
    setCustomExerciseName('');
    setShowExerciseModal(false);
    setShowSaveExercisePrompt(false);
  };

  const handleSaveCustomExercise = async () => {
    const exerciseName = newExercise.name.trim();
    const success = await addCustomExercise(exerciseName);
    if (success) {
      await loadCustomExercisesList();
      Alert.alert('Success', `"${exerciseName}" has been added to the global exercise database!`);
    } else {
      Alert.alert('Info', 'This exercise already exists in the database');
    }
    setShowSaveExercisePrompt(false);
    setExerciseSearchQuery('');
    // Continue adding the exercise after saving
    handleAddExercise(true);
  };

  const handleEditExercise = (index) => {
    const exercise = exercises[index];
    // For template creation, we only need the exercise name
    setNewExercise({
      name: exercise.name || ''
    });
    setEditingExerciseIndex(index);
    setShowExerciseModal(true);
  };

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
            setExercises(exercises.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleSaveWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to your workout');
      return;
    }
    if (selectedWorkoutTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one workout type');
      return;
    }

    const workout = {
      id: Date.now().toString(),
      day: selectedDay,
      workoutType: selectedWorkoutTypes, // Now stores array
      exercises: exercises,
      notes: notes.trim(),
      timestamp: new Date().getTime()
    };

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save workouts');
        return;
      }

      await saveCustomWorkout(workout, username);
      Alert.alert('Success', 'Workout saved successfully!', [
        { text: 'OK', onPress: async () => {
          // Reset form
          setExercises([]);
          setNotes('');
          setSelectedDay(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
          setSelectedWorkoutTypes([]);
          await loadWorkouts();
          setViewMode('list');
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
      console.error('Save workout error:', error);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomWorkout(workoutId);
            await loadWorkouts();
          }
        }
      ]
    );
  };

  const handleEditWorkout = (workout) => {
    // Handle backward compatibility
    const workoutTypes = Array.isArray(workout.workoutType)
      ? workout.workoutType
      : workout.workoutType ? [workout.workoutType] : [];
    
    // Normalize exercises - ensure they have sets array
    // If no sets exist, initialize with one empty set for easy entry
    const normalizedExercises = (workout.exercises || []).map(exercise => {
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
    setShowEditWorkoutModal(true);
  };


  const handleSaveEditedWorkout = async () => {
    if (!editingWorkout) return;
    if (editingWorkoutTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one workout type');
      return;
    }
    if (editingWorkoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise with sets');
      return;
    }

    // Calculate total volume
    const totalVolume = calculateTotalVolume(editingWorkoutExercises);

    // Create workout log entry
    const workoutLog = {
      id: Date.now().toString(),
      workoutId: editingWorkout.id,
      day: editingWorkoutDay,
      workoutType: editingWorkoutTypes,
      exercises: editingWorkoutExercises,
      notes: editingWorkoutNotes.trim(),
      totalVolume: totalVolume,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime()
    };

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to log workouts');
        return;
      }

      // Log the workout
      await addWorkoutLog(workoutLog, username);
      await loadWorkoutLogsData();
      await loadPersonalRecordsData();
      
      // Also update the template
      const updatedWorkout = {
        ...editingWorkout,
        day: editingWorkoutDay,
        workoutType: editingWorkoutTypes,
        exercises: editingWorkoutExercises,
        notes: editingWorkoutNotes.trim(),
        timestamp: editingWorkout.timestamp
      };
      await updateCustomWorkout(editingWorkout.id, updatedWorkout, username);
      await loadWorkouts();
      
      setShowEditWorkoutModal(false);
      setEditingWorkout(null);
      Alert.alert('Success', `Workout logged! Total volume: ${totalVolume.toFixed(0)}kg`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log workout');
      console.error('Log workout error:', error);
    }
  };

  // Functions for editing workout sets
  const handleAddSetToExercise = (exerciseIndex) => {
    const updatedExercises = [...editingWorkoutExercises];
    if (!updatedExercises[exerciseIndex].sets) {
      updatedExercises[exerciseIndex].sets = [];
    }
    updatedExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
    setEditingWorkoutExercises(updatedExercises);
  };

  const handleRemoveSetFromExercise = (exerciseIndex, setIndex) => {
    const updatedExercises = [...editingWorkoutExercises];
    if (updatedExercises[exerciseIndex].sets && updatedExercises[exerciseIndex].sets.length > 0) {
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setEditingWorkoutExercises(updatedExercises);
    }
  };

  const handleUpdateExerciseSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...editingWorkoutExercises];
    if (!updatedExercises[exerciseIndex].sets) {
      updatedExercises[exerciseIndex].sets = [];
    }
    if (!updatedExercises[exerciseIndex].sets[setIndex]) {
      updatedExercises[exerciseIndex].sets[setIndex] = { weight: '', reps: '' };
    }
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setEditingWorkoutExercises(updatedExercises);
  };

  const handleIncrementExerciseWeight = (exerciseIndex, setIndex, amount = 2.5) => {
    const exercise = editingWorkoutExercises[exerciseIndex];
    if (!exercise.sets || !exercise.sets[setIndex]) return;
    const currentWeight = parseFloat(exercise.sets[setIndex].weight) || 0;
    handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', (currentWeight + amount).toString());
  };

  const handleDecrementExerciseWeight = (exerciseIndex, setIndex, amount = 2.5) => {
    const exercise = editingWorkoutExercises[exerciseIndex];
    if (!exercise.sets || !exercise.sets[setIndex]) return;
    const currentWeight = parseFloat(exercise.sets[setIndex].weight) || 0;
    if (currentWeight >= amount) {
      handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', (currentWeight - amount).toString());
    }
  };

  const handleSelectExercise = (exerciseName) => {
    setNewExercise({ ...newExercise, name: exerciseName });
    setCustomExerciseName('');
    setExerciseSearchQuery('');
  };

  const handleAddSet = () => {
    setNewExercise({
      ...newExercise,
      sets: [...newExercise.sets, { weight: '', reps: '' }]
    });
  };

  const handleRemoveSet = (setIndex) => {
    if (newExercise.sets.length > 1) {
      const updatedSets = newExercise.sets.filter((_, index) => index !== setIndex);
      setNewExercise({ ...newExercise, sets: updatedSets });
    }
  };

  const handleCopySet = (setIndex) => {
    const setToCopy = newExercise.sets[setIndex];
    const updatedSets = [...newExercise.sets];
    updatedSets.splice(setIndex + 1, 0, { weight: setToCopy.weight, reps: setToCopy.reps });
    setNewExercise({ ...newExercise, sets: updatedSets });
  };

  const handleUpdateSet = (setIndex, field, value) => {
    const updatedSets = [...newExercise.sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    setNewExercise({ ...newExercise, sets: updatedSets });
  };

  const handleIncrementWeight = (setIndex, amount = 2.5) => {
    const currentWeight = parseFloat(newExercise.sets[setIndex].weight) || 0;
    handleUpdateSet(setIndex, 'weight', (currentWeight + amount).toString());
  };

  const handleDecrementWeight = (setIndex, amount = 2.5) => {
    const currentWeight = parseFloat(newExercise.sets[setIndex].weight) || 0;
    if (currentWeight >= amount) {
      handleUpdateSet(setIndex, 'weight', (currentWeight - amount).toString());
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const getAllExercises = () => {
    // Ensure customExercises is an array
    const custom = Array.isArray(customExercises) ? customExercises : [];
    return [...COMMON_EXERCISES, ...custom];
  };

  const getFilteredExercises = () => {
    const allExercises = selectedMuscleGroup 
      ? getExercisesByMuscleGroup(selectedMuscleGroup)
      : getAllExercises();
    
    if (!exerciseSearchQuery.trim()) {
      return allExercises;
    }
    
    const query = exerciseSearchQuery.toLowerCase().trim();
    return allExercises.filter(exercise => 
      exercise.toLowerCase().includes(query)
    );
  };

  const getExercisesByMuscleGroup = (group) => {
    if (!group || !EXERCISE_LIBRARY[group]) return [];
    return EXERCISE_LIBRARY[group];
  };

  // Rest timer functions
  const startRestTimer = (seconds = null) => {
    const time = seconds !== null ? seconds : defaultRestTime;
    setRestTimer(time);
    setRestTimerActive(true);
  };

  const stopRestTimer = () => {
    setRestTimerActive(false);
    setRestTimer(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Workout logging functions
  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date().getTime());
    setWorkoutDuration(0);
    setViewMode('log');
  };

  const finishWorkout = async () => {
    if (editingWorkoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise with sets');
      return;
    }

    const totalVolume = calculateTotalVolume(editingWorkoutExercises);
    const workoutLog = {
      id: Date.now().toString(),
      workoutId: editingWorkout?.id || null,
      day: editingWorkoutDay || selectedDay,
      workoutType: editingWorkoutTypes.length > 0 ? editingWorkoutTypes : selectedWorkoutTypes,
      exercises: editingWorkoutExercises,
      notes: editingWorkoutNotes || notes,
      duration: workoutDuration,
      totalVolume: totalVolume,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime()
    };

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to log workouts');
        return;
      }

      await addWorkoutLog(workoutLog, username);
      await loadWorkoutLogsData();
      await loadPersonalRecordsData();
      
      // Reset workout state
      setIsWorkoutActive(false);
      setWorkoutStartTime(null);
      setWorkoutDuration(0);
      setEditingWorkoutExercises([]);
      setEditingWorkoutNotes('');
      setViewMode('list');
      
      Alert.alert('Success', `Workout logged! Total volume: ${totalVolume.toFixed(0)}kg`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log workout');
      console.error('Log workout error:', error);
    }
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setIsWorkoutActive(false);
            setWorkoutStartTime(null);
            setWorkoutDuration(0);
            setEditingWorkoutExercises([]);
            setEditingWorkoutNotes('');
            setViewMode('list');
          }
        }
      ]
    );
  };

  // Volume and 1RM calculations
  const calculateExerciseVolume = (exercise) => {
    if (!exercise.sets || !Array.isArray(exercise.sets)) return 0;
    return exercise.sets.reduce((total, set) => {
      const weight = parseFloat(set.weight) || 0;
      const reps = parseFloat(set.reps) || 0;
      return total + (weight * reps);
    }, 0);
  };

  const calculateTotalVolume = (exercises) => {
    return exercises.reduce((total, exercise) => {
      return total + calculateExerciseVolume(exercise);
    }, 0);
  };

  const calculateOneRepMax = (weight, reps) => {
    if (!weight || !reps || reps === 0) return 0;
    // Epley formula: 1RM = weight × (1 + reps/30)
    return weight * (1 + reps / 30);
  };

  const getExercisePR = (exerciseName) => {
    if (!exerciseName) return null;
    return personalRecords[exerciseName.toLowerCase()] || null;
  };

  const ExerciseItem = ({ item, index }) => {
    // Handle backward compatibility: convert old format to new format
    const sets = item.sets && Array.isArray(item.sets) 
      ? item.sets 
      : item.weight !== undefined && item.reps !== undefined
        ? [{ weight: item.weight, reps: item.reps }]
        : [];
    
    return (
      <TouchableOpacity 
        style={styles.exerciseCard}
        onPress={() => handleEditExercise(index)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          {sets.length > 0 && (
            <View style={styles.setsContainer}>
              {sets.map((set, setIndex) => (
                <Text key={setIndex} style={styles.setDetail}>
                  {`Set ${setIndex + 1}: ${set.weight}kg × ${set.reps} reps${setIndex < sets.length - 1 ? ' • ' : ''}`}
                </Text>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteExerciseButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteExercise(index);
          }}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const WorkoutCard = ({ workout }) => {
    // Handle both old format (string) and new format (array) for backward compatibility
    const workoutTypes = Array.isArray(workout.workoutType) 
      ? workout.workoutType 
      : workout.workoutType ? [workout.workoutType] : ['Other'];
    
    return (
      <TouchableOpacity 
        style={styles.workoutCard}
        onPress={() => handleEditWorkout(workout)}
        activeOpacity={0.7}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutHeaderLeft}>
            <View style={styles.workoutTypesContainer}>
              {workoutTypes.map((type, index) => (
                <View key={index} style={styles.workoutTypeBadge}>
                  <Text style={styles.workoutTypeText}>{type}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.workoutDay}>{workout.day}</Text>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteWorkout(workout.id);
            }}
            style={styles.deleteWorkoutButton}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

      <View style={styles.workoutExercises}>
        <Text style={styles.workoutExercisesTitle}>
          {`${workout.exercises?.length || 0} Exercise${((workout.exercises?.length || 0) !== 1) ? 's' : ''}`}
        </Text>
        {workout.exercises && workout.exercises.length > 0 ? (
          workout.exercises.slice(0, 3).map((exercise, index) => {
            // Handle backward compatibility
            const sets = exercise.sets && Array.isArray(exercise.sets)
              ? exercise.sets
              : exercise.weight !== undefined && exercise.reps !== undefined
                ? [{ weight: exercise.weight, reps: exercise.reps }]
                : [];
            const setsText = sets.length > 0 
              ? sets.map((set, i) => `${set.weight || 0}kg×${set.reps || 0}`).join(', ')
              : 'No sets';
            return (
              <Text key={index} style={styles.workoutExerciseItem}>
                • {exercise.name} - {setsText}
              </Text>
            );
          })
        ) : null}
        {workout.exercises && workout.exercises.length > 3 && (
          <Text style={styles.workoutExerciseMore}>
            {`+${workout.exercises.length - 3} more exercise${(workout.exercises.length - 3 !== 1) ? 's' : ''}`}
          </Text>
        )}
      </View>

      {workout.notes && (
        <View style={styles.workoutNotes}>
          <Text style={styles.workoutNotesLabel}>Notes:</Text>
          <Text style={styles.workoutNotesText}>{workout.notes}</Text>
        </View>
      )}
      </TouchableOpacity>
  );
};

  const CreateWorkoutView = () => (
    <ScrollView
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create Custom Workout</Text>
        <Text style={styles.subtitle}>Plan your workout routine</Text>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'create' && styles.toggleButtonActive]}
          onPress={() => setViewMode('create')}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={20}
            color={viewMode === 'create' ? '#FFFFFF' : '#888'}
          />
          <Text style={[
            styles.toggleButtonText,
            viewMode === 'create' && styles.toggleButtonTextActive
          ]}>
            Create
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={viewMode === 'list' ? '#FFFFFF' : '#888'}
          />
          <Text style={[
            styles.toggleButtonText,
            viewMode === 'list' && styles.toggleButtonTextActive
          ]}>
            {`My Workouts (${savedWorkouts.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Day Selection */}
        <TouchableOpacity
          style={styles.inputCard}
          onPress={() => {
            dismissKeyboard();
            setShowDayModal(true);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="calendar" size={24} color={appStyle.colors.accent} />
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>Workout Day</Text>
            <Text style={styles.inputValue}>{selectedDay}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#888" />
        </TouchableOpacity>

        {/* Workout Type Selection */}
        <TouchableOpacity
          style={styles.inputCard}
          onPress={() => {
            dismissKeyboard();
            setShowWorkoutTypeModal(true);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="dumbbell" size={24} color={appStyle.colors.accent} />
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>Workout Types</Text>
            {selectedWorkoutTypes.length > 0 ? (
              <View style={styles.selectedTypesContainer}>
                {selectedWorkoutTypes.map((type, index) => (
                  <View key={index} style={styles.selectedTypeChip}>
                    <Text style={styles.selectedTypeChipText}>{type}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.inputValue}>Select workout types (e.g., Back + Biceps)</Text>
            )}
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#888" />
        </TouchableOpacity>

        {/* Exercises Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.exerciseCount}>{`${exercises.length} exercise${(exercises.length !== 1) ? 's' : ''}`}</Text>
          </View>

          {exercises.length > 0 ? (
            <View style={styles.exercisesList}>
              {exercises.map((exercise, index) => {
                return (
                  <ExerciseItem key={index} item={exercise} index={index} />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyExercises}>
              <MaterialCommunityIcons name="dumbbell" size={48} color="#666" />
              <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
              <Text style={styles.emptyExercisesSubtext}>Tap the button below to add exercises</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => {
              dismissKeyboard();
              setNewExercise({ name: '' });
              setCustomExerciseName('');
              setEditingExerciseIndex(null);
              setShowExerciseModal(true);
            }}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addExerciseButtonText}>
              {exercises.length === 0 ? 'Add Exercise' : 'Add Another Exercise'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        <TouchableOpacity
          style={styles.inputCard}
          onPress={() => notesInputRef.current?.focus()}
          activeOpacity={1}
        >
          <MaterialCommunityIcons name="note-text" size={24} color={appStyle.colors.accent} />
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              ref={notesInputRef}
              style={[styles.textInput, styles.notesInput]}
              placeholder="Add any notes about your workout... (optional)"
              placeholderTextColor="#888"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              color={appStyle.colors.text}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={dismissKeyboard}
              textAlignVertical="top"
            />
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              dismissKeyboard();
              setViewMode('list');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>View Workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (exercises.length === 0 || selectedWorkoutTypes.length === 0) && styles.saveButtonDisabled
            ]}
            onPress={() => {
              dismissKeyboard();
              handleSaveWorkout();
            }}
            activeOpacity={0.7}
            disabled={exercises.length === 0 || selectedWorkoutTypes.length === 0}
          >
            <Text style={styles.saveButtonText}>
              {exercises.length === 0 || selectedWorkoutTypes.length === 0 ? 'Complete Required Fields' : 'Save Workout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.dismissArea} />
      </TouchableWithoutFeedback>
    </ScrollView>
  );

  const ListWorkoutsView = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <Text style={styles.subtitle}>
          {`${savedWorkouts.length} workout${(savedWorkouts.length !== 1) ? 's' : ''} saved`}
        </Text>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'create' && styles.toggleButtonActive]}
          onPress={() => setViewMode('create')}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={20}
            color={viewMode === 'create' ? '#FFFFFF' : '#888'}
          />
          <Text style={[
            styles.toggleButtonText,
            viewMode === 'create' && styles.toggleButtonTextActive
          ]}>
            Create
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={viewMode === 'list' ? '#FFFFFF' : '#888'}
          />
          <Text style={[
            styles.toggleButtonText,
            viewMode === 'list' && styles.toggleButtonTextActive
          ]}>
            {`My Workouts (${savedWorkouts.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {savedWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="dumbbell" size={80} color="#666" />
            <Text style={styles.emptyTitle}>No Workouts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first custom workout to get started
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setViewMode('create')}
            >
              <Text style={styles.createButtonText}>Create Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {Array.isArray(savedWorkouts) ? savedWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            )) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const LogWorkoutView = () => {
    const totalVolume = calculateTotalVolume(editingWorkoutExercises);
    
    return (
      <View style={styles.container}>
        {/* Workout Header with Timer */}
        <View style={styles.workoutLogHeader}>
          <View style={styles.workoutLogHeaderTop}>
            <View>
              <Text style={styles.workoutLogTitle}>Active Workout</Text>
              <Text style={styles.workoutLogSubtitle}>
                {editingWorkoutTypes.length > 0 ? editingWorkoutTypes.join(' + ') : 'Workout'}
              </Text>
            </View>
            <View style={styles.workoutTimerContainer}>
              <MaterialCommunityIcons name="timer" size={24} color={appStyle.colors.primary} />
              <Text style={styles.workoutTimerText}>{formatTime(workoutDuration)}</Text>
            </View>
          </View>
          
          {/* Rest Timer */}
          <TouchableOpacity
            style={[styles.restTimerCard, (restTimer > 0 && restTimerActive) && styles.restTimerCardActive]}
            onPress={() => setShowRestTimerModal(true)}
          >
            <MaterialCommunityIcons 
              name={restTimerActive ? "timer-sand" : "timer-sand-empty"} 
              size={20} 
              color={restTimerActive ? "#FFD700" : "#888"} 
            />
            <Text style={[styles.restTimerText, restTimerActive && styles.restTimerTextActive]}>
              {restTimer > 0 ? `Rest: ${formatTime(restTimer)}` : 'Start Rest Timer'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.workoutLogContent} showsVerticalScrollIndicator={false}>
          {/* Exercises */}
          <View style={styles.workoutLogSection}>
            <Text style={styles.workoutLogSectionTitle}>Exercises</Text>
            {Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises.map((exercise, exerciseIndex) => {
              const exercisePR = getExercisePR(exercise.name);
              const exerciseVolume = calculateExerciseVolume(exercise);
              
              return (
                <View key={exerciseIndex} style={styles.workoutLogExerciseCard}>
                  <View style={styles.workoutLogExerciseHeader}>
                    <Text style={styles.workoutLogExerciseName}>{exercise.name}</Text>
                    {exercisePR && (
                      <View style={styles.prBadge}>
                        <MaterialCommunityIcons name="trophy" size={14} color="#FFD700" />
                        <Text style={styles.prBadgeText}>PR</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Sets */}
                  <View style={styles.workoutLogSetsContainer}>
                    {(exercise.sets || []).map((set, setIndex) => {
                      const set1RM = calculateOneRepMax(parseFloat(set.weight) || 0, parseFloat(set.reps) || 0);
                      const isPR = exercisePR && (
                        (parseFloat(set.weight) || 0) >= exercisePR.maxWeight ||
                        (parseFloat(set.reps) || 0) >= exercisePR.maxReps ||
                        set1RM >= exercisePR.maxOneRepMax
                      );
                      
                      return (
                        <View key={setIndex} style={[styles.workoutLogSetRow, isPR && styles.workoutLogSetRowPR]}>
                          <View style={styles.workoutLogSetNumber}>
                            <Text style={styles.workoutLogSetNumberText}>{setIndex + 1}</Text>
                          </View>
                          <View style={styles.workoutLogSetInputs}>
                            <View style={styles.workoutLogSetInputGroup}>
                              <Text style={styles.workoutLogSetLabel}>Weight (kg)</Text>
                              <View style={styles.workoutLogSetInputWithButtons}>
                                <TouchableOpacity
                                  style={styles.workoutLogWeightButton}
                                  onPress={() => handleDecrementExerciseWeight(exerciseIndex, setIndex, 2.5)}
                                >
                                  <MaterialCommunityIcons name="minus" size={16} color={appStyle.colors.text} />
                                </TouchableOpacity>
                                <TextInput
                                  style={styles.workoutLogSetTextInput}
                                  placeholder="0"
                                  placeholderTextColor="#888"
                                  value={set.weight ? set.weight.toString() : ''}
                                  onChangeText={(text) => handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', text)}
                                  keyboardType="decimal-pad"
                                  color={appStyle.colors.text}
                                />
                                <TouchableOpacity
                                  style={styles.workoutLogWeightButton}
                                  onPress={() => handleIncrementExerciseWeight(exerciseIndex, setIndex, 2.5)}
                                >
                                  <MaterialCommunityIcons name="plus" size={16} color={appStyle.colors.text} />
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={styles.workoutLogSetInputGroup}>
                              <Text style={styles.workoutLogSetLabel}>Reps</Text>
                              <TextInput
                                style={styles.workoutLogSetTextInputSingle}
                                placeholder="0"
                                placeholderTextColor="#888"
                                value={set.reps ? set.reps.toString() : ''}
                                onChangeText={(text) => handleUpdateExerciseSet(exerciseIndex, setIndex, 'reps', text)}
                                keyboardType="number-pad"
                                color={appStyle.colors.text}
                              />
                            </View>
                          </View>
                          {isPR && (
                            <MaterialCommunityIcons name="trophy" size={16} color="#FFD700" />
                          )}
                          <TouchableOpacity
                            style={styles.workoutLogRemoveSetButton}
                            onPress={() => handleRemoveSetFromExercise(exerciseIndex, setIndex)}
                          >
                            <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                  
                  {/* Add Set Button */}
                  <TouchableOpacity
                    style={styles.workoutLogAddSetButton}
                    onPress={() => {
                      handleAddSetToExercise(exerciseIndex);
                      startRestTimer();
                    }}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={18} color={appStyle.colors.primary} />
                    <Text style={styles.workoutLogAddSetText}>Add Set</Text>
                  </TouchableOpacity>
                  
                  {exerciseVolume > 0 && (
                    <Text style={styles.workoutLogExerciseVolume}>
                      Volume: {exerciseVolume.toFixed(0)}kg
                    </Text>
                  )}
                </View>
              );
            }) : null}
          </View>

          {/* Notes */}
          <View style={styles.workoutLogSection}>
            <Text style={styles.workoutLogSectionTitle}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.workoutLogNotesInput]}
              placeholder="Add workout notes..."
              placeholderTextColor="#888"
              value={editingWorkoutNotes}
              onChangeText={setEditingWorkoutNotes}
              multiline
              color={appStyle.colors.text}
            />
          </View>

          {/* Summary */}
          <View style={styles.workoutLogSummary}>
            <View style={styles.workoutLogSummaryItem}>
              <Text style={styles.workoutLogSummaryLabel}>Total Volume</Text>
              <Text style={styles.workoutLogSummaryValue}>{totalVolume.toFixed(0)}kg</Text>
            </View>
            <View style={styles.workoutLogSummaryItem}>
              <Text style={styles.workoutLogSummaryLabel}>Duration</Text>
              <Text style={styles.workoutLogSummaryValue}>{formatTime(workoutDuration)}</Text>
            </View>
            <View style={styles.workoutLogSummaryItem}>
              <Text style={styles.workoutLogSummaryLabel}>Exercises</Text>
              <Text style={styles.workoutLogSummaryValue}>{editingWorkoutExercises.length}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.workoutLogActions}>
          <TouchableOpacity
            style={styles.workoutLogCancelButton}
            onPress={cancelWorkout}
          >
            <Text style={styles.workoutLogCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.workoutLogFinishButton}
            onPress={finishWorkout}
          >
            <Text style={styles.workoutLogFinishButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {viewMode === 'create' ? <CreateWorkoutView /> : <ListWorkoutsView />}

        {/* Day Selection Modal */}
        <Modal
          visible={showDayModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDayModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDayModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Day</Text>
                    <TouchableOpacity onPress={() => setShowDayModal(false)}>
                      <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={DAYS_OF_WEEK}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dayOption,
                          selectedDay === item && styles.dayOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedDay(item);
                          // If editing workout, update editing state too
                          if (showEditWorkoutModal) {
                            setEditingWorkoutDay(item);
                          }
                          setShowDayModal(false);
                        }}
                      >
                        <Text style={[
                          styles.dayOptionText,
                          selectedDay === item && styles.dayOptionTextSelected
                        ]}>
                          {item}
                        </Text>
                        {selectedDay === item && (
                          <MaterialCommunityIcons name="check" size={20} color={appStyle.colors.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Workout Type Selection Modal */}
        <Modal
          visible={showWorkoutTypeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowWorkoutTypeModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowWorkoutTypeModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Workout Type</Text>
                    <TouchableOpacity onPress={() => setShowWorkoutTypeModal(false)}>
                      <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={WORKOUT_TYPES}
                    keyExtractor={(item) => item}
                    numColumns={2}
                    renderItem={({ item }) => {
                      const isSelected = selectedWorkoutTypes.includes(item);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.workoutTypeOption,
                            isSelected && styles.workoutTypeOptionSelected
                          ]}
                          onPress={() => {
                            let updatedTypes;
                            if (isSelected) {
                              // Remove if already selected
                              updatedTypes = selectedWorkoutTypes.filter(type => type !== item);
                            } else {
                              // Add if not selected
                              updatedTypes = [...selectedWorkoutTypes, item];
                            }
                            setSelectedWorkoutTypes(updatedTypes);
                            // If editing workout, update editing state too
                            if (showEditWorkoutModal) {
                              setEditingWorkoutTypes(updatedTypes);
                            }
                          }}
                        >
                          <Text style={[
                            styles.workoutTypeOptionText,
                            isSelected && styles.workoutTypeOptionTextSelected
                          ]}>
                            {item}
                          </Text>
                          {isSelected && (
                            <MaterialCommunityIcons name="check" size={20} color={appStyle.colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={styles.modalDoneButton}
                      onPress={() => setShowWorkoutTypeModal(false)}
                    >
                      <Text style={styles.modalDoneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Exercise Modal */}
        <Modal
          visible={showExerciseModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowExerciseModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowExerciseModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      setShowExerciseModal(false);
                      setNewExercise({ name: '' });
                      setCustomExerciseName('');
                      setExerciseSearchQuery('');
                      setSelectedMuscleGroup(null);
                      setEditingExerciseIndex(null);
                      setShowSaveExercisePrompt(false);
                    }}>
                      <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Exercise Name - Search and Select */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Search or Type Exercise Name</Text>
                    
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                      <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor="#888"
                        value={exerciseSearchQuery}
                        onChangeText={(text) => {
                          setExerciseSearchQuery(text);
                          // If user types something not in the list, update the exercise name
                          if (text && !getAllExercises().some(ex => ex.toLowerCase() === text.toLowerCase())) {
                            setCustomExerciseName(text);
                            setNewExercise({ ...newExercise, name: text });
                          }
                        }}
                        color={appStyle.colors.text}
                      />
                      {exerciseSearchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setExerciseSearchQuery('');
                            setCustomExerciseName('');
                          }}
                          style={styles.searchClearButton}
                        >
                          <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Manual Input for Custom Exercise */}
                    {exerciseSearchQuery.length > 0 && !getAllExercises().some(ex => ex.toLowerCase() === exerciseSearchQuery.toLowerCase()) && (
                      <View style={styles.customExercisePrompt}>
                        <Text style={styles.customExercisePromptText}>
                          "{exerciseSearchQuery}" not found. Create it?
                        </Text>
                        <TouchableOpacity
                          style={styles.customExerciseCreateButton}
                          onPress={() => {
                            setNewExercise({ ...newExercise, name: exerciseSearchQuery });
                            setCustomExerciseName(exerciseSearchQuery);
                            setShowSaveExercisePrompt(true);
                          }}
                        >
                          <MaterialCommunityIcons name="plus-circle" size={18} color={appStyle.colors.primary} />
                          <Text style={styles.customExerciseCreateButtonText}>Create & Save</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {/* Muscle Group Tabs */}
                    {exerciseSearchQuery.length === 0 && (
                      <>
                        <Text style={styles.modalSubLabel}>Or select from exercises by muscle group:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleGroupTabs}>
                          <TouchableOpacity
                            style={[styles.muscleGroupTab, selectedMuscleGroup === null && styles.muscleGroupTabActive]}
                            onPress={() => setSelectedMuscleGroup(null)}
                          >
                            <Text style={[styles.muscleGroupTabText, selectedMuscleGroup === null && styles.muscleGroupTabTextActive]}>
                              All
                            </Text>
                          </TouchableOpacity>
                          {Object.keys(EXERCISE_LIBRARY).map(group => (
                            <TouchableOpacity
                              key={group}
                              style={[styles.muscleGroupTab, selectedMuscleGroup === group && styles.muscleGroupTabActive]}
                              onPress={() => setSelectedMuscleGroup(group)}
                            >
                              <Text style={[styles.muscleGroupTabText, selectedMuscleGroup === group && styles.muscleGroupTabTextActive]}>
                                {group}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    )}
                  </View>

                  {/* Exercises List - Main Scrollable Component */}
                  <FlatList
                    data={getFilteredExercises()}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    numColumns={2}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.exercisesListContent}
                    style={styles.exercisesListFlatList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.exerciseOption,
                          newExercise.name === item && styles.exerciseOptionSelected
                        ]}
                        onPress={() => {
                          handleSelectExercise(item);
                          setExerciseSearchQuery('');
                        }}
                      >
                        <Text style={[
                          styles.exerciseOptionText,
                          newExercise.name === item && styles.exerciseOptionTextSelected
                        ]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      exerciseSearchQuery.length > 0 ? (
                        <View style={styles.emptySearchResults}>
                          <MaterialCommunityIcons name="magnify" size={48} color="#666" />
                          <Text style={styles.emptySearchText}>No exercises found</Text>
                          <Text style={styles.emptySearchSubtext}>Try a different search or create a new exercise</Text>
                        </View>
                      ) : null
                    }
                    ListFooterComponent={
                      <>
                        {/* Save Exercise Prompt */}
                        {showSaveExercisePrompt && (
                          <View style={styles.saveExercisePrompt}>
                            <Text style={styles.saveExercisePromptText}>
                              Save "{newExercise.name.trim()}" to the global exercise database?
                            </Text>
                            <Text style={styles.saveExercisePromptSubtext}>
                              This exercise will be available for all users
                            </Text>
                            <View style={styles.saveExercisePromptButtons}>
                              <TouchableOpacity
                                style={styles.saveExercisePromptButton}
                                onPress={() => {
                                  setShowSaveExercisePrompt(false);
                                  handleAddExercise(true);
                                }}
                              >
                                <Text style={styles.saveExercisePromptButtonText}>Skip</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.saveExercisePromptButton, styles.saveExercisePromptButtonPrimary]}
                                onPress={handleSaveCustomExercise}
                              >
                                <Text style={[styles.saveExercisePromptButtonText, styles.saveExercisePromptButtonTextPrimary]}>
                                  Save Globally
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {/* Modal Actions */}
                        <View style={styles.modalButtonContainer}>
                          <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => {
                              setShowExerciseModal(false);
                              setNewExercise({ name: '' });
                              setCustomExerciseName('');
                              setExerciseSearchQuery('');
                              setSelectedMuscleGroup(null);
                              setEditingExerciseIndex(null);
                              setShowSaveExercisePrompt(false);
                            }}
                          >
                            <Text style={styles.modalCancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.modalSaveButton}
                            onPress={handleAddExercise}
                          >
                            <Text style={styles.modalSaveButtonText}>
                              {editingExerciseIndex !== null ? 'Update' : 'Add'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Workout Modal */}
        <Modal
          visible={showEditWorkoutModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowEditWorkoutModal(false)}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Workout</Text>
              <TouchableOpacity
                onPress={() => setShowEditWorkoutModal(false)}
                style={styles.editModalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalContent} showsVerticalScrollIndicator={false}>
              {/* Day and Workout Types */}
              <View style={styles.editSection}>
                <TouchableOpacity
                  style={styles.inputCard}
                  onPress={() => {
                    // Temporarily store editing values, then restore after day selection
                    const tempDay = editingWorkoutDay;
                    const tempTypes = editingWorkoutTypes;
                    setSelectedDay(tempDay);
                    setSelectedWorkoutTypes(tempTypes);
                    setShowDayModal(true);
                  }}
                >
                  <MaterialCommunityIcons name="calendar" size={24} color={appStyle.colors.accent} />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Day</Text>
                    <Text style={styles.inputValue}>{editingWorkoutDay}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inputCard}
                  onPress={() => {
                    const tempTypes = editingWorkoutTypes;
                    setSelectedWorkoutTypes(tempTypes);
                    setShowWorkoutTypeModal(true);
                  }}
                >
                  <MaterialCommunityIcons name="dumbbell" size={24} color={appStyle.colors.accent} />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Workout Types</Text>
                    {editingWorkoutTypes.length > 0 ? (
                      <View style={styles.selectedTypesContainer}>
                        {editingWorkoutTypes.map((type, index) => (
                          <View key={index} style={styles.selectedTypeChip}>
                            <Text style={styles.selectedTypeChipText}>{type}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.inputValue}>Tap to select</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Exercises with Sets */}
              <View style={styles.editSection}>
                <Text style={styles.sectionTitle}>Exercises & Sets</Text>
                {Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises.map((exercise, exerciseIndex) => (
                  <TouchableOpacity 
                    key={exerciseIndex} 
                    style={styles.editExerciseCard}
                    activeOpacity={1}
                  >
                    <Text style={styles.editExerciseName}>{exercise.name}</Text>
                    
                    {/* Sets List */}
                    <View style={styles.setsListContainer}>
                      {(exercise.sets || []).map((set, setIndex) => (
                        <View key={setIndex} style={styles.editSetRow}>
                          <View style={styles.setNumberSmall}>
                            <Text style={styles.setNumberSmallText}>{setIndex + 1}</Text>
                          </View>
                          <View style={styles.editSetInputs}>
                            <View style={styles.editSetInputGroup}>
                              <Text style={styles.editSetLabel}>Weight (kg)</Text>
                              <View style={styles.editSetInputWithButtons}>
                                <TouchableOpacity
                                  style={styles.weightButtonSmall}
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    handleDecrementExerciseWeight(exerciseIndex, setIndex, 2.5);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <MaterialCommunityIcons name="minus" size={16} color={appStyle.colors.text} />
                                </TouchableOpacity>
                                <TextInput
                                  style={styles.editSetTextInput}
                                  placeholder="0"
                                  placeholderTextColor="#888"
                                  value={set.weight ? set.weight.toString() : ''}
                                  onChangeText={(text) => handleUpdateExerciseSet(exerciseIndex, setIndex, 'weight', text)}
                                  keyboardType="decimal-pad"
                                  color={appStyle.colors.text}
                                  returnKeyType="done"
                                  blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                  style={styles.weightButtonSmall}
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    handleIncrementExerciseWeight(exerciseIndex, setIndex, 2.5);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <MaterialCommunityIcons name="plus" size={16} color={appStyle.colors.text} />
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={styles.editSetInputGroup}>
                              <Text style={styles.editSetLabel}>Reps</Text>
                              <TextInput
                                style={styles.editSetTextInputSingle}
                                placeholder="0"
                                placeholderTextColor="#888"
                                value={set.reps ? set.reps.toString() : ''}
                                onChangeText={(text) => handleUpdateExerciseSet(exerciseIndex, setIndex, 'reps', text)}
                                keyboardType="number-pad"
                                color={appStyle.colors.text}
                              />
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.removeSetButton}
                            onPress={() => handleRemoveSetFromExercise(exerciseIndex, setIndex)}
                          >
                            <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    {/* Add Set Button */}
                    <TouchableOpacity
                      style={styles.addSetToExerciseButton}
                      onPress={() => handleAddSetToExercise(exerciseIndex)}
                    >
                      <MaterialCommunityIcons name="plus-circle" size={18} color={appStyle.colors.primary} />
                      <Text style={styles.addSetToExerciseText}>Add Set</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )) : null}
              </View>

              {/* Notes */}
              <View style={styles.editSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Add workout notes..."
                  placeholderTextColor="#888"
                  value={editingWorkoutNotes}
                  onChangeText={setEditingWorkoutNotes}
                  multiline
                  color={appStyle.colors.text}
                />
              </View>

              {/* Summary */}
              <View style={styles.editWorkoutSummary}>
                <View style={styles.editWorkoutSummaryItem}>
                  <Text style={styles.editWorkoutSummaryLabel}>Total Volume</Text>
                  <Text style={styles.editWorkoutSummaryValue}>
                    {calculateTotalVolume(editingWorkoutExercises).toFixed(0)}kg
                  </Text>
                </View>
                <View style={styles.editWorkoutSummaryItem}>
                  <Text style={styles.editWorkoutSummaryLabel}>Exercises</Text>
                  <Text style={styles.editWorkoutSummaryValue}>{editingWorkoutExercises.length}</Text>
                </View>
              </View>

              {/* Save/Log Button */}
              <TouchableOpacity
                style={styles.saveEditedWorkoutButton}
                onPress={handleSaveEditedWorkout}
              >
                <Text style={styles.saveEditedWorkoutButtonText}>Log Workout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Rest Timer Modal */}
        <Modal
          visible={showRestTimerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRestTimerModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowRestTimerModal(false)}>
            <View style={styles.restTimerModalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.restTimerModalContent}>
                  <View style={styles.restTimerModalHeader}>
                    <Text style={styles.restTimerModalTitle}>Rest Timer</Text>
                    <TouchableOpacity onPress={() => setShowRestTimerModal(false)}>
                      <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.restTimerDisplay}>
                    <Text style={styles.restTimerDisplayText}>{formatTime(restTimer)}</Text>
                    <Text style={styles.restTimerDisplayLabel}>
                      {restTimerActive ? 'Resting...' : 'Ready'}
                    </Text>
                  </View>

                  <View style={styles.restTimerPresets}>
                    <Text style={styles.restTimerPresetsLabel}>Quick Start:</Text>
                    <View style={styles.restTimerPresetsGrid}>
                      {[30, 60, 90, 120, 180].map(seconds => (
                        <TouchableOpacity
                          key={seconds}
                          style={styles.restTimerPresetButton}
                          onPress={() => {
                            startRestTimer(seconds);
                            setShowRestTimerModal(false);
                          }}
                        >
                          <Text style={styles.restTimerPresetText}>{formatTime(seconds)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.restTimerControls}>
                    {restTimerActive ? (
                      <TouchableOpacity
                        style={styles.restTimerStopButton}
                        onPress={() => {
                          stopRestTimer();
                          setShowRestTimerModal(false);
                        }}
                      >
                        <MaterialCommunityIcons name="stop" size={20} color="#FFFFFF" />
                        <Text style={styles.restTimerStopButtonText}>Stop</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.restTimerStartButton}
                        onPress={() => {
                          startRestTimer();
                          setShowRestTimerModal(false);
                        }}
                      >
                        <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                        <Text style={styles.restTimerStartButtonText}>Start {formatTime(defaultRestTime)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  scrollViewContent: {
    paddingBottom: 0,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: appStyle.colors.primary,
  },
  toggleButtonText: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  title: {
    color: appStyle.colors.text,
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  subtitle: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  form: {
    padding: 20,
    paddingBottom: 0,
  },
  inputCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputContent: {
    flex: 1,
    marginLeft: 15,
  },
  inputLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  inputValue: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  textInput: {
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    paddingVertical: 5,
    includeFontPadding: false,
  },
  notesInput: {
    minHeight: 80,
    maxHeight: 120,
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  exerciseCount: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  exercisesList: {
    marginBottom: 15,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 4,
  },
  exerciseDetails: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  setDetail: {
    color: '#888',
    fontSize: 13,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  // Sets modal styles
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addSetButtonText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  setRow: {
    flexDirection: 'row',
    backgroundColor: '#363636',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  setNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: appStyle.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 15,
  },
  setInputGroup: {
    flex: 1,
  },
  setInputLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  setInputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  setTextInput: {
    flex: 1,
    padding: 10,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  weightButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setActions: {
    flexDirection: 'row',
    gap: 8,
  },
  setActionButton: {
    padding: 6,
  },
  deleteExerciseButton: {
    padding: 8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  emptyExercises: {
    backgroundColor: appStyle.colors.surface,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyExercisesText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 15,
    marginBottom: 5,
  },
  emptyExercisesSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  addExerciseButton: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 0,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveButton: {
    flex: 2,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  saveButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  dismissArea: {
    height: 100,
  },
  // List View Styles
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  workoutsList: {
    gap: 15,
  },
  workoutCard: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  workoutHeaderLeft: {
    flex: 1,
    gap: 10,
  },
  workoutTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 5,
  },
  workoutTypeBadge: {
    backgroundColor: appStyle.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  workoutTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  selectedTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  selectedTypeChip: {
    backgroundColor: appStyle.colors.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  selectedTypeChipText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutDay: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  deleteWorkoutButton: {
    padding: 8,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  workoutExercises: {
    marginBottom: 10,
  },
  workoutExercisesTitle: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 8,
  },
  workoutExerciseItem: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  workoutExerciseMore: {
    color: '#666',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    fontStyle: 'italic',
    marginTop: 4,
  },
  workoutNotes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#363636',
  },
  workoutNotesLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  workoutNotesText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: appStyle.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: appStyle.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  modalSubLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 10,
    marginBottom: 10,
  },
  modalTextInput: {
    backgroundColor: '#363636',
    borderRadius: 8,
    padding: 12,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  dayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#363636',
  },
  dayOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  dayOptionText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  dayOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutTypeOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#363636',
    margin: 5,
    minWidth: '45%',
  },
  workoutTypeOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  workoutTypeOptionText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutTypeOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  exerciseOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#363636',
    margin: 5,
    alignItems: 'center',
  },
  exerciseOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  exerciseOptionText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  exerciseOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveExercisePrompt: {
    backgroundColor: '#363636',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveExercisePromptText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  saveExercisePromptButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  saveExercisePromptButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
  },
  saveExercisePromptButtonPrimary: {
    backgroundColor: appStyle.colors.primary,
  },
  saveExercisePromptButtonText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  saveExercisePromptButtonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  modalDoneButton: {
    flex: 1,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalSaveButton: {
    flex: 2,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  // Edit Modal Styles
  editModalContainer: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  editModalTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editModalCloseButton: {
    padding: 5,
  },
  editModalContent: {
    flex: 1,
    padding: 20,
  },
  editSection: {
    marginBottom: 25,
  },
  editExerciseCard: {
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#363636',
  },
  editExerciseName: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 12,
  },
  setsListContainer: {
    marginBottom: 10,
  },
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  setNumberSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appStyle.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberSmallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editSetInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  editSetInputGroup: {
    flex: 1,
  },
  editSetLabel: {
    color: '#888',
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  editSetInputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  editSetTextInput: {
    flex: 1,
    padding: 8,
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  editSetTextInputSingle: {
    padding: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  weightButtonSmall: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetButton: {
    padding: 6,
  },
  addSetToExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary + '20',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 5,
  },
  addSetToExerciseText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveEditedWorkoutButton: {
    backgroundColor: appStyle.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveEditedWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editWorkoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: appStyle.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  editWorkoutSummaryItem: {
    alignItems: 'center',
  },
  editWorkoutSummaryLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  editWorkoutSummaryValue: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  // Workout Logging Styles
  workoutLogHeader: {
    backgroundColor: appStyle.colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#363636',
  },
  workoutLogHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  workoutLogTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 4,
  },
  workoutLogSubtitle: {
    color: appStyle.colors.accent,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.primary + '20',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  workoutTimerText: {
    color: appStyle.colors.primary,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  restTimerCardActive: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  restTimerText: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  restTimerTextActive: {
    color: '#FFD700',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogContent: {
    flex: 1,
    padding: 20,
  },
  workoutLogSection: {
    marginBottom: 25,
  },
  workoutLogSectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
  workoutLogExerciseCard: {
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  workoutLogExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutLogExerciseName: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    flex: 1,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogSetsContainer: {
    marginBottom: 10,
  },
  workoutLogSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  workoutLogSetRowPR: {
    backgroundColor: '#FFD700' + '20',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  workoutLogSetNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appStyle.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutLogSetNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogSetInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  workoutLogSetInputGroup: {
    flex: 1,
  },
  workoutLogSetLabel: {
    color: '#888',
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  workoutLogSetInputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  workoutLogSetTextInput: {
    flex: 1,
    padding: 10,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  workoutLogSetTextInputSingle: {
    padding: 10,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  workoutLogWeightButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutLogRemoveSetButton: {
    padding: 6,
  },
  workoutLogAddSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary + '20',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 5,
  },
  workoutLogAddSetText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogExerciseVolume: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 8,
    textAlign: 'right',
  },
  workoutLogNotesInput: {
    backgroundColor: '#363636',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutLogSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: appStyle.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  workoutLogSummaryItem: {
    alignItems: 'center',
  },
  workoutLogSummaryLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  workoutLogSummaryValue: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#363636',
    gap: 10,
  },
  workoutLogCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  workoutLogCancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogFinishButton: {
    flex: 2,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  workoutLogFinishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  startWorkoutButton: {
    padding: 8,
  },
  // Rest Timer Modal Styles
  restTimerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimerModalContent: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  restTimerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  restTimerModalTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  restTimerDisplayText: {
    color: appStyle.colors.primary,
    fontSize: 48,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  restTimerDisplayLabel: {
    color: '#888',
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  restTimerPresets: {
    width: '100%',
    marginBottom: 20,
  },
  restTimerPresetsLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
  restTimerPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  restTimerPresetButton: {
    backgroundColor: '#363636',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  restTimerPresetText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerControls: {
    width: '100%',
  },
  restTimerStartButton: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restTimerStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerStopButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restTimerStopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  // Muscle Group Tabs
  muscleGroupTabs: {
    marginVertical: 15,
    maxHeight: 50,
  },
  muscleGroupTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#363636',
    marginRight: 8,
  },
  muscleGroupTabActive: {
    backgroundColor: appStyle.colors.primary,
  },
  muscleGroupTabText: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  muscleGroupTabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  searchClearButton: {
    padding: 4,
  },
  exercisesListContainer: {
    maxHeight: 400,
    marginTop: 10,
  },
  exercisesListFlatList: {
    flex: 1,
    marginTop: 10,
  },
  exercisesListContent: {
    paddingBottom: 20,
  },
  customExercisePrompt: {
    backgroundColor: appStyle.colors.primary + '20',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  customExercisePromptText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  customExerciseCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  customExerciseCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  emptySearchResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySearchText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySearchSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  saveExercisePromptSubtext: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 15,
    marginTop: 5,
  },
});

export default CustomWorkoutPage;
