import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { loadEntries, getCurrentUser, loadUsers } from '../utils/storage';

const { width } = Dimensions.get('window');

const HomePage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [userData, setUserData] = useState({
    goalWeight: 75,
    goal: 'lose_weight'
  });
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentWeight: 0,
    goalWeight: 75,
    cardioSessions: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  const dailyQuotes = [
    {
      quote: "The only bad workout is the one that didn't happen.",
      author: "Unknown"
    },
    {
      quote: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
      author: "Rikki Rogers"
    },
    {
      quote: "The body achieves what the mind believes.",
      author: "Unknown"
    },
    {
      quote: "Don't stop when you're tired. Stop when you're done.",
      author: "Unknown"
    },
    {
      quote: "Success starts with self-discipline.",
      author: "Unknown"
    },
    {
      quote: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Unknown"
    }
  ];

  const [dailyQuote, setDailyQuote] = useState(dailyQuotes[0]);

  useEffect(() => {
    loadUserData();
    setRandomQuote();
  }, [isFocused]);

  const setRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    setDailyQuote(dailyQuotes[randomIndex]);
  };

  const calculateStreak = (entries) => {
    if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        const diffTime = today - entryDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;

          for (let j = 1; j < sortedEntries.length; j++) {
            const prevDate = new Date(sortedEntries[j].date);
            prevDate.setHours(0, 0, 0, 0);

            const prevDiff = entryDate - prevDate;
            const prevDiffDays = Math.floor(prevDiff / (1000 * 60 * 60 * 24));

            if (prevDiffDays === 1) {
              currentStreak++;
              tempStreak++;
              entryDate.setDate(entryDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }

      if (i === 0 || tempStreak === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedEntries[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((entryDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { currentStreak, longestStreak };
  };

  const loadUserData = async () => {
    const username = await getCurrentUser();
    setCurrentUser(username);

    // Load user profile data to get goal weight
    if (username) {
      const users = await loadUsers();
      const user = users.find(u => u.username === username);
      if (user) {
        const userGoalWeight = parseFloat(user.goalWeight) || 75;
        const userGoal = user.goal || 'lose_weight';

        setUserData({
          goalWeight: userGoalWeight,
          goal: userGoal
        });
      }
    }

    const loadedEntries = await loadEntries();
    setEntries(loadedEntries);

    const { currentStreak, longestStreak } = calculateStreak(loadedEntries);

    if (loadedEntries.length > 0) {
      const latestEntry = loadedEntries[loadedEntries.length - 1];
      const cardioSessions = loadedEntries.filter(entry => entry.did_cardio).length;

      setStats({
        totalWorkouts: loadedEntries.length,
        currentWeight: latestEntry.body_weight,
        goalWeight: userData.goalWeight, // Use the updated goal weight
        cardioSessions: cardioSessions,
        currentStreak,
        longestStreak
      });
    } else {
      setStats(prev => ({
        ...prev,
        goalWeight: userData.goalWeight, // Use the updated goal weight
        currentStreak,
        longestStreak
      }));
    }
  };

  // FIXED: Correct progress calculation for weight loss
  const getProgressPercentage = () => {
    if (!stats.currentWeight || !stats.goalWeight) return 0;

    // For weight loss goal (current > goal)
    if (userData.goal === 'lose_weight') {
      if (stats.currentWeight <= stats.goalWeight) {
        return 100; // Goal achieved
      } else {
        // Calculate how much you've lost from starting point
        // We need a starting weight - use the first entry or current weight as reference
        const startingWeight = entries.length > 0 ? entries[0].body_weight : stats.currentWeight;
        const totalToLose = startingWeight - stats.goalWeight;
        const lostSoFar = startingWeight - stats.currentWeight;

        if (totalToLose <= 0) return 100; // Already at or below goal
        return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
      }
    }
    // For weight gain goal (current < goal)
    else if (userData.goal === 'gain_muscle') {
      if (stats.currentWeight >= stats.goalWeight) {
        return 100; // Goal achieved
      } else {
        const startingWeight = entries.length > 0 ? entries[0].body_weight : stats.currentWeight;
        const totalToGain = stats.goalWeight - startingWeight;
        const gainedSoFar = stats.currentWeight - startingWeight;

        if (totalToGain <= 0) return 100; // Already at or above goal
        return Math.min(100, Math.max(0, (gainedSoFar / totalToGain) * 100));
      }
    }
    // For maintain goal
    else {
      // For maintain, we can show consistency percentage
      // This is a simplified version - you might want to track consistency differently
      return stats.currentWeight === stats.goalWeight ? 100 : 50;
    }
  };

  const getProgressColor = () => {
    const progress = getProgressPercentage();
    if (progress >= 100) return '#4CAF50'; // Green when goal achieved
    if (progress >= 75) return '#8BC34A';  // Light green
    if (progress >= 50) return '#FFC107';  // Yellow
    if (progress >= 25) return '#FF9800';  // Orange
    return '#F44336'; // Red
  };

  const getProgressText = () => {
    if (!stats.currentWeight || !stats.goalWeight) return 'Start tracking to see progress';

    const difference = stats.currentWeight - stats.goalWeight;

    if (userData.goal === 'lose_weight') {
      if (difference > 0) {
        return `${difference.toFixed(1)}kg to lose`;
      } else if (difference < 0) {
        return `${Math.abs(difference).toFixed(1)}kg below goal`;
      } else {
        return 'Goal achieved! 🎉';
      }
    } else if (userData.goal === 'gain_muscle') {
      if (difference < 0) {
        return `${Math.abs(difference).toFixed(1)}kg to gain`;
      } else if (difference > 0) {
        return `${difference.toFixed(1)}kg above goal`;
      } else {
        return 'Goal achieved! 🎉';
      }
    } else {
      // maintain
      if (difference === 0) {
        return 'Perfectly maintaining! 🎉';
      } else {
        return `${Math.abs(difference).toFixed(1)}kg from target`;
      }
    }
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return 'Start your journey!';
    if (streak === 1) return 'Great start!';
    if (streak <= 3) return 'Building momentum!';
    if (streak <= 7) return 'On fire! 🔥';
    if (streak <= 14) return 'Unstoppable! 💪';
    if (streak <= 30) return 'Legendary! 🏆';
    return 'Godlike! ⚡';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'weather-sunny';
    if (hour < 18) return 'weather-partly-cloudy';
    return 'weather-night';
  };

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const StreakCard = ({ streak, label, isMain = false }) => (
    <LinearGradient
      colors={isMain ? ['#FF6B35', '#C62828'] : ['#2C2C2C', '#363636']}
      style={[styles.streakCard, isMain && styles.mainStreakCard]}
    >
      <Text style={[styles.streakValue, isMain && styles.mainStreakValue]}>
        {streak}
      </Text>
      <Text style={[styles.streakLabel, isMain && styles.mainStreakLabel]}>
        {label}
      </Text>
      {isMain && streak > 0 && (
        <Text style={styles.streakMessage}>
          {getStreakMessage(streak)}
        </Text>
      )}
    </LinearGradient>
  );

  const QuickAction = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={[color, '#C62828']}
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#2C2C2C', '#1C1C1C', '#0A0A0A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <View style={styles.greetingRow}>
              <MaterialCommunityIcons name={getTimeIcon()} size={20} color="#FFD700" />
              <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
            <Text style={styles.username}>{currentUser || 'Fitness Warrior'}! 👋</Text>
            <Text style={styles.subtitle}>Today is your day to shine ✨</Text>
          </View>
          <View style={styles.statsOverview}>
            <View style={styles.statPill}>
              <MaterialCommunityIcons name="dumbbell" size={16} color="#4CAF50" />
              <Text style={styles.statPillText}>{stats.totalWorkouts}</Text>
            </View>
            <View style={styles.statPill}>
              <MaterialCommunityIcons name="fire" size={16} color="#FF6B35" />
              <Text style={styles.statPillText}>{stats.currentStreak}d</Text>
            </View>
          </View>
        </View>

        {/* FIXED Progress Bar */}
        {stats.currentWeight > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progress to {userData.goal === 'lose_weight' ? 'Weight Loss' :
                           userData.goal === 'gain_muscle' ? 'Muscle Gain' : 'Maintenance'}
              </Text>
              <Text style={styles.progressText}>
                {stats.currentWeight}kg / {userData.goalWeight}kg
              </Text>
            </View>
            <Text style={styles.progressSubtext}>{getProgressText()}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getProgressColor()
                  }
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}% Complete
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Daily Motivation Card */}
      <TouchableOpacity style={styles.quoteCard} onPress={setRandomQuote}>
        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFD700" />
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>"{dailyQuote.quote}"</Text>
          <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
        </View>
        <MaterialCommunityIcons name="refresh" size={20} color="#888" />
      </TouchableOpacity>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Current Streak</Text>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
        </View>
        <View style={styles.streakContainer}>
          <StreakCard
            streak={stats.currentStreak}
            label="CONSECUTIVE DAYS"
            isMain={true}
          />
          <View style={styles.secondaryStreaks}>
            <StreakCard
              streak={stats.longestStreak}
              label="Longest Streak"
            />
            <StreakCard
              streak={stats.totalWorkouts}
              label="Total Workouts"
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
            color="#4CAF50"
          />
          <StatCard
            icon="scale"
            value={`${stats.currentWeight || 0}kg`}
            label="Current Weight"
            color="#2196F3"
          />
          <StatCard
            icon="flag"
            value={`${userData.goalWeight}kg`}
            label="Goal Weight"
            color="#FF9800"
          />
          <StatCard
            icon="run"
            value={stats.cardioSessions}
            label="Cardio Sessions"
            color="#E91E63"
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
            icon="format-list-bulleted"
            title="View History"
            subtitle="See all records"
            onPress={() => navigation.navigate('Records')}
            color="#4CAF50"
          />
          <QuickAction
            icon="chart-line"
            title="Progress"
            subtitle="View charts"
            onPress={() => navigation.navigate('Charts')}
            color="#2196F3"
          />
          <QuickAction
            icon="account"
            title="Profile"
            subtitle="Manage account"
            onPress={() => navigation.navigate('Profile')}
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Recent Activity */}
      {entries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Recent Activity</Text>
            <MaterialCommunityIcons name="history" size={20} color={appStyle.colors.accent} />
          </View>
          <View style={styles.recentList}>
            {entries.slice(-3).reverse().map((entry, index) => (
              <View key={entry.id || index} style={styles.recentItem}>
                <MaterialCommunityIcons
                  name={entry.did_cardio ? "run" : "dumbbell"}
                  size={20}
                  color={appStyle.colors.accent}
                />
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentDate}>{entry.date}</Text>
                  <Text style={styles.recentDetails}>{entry.body_weight}kg • {entry.did_cardio ? 'Cardio' : 'Strength'}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// ... (keep all your existing styles the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    opacity: 0.8,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  progressSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 8,
    opacity: 0.8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.surface,
    margin: 20,
    marginTop: -15,
    padding: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    gap: 15,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    lineHeight: 20,
    marginBottom: 5,
  },
  quoteAuthor: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  streakSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  mainStreakCard: {
    flex: 2,
    padding: 20,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: '#888',
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
  secondaryStreaks: {
    flex: 1,
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginVertical: 5,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  quickActions: {
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  recentList: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 15,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#363636',
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentDate: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 2,
  },
  recentDetails: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
});

export default HomePage;