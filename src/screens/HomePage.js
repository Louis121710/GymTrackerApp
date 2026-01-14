import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../appStyle';
import { useUserProfile } from '../context/UserProfileContext';
import StatCard from '../components/ui/StatCard';
import StreakCard from '../components/features/StreakCard';
import QuickAction from '../components/ui/QuickAction';
import HomeHeader from '../components/features/HomeHeader';
import DailyQuoteCard from '../components/features/DailyQuoteCard';
import RecentActivityList from '../components/features/RecentActivityList';
import { useHomeStats } from '../hooks/useHomeStats';
import { DAILY_QUOTES } from '../constants/quotes';
import styles from './HomePage.styles';

/**
 * Main dashboard screen displaying user stats, quotes, and quick actions
 * Refactored to use modular components and hooks for better maintainability
 */
const HomePage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { goalWeight, goal } = useUserProfile();
  const { entries, currentUser, stats, loadUserData } = useHomeStats(goalWeight);
  const [dailyQuote, setDailyQuote] = React.useState(DAILY_QUOTES[0]);

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused, goalWeight, goal]);

  useEffect(() => {
    setRandomQuote();
  }, []);

  /**
   * Set a quote based on the day of the year for consistency
   */
  const setRandomQuote = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % DAILY_QUOTES.length;
    setDailyQuote(DAILY_QUOTES[quoteIndex]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HomeHeader currentUser={currentUser} stats={stats} goal={goal} />

      <DailyQuoteCard quote={dailyQuote} />

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Current Streak</Text>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
        </View>
        <View style={styles.streakContainer}>
          <StreakCard
            streak={stats.currentStreak}
            label="CONSECUTIVE WEEKS"
            isMain={true}
          />
          <View style={styles.secondaryStreaks}>
            <StreakCard
              streak={stats.longestStreak}
              label="Longest Streak"
            />
            <StreakCard
              streak={stats.totalWorkouts}
              label="Total Records"
            />
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
          <MaterialCommunityIcons name="chart-box" size={20} color={appStyle.colors.accent} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            icon="dumbbell"
            value={stats.totalWorkouts}
            label="Workouts"
            color={appStyle.colors.primary}
          />
          <StatCard
            icon="scale"
            value={`${stats.currentWeight || 0}kg`}
            label="Current Weight"
            color={appStyle.colors.accentLight}
          />
          <StatCard
            icon="flag"
            value={`${goalWeight}kg`}
            label="Goal Weight"
            color={appStyle.colors.primaryLight}
          />
          <StatCard
            icon="run"
            value={stats.cardioSessions}
            label="Cardio Sessions"
            color={appStyle.colors.accent}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={appStyle.colors.accent} />
        </View>
        <View style={styles.quickActions}>
          <QuickAction
            icon="plus"
            title="Add Record"
            subtitle="Log your workout"
            onPress={() => navigation.navigate('AddRecord')}
            color={appStyle.colors.primary}
          />
          <QuickAction
            icon="chart-line"
            title="Progress"
            subtitle="View charts"
            onPress={() => navigation.navigate('Stats')}
            color={appStyle.colors.accentLight}
          />
          <QuickAction
            icon="account"
            title="Profile"
            subtitle="Manage account"
            onPress={() => navigation.navigate('Profile')}
            color={appStyle.colors.accent}
          />
        </View>
      </View>

      <RecentActivityList entries={entries} />
    </ScrollView>
  );
};

export default HomePage;
