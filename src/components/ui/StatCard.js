/**
 * Reusable stat card component displaying an icon, value, and label
 * Used across HomePage, StatsPage, and ProfilePage
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';

const StatCard = ({ icon, value, label, color, iconSize = 24 }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    padding: appStyle.spacing.md, // 16px
    borderRadius: 16, // Exact 16px as specified
    width: '48%',
    marginBottom: appStyle.spacing.sm, // 8px
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    ...appStyle.shadows.medium, // Enhanced shadow for premium look
    minHeight: 100, // Professional spacing
  },
  statValue: {
    ...appStyle.typography.h3, // White heading
    marginVertical: appStyle.spacing.xs, // 4px
  },
  statLabel: {
    ...appStyle.typography.small, // Slate-400 secondary text
    color: appStyle.colors.textSecondary, // #94A3B8
  },
});

export default StatCard;
