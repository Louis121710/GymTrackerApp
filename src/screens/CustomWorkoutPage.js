import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { EXERCISE_LIBRARY, DAYS_OF_WEEK } from '../constants/exercises';
import { calculateTotalVolume } from '../utils/workoutCalculations';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { useExerciseManagement } from '../hooks/useExerciseManagement';
import { useWorkoutEditing } from '../hooks/useWorkoutEditing';
import LogWorkoutView from '../components/workout/LogWorkoutView';
import DayModal from '../components/modals/DayModal';
import WorkoutTypeModal from '../components/modals/WorkoutTypeModal';
import RestTimerModal from '../components/modals/RestTimerModal';
import ExerciseModal from '../components/modals/ExerciseModal';
import EditWorkoutModal from '../components/modals/EditWorkoutModal';
import CreateWorkoutView from '../components/workout/CreateWorkoutView';
import ListWorkoutsView from '../components/workout/ListWorkoutsView';
import appStyle from '../../appStyle';
import styles from './CustomWorkoutPage.styles';

const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY).flat();

/**
 * Custom Workout Page - Main screen for creating, managing, and logging custom workouts
 * 
 * Features:
 * - Create workout templates with exercises
 * - View and manage saved workouts
 * - Log active workouts with sets, reps, and weights
 * - Track workout timers and rest periods
 * 
 * Uses modular hooks for data management and timer functionality
 * @returns {JSX.Element} CustomWorkoutPage component
 */
const CustomWorkoutPage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [viewMode, setViewMode] = useState('create');
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState([]);
  const [notes, setNotes] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWorkoutTypeModal, setShowWorkoutTypeModal] = useState(false);
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);

  const { savedWorkouts, refreshing, onRefresh, loadWorkouts } = useWorkouts();
  const workoutTimer = useWorkoutTimer();
  const workoutData = useWorkoutData();
  
  // Exercise management hook
  const exerciseManagement = useExerciseManagement(
    workoutData.customExercises,
    workoutData.saveCustomExercise
  );
  
  // Workout editing hook
  const workoutEditing = useWorkoutEditing(
    workoutData.logWorkout,
    workoutData.updateWorkoutTemplate,
    loadWorkouts
  );

  const notesInputRef = React.useRef(null);

  useEffect(() => {
    if (isFocused) {
      loadWorkouts();
      workoutData.loadCustomExercisesList();
      workoutData.loadPersonalRecordsData();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    await onRefresh();
    await workoutData.loadCustomExercisesList();
  };

  // Wrapper to close modal after adding exercise
  const handleAddExerciseWithModal = async (skipPrompt = false) => {
    await exerciseManagement.handleAddExercise(skipPrompt);
    setShowExerciseModal(false);
  };

  const handleSaveWorkout = async () => {
    const safeExercises = Array.isArray(exerciseManagement.exercises) ? exerciseManagement.exercises : [];
    const safeTypes = Array.isArray(selectedWorkoutTypes) ? selectedWorkoutTypes : [];
    
    if (safeExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to your workout');
      return;
    }
    if (safeTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one workout type');
      return;
    }

    const workout = {
      id: Date.now().toString(),
      day: selectedDay,
      workoutType: safeTypes,
      exercises: safeExercises,
      notes: notes.trim(),
      timestamp: new Date().getTime()
    };

    const success = await workoutData.saveWorkoutTemplate(workout);
    if (success) {
      Alert.alert('Success', 'Workout saved successfully!', [
        { text: 'OK', onPress: async () => {
          exerciseManagement.resetExercises();
          setNotes('');
          setSelectedDay(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
          setSelectedWorkoutTypes([]);
          await loadWorkouts();
          setViewMode('list');
        }}
      ]);
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
            await workoutData.deleteWorkoutTemplate(workoutId);
            await loadWorkouts();
          }
        }
      ]
    );
  };

  const handleEditWorkout = (workout) => {
    workoutEditing.handleEditWorkout(workout);
    setShowEditWorkoutModal(true);
  };

  const handleSaveEditedWorkout = async () => {
    const success = await workoutEditing.handleSaveEditedWorkout();
    if (success) {
      setShowEditWorkoutModal(false);
    }
  };


  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Workout logging functions
  const startWorkout = () => {
    workoutTimer.startWorkout();
    setViewMode('log');
  };

  const finishWorkout = async () => {
    const safeExercises = Array.isArray(workoutEditing.editingWorkoutExercises) ? workoutEditing.editingWorkoutExercises : [];
    
    if (safeExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise with sets');
      return;
    }

    const totalVolume = calculateTotalVolume(safeExercises);
    const workoutLog = {
      id: Date.now().toString(),
      workoutId: workoutEditing.editingWorkout?.id || null,
      day: workoutEditing.editingWorkoutDay || selectedDay,
      workoutType: workoutEditing.editingWorkoutTypes.length > 0 ? workoutEditing.editingWorkoutTypes : selectedWorkoutTypes,
      exercises: safeExercises,
      notes: workoutEditing.editingWorkoutNotes || notes,
      duration: workoutTimer.workoutDuration,
      totalVolume: totalVolume,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime()
    };

    const logged = await workoutData.logWorkout(workoutLog);
    
    if (logged) {
      workoutTimer.finishWorkout();
      workoutEditing.resetEditingState();
      setViewMode('list');
      
      Alert.alert('Success', `Workout logged! Total volume: ${totalVolume.toFixed(0)}kg`);
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
            workoutTimer.finishWorkout();
            workoutEditing.resetEditingState();
            setViewMode('list');
          }
        }
      ]
    );
  };


    
    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
    <View style={styles.container}>
        {viewMode === 'log' ? (
          <LogWorkoutView
            editingWorkoutTypes={workoutEditing.editingWorkoutTypes}
            editingWorkoutExercises={workoutEditing.editingWorkoutExercises}
            editingWorkoutNotes={workoutEditing.editingWorkoutNotes}
            setEditingWorkoutNotes={workoutEditing.setEditingWorkoutNotes}
            workoutDuration={workoutTimer.workoutDuration}
            restTimer={workoutTimer.restTimer}
            restTimerActive={workoutTimer.restTimerActive}
            setShowRestTimerModal={setShowRestTimerModal}
            getExercisePR={workoutData.getExercisePR}
            handleDecrementExerciseWeight={workoutEditing.handleDecrementExerciseWeight}
            handleIncrementExerciseWeight={workoutEditing.handleIncrementExerciseWeight}
            handleUpdateExerciseSet={workoutEditing.handleUpdateExerciseSet}
            handleRemoveSetFromExercise={workoutEditing.handleRemoveSetFromExercise}
            handleAddSetToExercise={workoutEditing.handleAddSetToExercise}
            startRestTimer={workoutTimer.startRestTimer}
            cancelWorkout={cancelWorkout}
            finishWorkout={finishWorkout}
          />
        ) : (
          <>
            {/* Header */}
            <View style={styles.headerContainer}>
              <LinearGradient
                colors={['#000000', '#0F172A']}
                style={styles.header}
              >
                <Text style={styles.title}>
                  {viewMode === 'create' ? 'Create Custom Workout' : 'My Workouts'}
                </Text>
                <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
                  {viewMode === 'create' 
                    ? 'Plan your workout routine'
                    : `${savedWorkouts.length} workout${(savedWorkouts.length !== 1) ? 's' : ''} saved`
                  }
                </Text>
              </LinearGradient>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, viewMode === 'create' && styles.tabButtonActive]}
                onPress={() => setViewMode('create')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="plus-circle" 
                  size={24} 
                  color={viewMode === 'create' ? '#FFFFFF' : appStyle.colors.textSecondary} 
                />
                <Text style={[styles.tabText, viewMode === 'create' && styles.tabTextActive]}>
                  Create Workout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, viewMode === 'list' && styles.tabButtonActive]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="format-list-bulleted" 
                  size={24} 
                  color={viewMode === 'list' ? '#FFFFFF' : appStyle.colors.textSecondary} 
                />
                <Text style={[styles.tabText, viewMode === 'list' && styles.tabTextActive]}>
                  View Workouts
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'create' ? (
          <CreateWorkoutView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedWorkoutTypes={selectedWorkoutTypes}
            setSelectedWorkoutTypes={setSelectedWorkoutTypes}
            exercises={exerciseManagement.exercises}
            setExercises={exerciseManagement.setExercises}
            notes={notes}
            setNotes={setNotes}
            notesInputRef={notesInputRef}
            dismissKeyboard={dismissKeyboard}
            handleEditExercise={(index) => {
              exerciseManagement.handleEditExercise(index);
              setShowExerciseModal(true);
            }}
            handleDeleteExercise={exerciseManagement.handleDeleteExercise}
            handleAddExercise={handleAddExerciseWithModal}
            handleSaveWorkout={handleSaveWorkout}
            showDayModal={showDayModal}
            setShowDayModal={setShowDayModal}
            showWorkoutTypeModal={showWorkoutTypeModal}
            setShowWorkoutTypeModal={setShowWorkoutTypeModal}
            showExerciseModal={showExerciseModal}
            setShowExerciseModal={setShowExerciseModal}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            viewMode={viewMode}
            setViewMode={setViewMode}
            savedWorkouts={savedWorkouts}
          />
        ) : (
          <ListWorkoutsView
            savedWorkouts={savedWorkouts}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onCreateWorkout={() => setViewMode('create')}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
            )}
          </>
        )}

        {/* Day Selection Modal */}
        <DayModal
          visible={showDayModal}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onClose={() => setShowDayModal(false)}
          isEditing={showEditWorkoutModal}
          onEditSelect={workoutEditing.setEditingWorkoutDay}
        />

        {/* Workout Type Selection Modal */}
        <WorkoutTypeModal
          visible={showWorkoutTypeModal}
          selectedTypes={selectedWorkoutTypes}
          onSelectTypes={setSelectedWorkoutTypes}
          onClose={() => setShowWorkoutTypeModal(false)}
          isEditing={showEditWorkoutModal}
          onEditSelect={workoutEditing.setEditingWorkoutTypes}
        />

        {/* Exercise Modal */}
        <ExerciseModal
          visible={showExerciseModal}
          editingExerciseIndex={exerciseManagement.editingExerciseIndex}
          newExercise={exerciseManagement.newExercise}
          exerciseSearchQuery={exerciseManagement.exerciseSearchQuery}
          selectedMuscleGroup={selectedMuscleGroup}
          showSaveExercisePrompt={exerciseManagement.showSaveExercisePrompt}
          customExercises={workoutData.customExercises}
          onClose={() => {
            setShowExerciseModal(false);
            exerciseManagement.resetExerciseForm();
            setSelectedMuscleGroup(null);
          }}
          onSearchChange={(text) => {
            exerciseManagement.setExerciseSearchQuery(text);
            const safeCustomExercises = Array.isArray(workoutData.customExercises) ? workoutData.customExercises : [];
            const allExercises = [...COMMON_EXERCISES, ...safeCustomExercises];
            if (text && !allExercises.some(ex => ex.toLowerCase() === text.toLowerCase())) {
              exerciseManagement.setCustomExerciseName(text);
              exerciseManagement.setNewExercise({ ...exerciseManagement.newExercise, name: text });
            }
          }}
          onMuscleGroupSelect={setSelectedMuscleGroup}
          onExerciseSelect={(item) => {
            exerciseManagement.handleSelectExercise(item);
          }}
          onAddExercise={handleAddExerciseWithModal}
          onSaveCustomExercise={exerciseManagement.handleSaveCustomExercise}
          onSkipSave={() => {
            exerciseManagement.setShowSaveExercisePrompt(false);
            handleAddExerciseWithModal(true);
          }}
        />

        {/* Edit Workout Modal */}
        <EditWorkoutModal
          visible={showEditWorkoutModal}
          editingWorkoutDay={workoutEditing.editingWorkoutDay}
          editingWorkoutTypes={workoutEditing.editingWorkoutTypes}
          editingWorkoutExercises={workoutEditing.editingWorkoutExercises}
          editingWorkoutNotes={workoutEditing.editingWorkoutNotes}
          setEditingWorkoutNotes={workoutEditing.setEditingWorkoutNotes}
          onClose={() => setShowEditWorkoutModal(false)}
          onDayPress={() => {
            const tempDay = workoutEditing.editingWorkoutDay;
            const tempTypes = workoutEditing.editingWorkoutTypes;
            setSelectedDay(tempDay);
            setSelectedWorkoutTypes(tempTypes);
            setShowDayModal(true);
          }}
          onWorkoutTypePress={() => {
            const tempTypes = workoutEditing.editingWorkoutTypes;
            setSelectedWorkoutTypes(tempTypes);
            setShowWorkoutTypeModal(true);
          }}
          onDecrementWeight={workoutEditing.handleDecrementExerciseWeight}
          onIncrementWeight={workoutEditing.handleIncrementExerciseWeight}
          onUpdateSet={workoutEditing.handleUpdateExerciseSet}
          onRemoveSet={workoutEditing.handleRemoveSetFromExercise}
          onAddSet={workoutEditing.handleAddSetToExercise}
          onSave={handleSaveEditedWorkout}
        />

        {/* Rest Timer Modal */}
        <RestTimerModal
          visible={showRestTimerModal}
          restTimer={workoutTimer.restTimer}
          restTimerActive={workoutTimer.restTimerActive}
          defaultRestTime={workoutTimer.defaultRestTime}
          onStart={workoutTimer.startRestTimer}
          onStop={workoutTimer.stopRestTimer}
          onClose={() => setShowRestTimerModal(false)}
          onPresetSelect={workoutTimer.startRestTimer}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomWorkoutPage;
