/**
 * Exercise item component for displaying exercise with sets in workout creation
 * Handles backward compatibility with old exercise format
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';

const ExerciseItem = ({ item, index, onEdit, onDelete }) => {
  // Handle backward compatibility: convert old format to new format
  const sets = item.sets && Array.isArray(item.sets) 
    ? item.sets 
    : item.weight !== undefined && item.reps !== undefined
      ? [{ weight: item.weight, reps: item.reps }]
      : [];
  
  return (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => onEdit && onEdit(index)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        {sets.length > 0 && (
          <View style={styles.setsContainer}>
            {(Array.isArray(sets) ? sets : []).map((set, setIndex) => (
              <Text key={setIndex} style={styles.setDetail}>
                {`Set ${setIndex + 1}: ${set.weight}kg × ${set.reps} reps${setIndex < sets.length - 1 ? ' • ' : ''}`}
              </Text>
            ))}
          </View>
        )}
      </View>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteExerciseButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  setsContainer: {
    marginTop: 5,
  },
  setDetail: {
    color: appStyle.colors.textSecondary,
    fontSize: 13,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 2,
  },
  deleteExerciseButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default ExerciseItem;
