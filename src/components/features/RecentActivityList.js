import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import styles from './RecentActivityList.styles';

/**
 * Recent activity list component showing last 3 workout entries
 * 
 * @param {Object} props - Component props
 * @param {Array} props.entries - Array of workout entries
 */
const RecentActivityList = ({ entries }) => {
  // Bulletproof array handling
  const recentEntries = Array.isArray(entries) ? entries.slice(-3).reverse() : [];

  if (recentEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📝 Recent Activity</Text>
        <MaterialCommunityIcons name="history" size={20} color={appStyle.colors.accent} />
      </View>
      <View style={styles.recentList}>
        {recentEntries.map((entry, index) => (
          <View key={entry.id || `entry-${index}`} style={styles.recentItem}>
            <MaterialCommunityIcons
              name={entry.did_cardio ? "run" : "dumbbell"}
              size={20}
              color={appStyle.colors.accent}
            />
            <View style={styles.recentTextContainer}>
              <Text style={styles.recentDate}>{entry.date || 'No date'}</Text>
              <Text style={styles.recentDetails}>
                {entry.body_weight || 0}kg • {entry.did_cardio ? 'Cardio' : 'Strength'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecentActivityList;
