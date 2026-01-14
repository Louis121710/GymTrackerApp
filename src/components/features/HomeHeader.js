import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { getGreeting, getTimeIcon } from '../../utils/formatters';
import { getProgressText } from '../../utils/progressCalculations';
import styles from './HomeHeader.styles';

/**
 * Home page header component with greeting, user info, and progress
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentUser - Current username
 * @param {Object} props.stats - User statistics object
 * @param {string} props.goal - User's fitness goal
 */
const HomeHeader = ({ currentUser, stats, goal }) => {
  return (
    <LinearGradient
      colors={['#000000', '#0F172A']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.welcomeSection}>
          <View style={styles.greetingRow}>
            <MaterialCommunityIcons name={getTimeIcon()} size={20} color="#FFFFFF" />
            <Text style={styles.greeting}>{getGreeting()}</Text>
          </View>
          <Text style={styles.username}>{currentUser || 'Fitness Warrior'}! 👋</Text>
          <Text style={styles.subtitle}>Today is your day to shine✨</Text>
        </View>
        <View style={styles.statsOverview}>
          <LinearGradient
            colors={appStyle.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statPill}
          >
            <MaterialCommunityIcons name="dumbbell" size={16} color="#000000" />
            <Text style={styles.statPillText}>{stats.totalWorkouts}</Text>
          </LinearGradient>
          <LinearGradient
            colors={appStyle.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statPill}
          >
            <MaterialCommunityIcons name="fire" size={16} color="#000000" />
            <Text style={styles.statPillText}>{stats.currentStreak}w</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Progress Text */}
      {stats.currentWeight > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Progress to {goal === 'lose_weight' ? 'Weight Loss' :
                         goal === 'gain_muscle' ? 'Muscle Gain' : 'Maintenance'}
            </Text>
            <Text style={styles.progressText}>
              {stats.currentWeight}kg / {stats.goalWeight}kg
            </Text>
          </View>
          <Text style={styles.progressSubtext}>{getProgressText()}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default HomeHeader;
