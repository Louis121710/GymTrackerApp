/**
 * Quick action button component with gradient icon and text
 * Used for navigation shortcuts on the home page
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';

const QuickAction = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickAction} activeOpacity={0.8}>
    <LinearGradient
      colors={['#FF3333', '#FF6B35']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickActionGradient}
    >
      <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    </LinearGradient>
    <View style={styles.quickActionText}>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quickAction: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.cardBackground,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
});

export default QuickAction;
