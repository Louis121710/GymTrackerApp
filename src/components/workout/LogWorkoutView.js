/**
 * View component for logging an active workout
 * Handles exercise sets, rest timer, workout duration, and finishing workout
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';
import { formatTime } from '../../utils/formatters';
import { calculateExerciseVolume, calculateTotalVolume, calculateOneRepMax } from '../../utils/workoutCalculations';

const LogWorkoutView = ({
  editingWorkoutTypes,
  editingWorkoutExercises,
  editingWorkoutNotes,
  setEditingWorkoutNotes,
  workoutDuration,
  restTimer,
  restTimerActive,
  setShowRestTimerModal,
  getExercisePR,
  handleDecrementExerciseWeight,
  handleIncrementExerciseWeight,
  handleUpdateExerciseSet,
  handleRemoveSetFromExercise,
  handleAddSetToExercise,
  startRestTimer,
  cancelWorkout,
  finishWorkout
}) => {
  const totalVolume = calculateTotalVolume(editingWorkoutExercises);
  
  return (
    <View style={styles.container}>
      {/* Workout Header with Timer */}
      <LinearGradient
        colors={appStyle.gradients.header}
        style={styles.workoutLogHeader}
      >
        <View style={styles.workoutLogHeaderTop}>
          <View>
            <Text style={styles.workoutLogTitle}>Active Workout</Text>
            <Text style={styles.workoutLogSubtitle}>
              {editingWorkoutTypes.length > 0 ? editingWorkoutTypes.join(' + ') : 'Workout'}
            </Text>
          </View>
          <View style={styles.workoutTimerContainer}>
            <MaterialCommunityIcons name="timer" size={24} color="#FFFFFF" />
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
            color={restTimerActive ? "#FFD700" : "rgba(255, 255, 255, 0.7)"} 
          />
          <Text style={[styles.restTimerText, restTimerActive && styles.restTimerTextActive]}>
            {restTimer > 0 ? `Rest: ${formatTime(restTimer)}` : 'Start Rest Timer'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.workoutLogContent}
        contentContainerStyle={styles.workoutLogContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercises */}
        <View style={styles.workoutLogSection}>
          <Text style={styles.workoutLogSectionTitle}>Exercises</Text>
          {(Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : []).map((exercise, exerciseIndex) => {
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
                  {(Array.isArray(exercise.sets) ? exercise.sets : []).map((set, setIndex) => {
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
          })}
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={appStyle.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.workoutLogFinishButtonGradient}
          >
            <Text style={styles.workoutLogFinishButtonText}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  workoutLogHeader: {
    paddingTop: 60,
    paddingHorizontal: appStyle.spacing.lg, // 24px
    paddingBottom: appStyle.spacing.md, // 16px
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...appStyle.shadows.large, // Premium shadow
  },
  workoutLogHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  workoutLogTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 4,
  },
  workoutLogSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  workoutTimerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white on orange
    padding: appStyle.spacing.md, // 16px
    borderRadius: appStyle.roundness.medium, // 12px
    gap: appStyle.spacing.sm, // 8px
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  restTimerCardActive: {
    backgroundColor: 'rgba(255, 51, 51, 0.2)', // Orange with opacity
    borderWidth: 2,
    borderColor: '#FF6B35', // Orange accent
  },
  restTimerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  restTimerTextActive: {
    color: '#FFD700',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogContent: {
    flex: 1,
  },
  workoutLogContentContainer: {
    padding: 20,
    flexGrow: 1,
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
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    borderRadius: 16, // Exact 16px as specified
    padding: appStyle.spacing.md, // 16px professional spacing
    marginBottom: appStyle.spacing.md,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    ...appStyle.shadows.small, // Premium shadow
  },
  workoutLogExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  workoutLogSetsContainer: {
    marginBottom: 10,
  },
  workoutLogSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.surfaceElevated, // #334155 (Slate-700)
    padding: appStyle.spacing.md, // 16px
    borderRadius: appStyle.roundness.medium, // 12px
    marginBottom: appStyle.spacing.sm, // 8px
    gap: appStyle.spacing.sm,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  workoutLogSetRowPR: {
    borderWidth: 2,
    borderColor: '#FFD700', // Gold for PR
    backgroundColor: 'rgba(255, 215, 0, 0.15)', // Premium PR highlight
  },
  workoutLogSetNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3333', // Primary orange from gradient
    justifyContent: 'center',
    alignItems: 'center',
    ...appStyle.shadows.small, // Premium shadow
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
    backgroundColor: appStyle.colors.background, // #0F172A (Slate-900)
    borderRadius: appStyle.roundness.medium, // 12px
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
  },
  workoutLogSetTextInput: {
    flex: 1,
    padding: 10,
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
  workoutLogSetTextInputSingle: {
    padding: appStyle.spacing.sm + 2, // 10px
    backgroundColor: appStyle.colors.background, // #0F172A (Slate-900)
    borderRadius: appStyle.roundness.medium, // 12px
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    color: appStyle.colors.text, // #FFFFFF
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
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
  textInput: {
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    paddingVertical: 5,
    includeFontPadding: false,
  },
  workoutLogNotesInput: {
    backgroundColor: appStyle.colors.surfaceElevated, // #334155 (Slate-700)
    borderRadius: appStyle.roundness.medium, // 12px
    padding: appStyle.spacing.md, // 16px
    minHeight: 80,
    color: appStyle.colors.text, // #FFFFFF
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  workoutLogSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    padding: appStyle.spacing.lg, // 24px
    borderRadius: 16, // Exact 16px as specified
    marginBottom: appStyle.spacing.lg,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    ...appStyle.shadows.medium, // Premium shadow
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
    padding: appStyle.spacing.lg, // 24px
    paddingTop: appStyle.spacing.sm + 2, // 10px
    borderTopWidth: 1,
    borderTopColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    gap: appStyle.spacing.sm + 2, // 10px
    backgroundColor: appStyle.colors.background, // #0F172A (Slate-900)
  },
  workoutLogCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35', // Orange accent
    paddingVertical: appStyle.spacing.md + 1, // 17px (min 44px touch target)
    borderRadius: 16, // Exact 16px as specified
    alignItems: 'center',
    minHeight: 44, // Minimum touch target
  },
  workoutLogCancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    textAlign: 'center',
    includeFontPadding: false,
  },
  workoutLogFinishButton: {
    flex: 2,
    borderRadius: 16, // Exact 16px as specified
    overflow: 'hidden',
    minHeight: 44, // Minimum touch target
    ...appStyle.shadows.accent, // Premium shadow with orange glow
  },
  workoutLogFinishButtonGradient: {
    paddingVertical: appStyle.spacing.md + 1, // 17px (min 44px touch target)
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  workoutLogFinishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default LogWorkoutView;
