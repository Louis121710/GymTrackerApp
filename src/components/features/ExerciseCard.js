/**
 * Exercise card component for displaying exercise statistics
 * Used in StatsPage to show exercise performance metrics
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';

const ExerciseCard = ({ exercise, personalRecords, isSelected, onPress }) => {
  const pr = personalRecords?.[exercise.name.toLowerCase()] || {};
  
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(exercise.name)}
      style={[styles.exerciseCard, isSelected && styles.exerciseCardSelected]}
    >
      <View style={styles.exerciseCardHeader}>
        <Text style={styles.exerciseCardName}>{exercise.name}</Text>
        {pr.maxWeight > 0 && (
          <View style={styles.prBadge}>
            <MaterialCommunityIcons name="trophy" size={14} color="#FFD700" />
            <Text style={styles.prBadgeText}>PR</Text>
          </View>
        )}
      </View>
      <View style={styles.exerciseCardStats}>
        <View style={styles.exerciseStatItem}>
          <Text style={styles.exerciseStatLabel}>Sessions</Text>
          <Text style={styles.exerciseStatValue}>{exercise.sessions?.length || 0}</Text>
        </View>
        <View style={styles.exerciseStatItem}>
          <Text style={styles.exerciseStatLabel}>Max Weight</Text>
          <Text style={styles.exerciseStatValue}>{exercise.maxWeight?.toFixed(1) || '0'}kg</Text>
        </View>
        <View style={styles.exerciseStatItem}>
          <Text style={styles.exerciseStatLabel}>Max Reps</Text>
          <Text style={styles.exerciseStatValue}>{exercise.maxReps || 0}</Text>
        </View>
        <View style={styles.exerciseStatItem}>
          <Text style={styles.exerciseStatLabel}>Total Volume</Text>
          <Text style={styles.exerciseStatValue}>{exercise.totalVolume?.toFixed(0) || '0'}kg</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  exerciseCardSelected: {
    borderColor: appStyle.colors.accent,
    backgroundColor: appStyle.colors.surfaceElevated,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardName: {
    color: appStyle.colors.text,
    fontSize: 16,
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
  exerciseCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  exerciseStatLabel: {
    color: appStyle.colors.textSecondary,
    fontSize: 10,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  exerciseStatValue: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default ExerciseCard;
