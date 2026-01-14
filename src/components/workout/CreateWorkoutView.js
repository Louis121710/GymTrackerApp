/**
 * View component for creating a new custom workout template
 * Handles day selection, workout types, exercises, and notes
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';
import { DAYS_OF_WEEK, WORKOUT_TYPES } from '../../constants/exercises';
import ExerciseItem from '../features/ExerciseItem';

const CreateWorkoutView = ({
  selectedDay,
  setSelectedDay,
  selectedWorkoutTypes,
  setSelectedWorkoutTypes,
  exercises,
  setExercises,
  notes,
  setNotes,
  notesInputRef,
  dismissKeyboard,
  handleEditExercise,
  handleDeleteExercise,
  handleAddExercise,
  handleSaveWorkout,
  showDayModal,
  setShowDayModal,
  showWorkoutTypeModal,
  setShowWorkoutTypeModal,
  showExerciseModal,
  setShowExerciseModal,
  refreshing,
  onRefresh
}) => (
  <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollViewContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    scrollEventThrottle={16}
    decelerationRate="normal"
    bounces={true}
    scrollEnabled={true}
    nestedScrollEnabled={true}
    alwaysBounceVertical={false}
  >
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
      </TouchableOpacity>

      {/* Workout Types Selection */}
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
          <Text style={styles.inputValue}>
            {selectedWorkoutTypes.length > 0 ? selectedWorkoutTypes.join(', ') : 'Select types'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Exercises Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <Text style={styles.exerciseCount}>{`${exercises.length} exercise${(exercises.length !== 1) ? 's' : ''}`}</Text>
        </View>

        {exercises.length > 0 ? (
          <View style={styles.exercisesList}>
            {(Array.isArray(exercises) ? exercises : []).map((exercise, index) => (
              <ExerciseItem 
                key={index} 
                item={exercise} 
                index={index}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
              />
            ))}
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
            setShowExerciseModal(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF3333', '#FF6B35', '#FF8C42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addExerciseButtonGradient}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addExerciseButtonText}>
              {exercises.length === 0 ? 'Add Exercise' : 'Add Another Exercise'}
            </Text>
          </LinearGradient>
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
          style={[
            (exercises.length === 0 || selectedWorkoutTypes.length === 0) ? styles.saveButtonDisabled : styles.saveButton
          ]}
          onPress={() => {
            dismissKeyboard();
            handleSaveWorkout();
          }}
          activeOpacity={0.8}
          disabled={exercises.length === 0 || selectedWorkoutTypes.length === 0}
        >
          {(exercises.length === 0 || selectedWorkoutTypes.length === 0) ? (
            <View style={styles.saveButtonDisabledContainer}>
              <Text style={styles.saveButtonDisabledText}>
                Complete Required Fields
              </Text>
            </View>
          ) : (
          <LinearGradient
              colors={appStyle.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
                Save Workout
            </Text>
          </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </View>

    <TouchableOpacity onPress={dismissKeyboard}>
      <View style={styles.dismissArea} />
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...appStyle.shadows.large,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
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
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
  },
  emptyExercisesText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 10,
    marginBottom: 5,
  },
  emptyExercisesSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  addExerciseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
  },
  addExerciseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 48,
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  saveButtonDisabled: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: appStyle.colors.cardBorder,
    borderRadius: 12,
    minHeight: 48,
  },
  saveButtonDisabledContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonDisabledText: {
    color: appStyle.colors.textSecondary,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  dismissArea: {
    height: 100,
  },
});

export default CreateWorkoutView;
