/**
 * Workout card component for displaying saved custom workouts
 * Shows workout types, day, exercises preview, and notes
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';

const WorkoutCard = ({ workout, onPress, onDelete }) => {
  // Handle both old format (string) and new format (array) for backward compatibility
  const workoutTypes = Array.isArray(workout.workoutType) 
    ? workout.workoutType 
    : workout.workoutType ? [workout.workoutType] : ['Other'];
  
  return (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => onPress && onPress(workout)}
      activeOpacity={0.7}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutHeaderLeft}>
          <View style={styles.workoutTypesContainer}>
            {(Array.isArray(workoutTypes) ? workoutTypes : []).map((type, index) => (
              <View key={index} style={styles.workoutTypeBadge}>
                <Text style={styles.workoutTypeText}>{type}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.workoutDay}>{workout.day}</Text>
        </View>
        {onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(workout.id);
            }}
            style={styles.deleteWorkoutButton}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.workoutExercises}>
        <Text style={styles.workoutExercisesTitle}>
          {`${workout.exercises?.length || 0} Exercise${((workout.exercises?.length || 0) !== 1) ? 's' : ''}`}
        </Text>
        {workout.exercises && workout.exercises.length > 0 ? (
          (Array.isArray(workout.exercises) ? workout.exercises : []).slice(0, 3).map((exercise, index) => {
            // Handle backward compatibility
            const sets = exercise.sets && Array.isArray(exercise.sets)
              ? exercise.sets
              : exercise.weight !== undefined && exercise.reps !== undefined
                ? [{ weight: exercise.weight, reps: exercise.reps }]
                : [];
            const setsText = sets.length > 0 
              ? (Array.isArray(sets) ? sets : []).map((set, i) => `${set.weight || 0}kg×${set.reps || 0}`).join(', ')
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

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    borderRadius: 16, // Exact 16px as specified
    padding: appStyle.spacing.md, // 16px professional spacing
    marginBottom: appStyle.spacing.md, // 16px
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    ...appStyle.shadows.medium, // Enhanced shadow for premium look
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutHeaderLeft: {
    flex: 1,
  },
  workoutTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  workoutTypeBadge: {
    backgroundColor: appStyle.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutTypeText: {
    color: appStyle.colors.text,
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutDay: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  deleteWorkoutButton: {
    padding: 8,
  },
  workoutExercises: {
    marginTop: 8,
  },
  workoutExercisesTitle: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 6,
  },
  workoutExerciseItem: {
    color: appStyle.colors.text,
    fontSize: 13,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  workoutExerciseMore: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    fontStyle: 'italic',
    marginTop: 4,
  },
  workoutNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: appStyle.colors.cardBorder,
  },
  workoutNotesLabel: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 4,
  },
  workoutNotesText: {
    color: appStyle.colors.text,
    fontSize: 13,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
});

export default WorkoutCard;
