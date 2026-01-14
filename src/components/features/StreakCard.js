/**
 * Streak card component with gradient background
 * Displays workout streak information with optional main card styling
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';

const StreakCard = ({ streak, label, isMain = false, message }) => (
  <LinearGradient
    colors={isMain ? appStyle.gradients.accent : appStyle.gradients.card}
    style={[styles.streakCard, isMain && styles.mainStreakCard]}
  >
    <Text style={[styles.streakValue, isMain && styles.mainStreakValue]}>
      {streak}
    </Text>
    <Text style={[styles.streakLabel, isMain && styles.mainStreakLabel]}>
      {label}
    </Text>
    {isMain && streak > 0 && message && (
      <Text style={styles.streakMessage}>
        {message}
      </Text>
    )}
  </LinearGradient>
);

const styles = StyleSheet.create({
  streakCard: {
    flex: 1,
    borderRadius: 16, // Exact 16px as specified
    padding: appStyle.spacing.md, // 16px professional spacing
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    ...appStyle.shadows.medium, // Enhanced shadow
    minHeight: 100, // Professional spacing
  },
  mainStreakCard: {
    flex: 2,
    padding: appStyle.spacing.lg, // 24px for main card
    borderWidth: 0, // No border for gradient main card
  },
  streakValue: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  mainStreakValue: {
    fontSize: 42,
    color: '#FFFFFF',
  },
  streakLabel: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  mainStreakLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  streakMessage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default StreakCard;
