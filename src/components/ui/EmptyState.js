/**
 * Empty state component for displaying when lists are empty
 * Reusable across multiple screens
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';

const EmptyState = ({ 
  icon = "clipboard-text-outline", 
  title = "No Data", 
  subtitle = "Start adding items to see them here",
  actionLabel,
  onAction 
}) => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons name={icon} size={80} color="#888" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAction}
      >
        <Text style={styles.actionButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
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
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: appStyle.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default EmptyState;
