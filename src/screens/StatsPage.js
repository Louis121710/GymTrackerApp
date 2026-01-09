import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import appStyle from '../../appStyle';
import { loadEntries, getCurrentUser, loadWorkoutLogs, loadPersonalRecords, loadExerciseHistory } from '../utils/storage';

const StatsPage = () => {
  const [entries, setEntries] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});
  const [activeTab, setActiveTab] = useState('workouts');
  const [workoutChartTab, setWorkoutChartTab] = useState('weight');
  const [exerciseMetric, setExerciseMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseStats, setExerciseStats] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    loadAllData();
  }, [isFocused]);

  const loadAllData = async () => {
    const username = await getCurrentUser();
    if (!username) {
      setEntries([]);
      setWorkoutLogs([]);
      setPersonalRecords({});
      return;
    }
    
    const loadedEntries = await loadEntries(username);
    const sortedEntries = loadedEntries.sort((a, b) => a.timestamp - b.timestamp);
    setEntries(sortedEntries);

    const logs = await loadWorkoutLogs(username);
    setWorkoutLogs(logs);

    const prs = await loadPersonalRecords(username);
    setPersonalRecords(prs);

    // Process exercise stats
    processExerciseStats(logs);
  };

  const processExerciseStats = (logs) => {
    const stats = {};
    
    logs.forEach(log => {
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(exercise => {
          if (!exercise.name) return;
          
          const exerciseName = exercise.name.toLowerCase();
          if (!stats[exerciseName]) {
            stats[exerciseName] = {
              name: exercise.name,
              sessions: [],
              totalSets: 0,
              totalVolume: 0,
              maxWeight: 0,
              maxReps: 0,
              maxVolume: 0,
              avgWeight: 0,
              avgReps: 0,
              lastPerformed: null
            };
          }

          const exerciseData = stats[exerciseName];
          exerciseData.sessions.push({
            date: log.date,
            timestamp: log.timestamp,
            sets: exercise.sets || []
          });

          if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              const weight = parseFloat(set.weight) || 0;
              const reps = parseFloat(set.reps) || 0;
              const volume = weight * reps;

              exerciseData.totalSets++;
              exerciseData.totalVolume += volume;
              
              if (weight > exerciseData.maxWeight) exerciseData.maxWeight = weight;
              if (reps > exerciseData.maxReps) exerciseData.maxReps = reps;
              if (volume > exerciseData.maxVolume) exerciseData.maxVolume = volume;
            });
          }

          if (log.timestamp && (!exerciseData.lastPerformed || log.timestamp > exerciseData.lastPerformed)) {
            exerciseData.lastPerformed = log.timestamp;
          }
        });
      }
    });

    // Calculate averages
    Object.keys(stats).forEach(key => {
      const data = stats[key];
      if (data.totalSets > 0) {
        const allWeights = [];
        const allReps = [];
        
        data.sessions.forEach(session => {
          session.sets.forEach(set => {
            const weight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;
            if (weight > 0) allWeights.push(weight);
            if (reps > 0) allReps.push(reps);
          });
        });

        data.avgWeight = allWeights.length > 0 
          ? allWeights.reduce((a, b) => a + b, 0) / allWeights.length 
          : 0;
        data.avgReps = allReps.length > 0 
          ? allReps.reduce((a, b) => a + b, 0) / allReps.length 
          : 0;
      }
    });

    setExerciseStats(stats);
  };

  const getFilteredData = () => {
    const now = new Date();
    const filtered = entries.filter(entry => {
      if (!entry.timestamp) return false;

      const entryDate = new Date(entry.timestamp);
      const diffTime = Math.abs(now - entryDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timeRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'all': return true;
        default: return diffDays <= 7;
      }
    });

    return filtered.length > 0 ? filtered : entries;
  };

  const formatDateLabel = (timestamp, range) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (range === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getWeightChartData = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    return {
      labels: filteredData.map(entry => formatDateLabel(entry.timestamp, timeRange)),
      datasets: [{
        data: filteredData.map(entry => entry.body_weight || 0),
        color: () => appStyle.colors.primary,
        strokeWidth: 2,
      }],
    };
  };

  const getWorkoutChartData = () => {
    // Filter workout logs by time range
    const now = new Date();
    const filteredLogs = workoutLogs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = new Date(log.timestamp);
      const diffTime = Math.abs(now - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timeRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'all': return true;
        default: return diffDays <= 7;
      }
    });

    if (filteredLogs.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Group by date and calculate total volume per day
    const dailyVolume = {};
    filteredLogs.forEach(log => {
      if (!log.timestamp || !log.exercises) return;
      
      const dateKey = new Date(log.timestamp).toDateString();
      let workoutVolume = 0;

      if (Array.isArray(log.exercises)) {
        log.exercises.forEach(exercise => {
          if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              const weight = parseFloat(set.weight) || 0;
              const reps = parseFloat(set.reps) || 0;
              workoutVolume += weight * reps;
            });
          }
        });
      }

      dailyVolume[dateKey] = (dailyVolume[dateKey] || 0) + workoutVolume;
    });

    const dates = Object.keys(dailyVolume).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: dates.map(date => formatDateLabel(new Date(date).getTime(), timeRange)),
      datasets: [{
        data: dates.map(date => Math.round(dailyVolume[date])),
        color: () => appStyle.colors.accent,
      }],
    };
  };

  const getExerciseChartData = (exerciseName, metric = 'weight') => {
    if (!selectedExercise || !exerciseStats[selectedExercise.toLowerCase()]) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    const exerciseData = exerciseStats[selectedExercise.toLowerCase()];
    const sessions = exerciseData.sessions
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .slice(-10); // Last 10 sessions

    if (sessions.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    let data = [];
    sessions.forEach(session => {
      if (metric === 'weight') {
        const maxWeight = Math.max(...session.sets.map(s => parseFloat(s.weight) || 0));
        data.push(maxWeight);
      } else if (metric === 'reps') {
        const maxReps = Math.max(...session.sets.map(s => parseFloat(s.reps) || 0));
        data.push(maxReps);
      } else if (metric === 'volume') {
        const totalVolume = session.sets.reduce((sum, s) => {
          return sum + ((parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0));
        }, 0);
        data.push(totalVolume);
      }
    });

    return {
      labels: sessions.map(s => formatDateLabel(s.timestamp, timeRange)),
      datasets: [{
        data: data,
        color: () => appStyle.colors.primary,
        strokeWidth: 2,
      }],
    };
  };

  const getCardioStats = () => {
    const filteredData = getFilteredData();
    const totalCardio = filteredData.filter(entry => entry.did_cardio).length;
    const cardioPercentage = filteredData.length > 0 ? (totalCardio / filteredData.length) * 100 : 0;

    return { totalCardio, cardioPercentage: cardioPercentage.toFixed(1) };
  };

  const chartConfig = {
    backgroundColor: appStyle.colors.cardBackground,
    backgroundGradientFrom: appStyle.colors.cardBackground,
    backgroundGradientTo: appStyle.colors.cardBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(239, 83, 80, ${opacity})`, // Lighter red
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: appStyle.colors.accent,
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const { totalCardio, cardioPercentage } = getCardioStats();
  const filteredData = getFilteredData();
  const exerciseList = Object.values(exerciseStats).sort((a, b) => 
    (b.lastPerformed || 0) - (a.lastPerformed || 0)
  );

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ExerciseCard = ({ exercise }) => {
    const pr = personalRecords[exercise.name.toLowerCase()] || {};
    const isSelected = selectedExercise && selectedExercise.toLowerCase() === exercise.name.toLowerCase();

    return (
      <TouchableOpacity
        onPress={() => setSelectedExercise(exercise.name)}
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
            <Text style={styles.exerciseStatValue}>{exercise.sessions.length}</Text>
          </View>
          <View style={styles.exerciseStatItem}>
            <Text style={styles.exerciseStatLabel}>Max Weight</Text>
            <Text style={styles.exerciseStatValue}>{exercise.maxWeight.toFixed(1)}kg</Text>
          </View>
          <View style={styles.exerciseStatItem}>
            <Text style={styles.exerciseStatLabel}>Max Reps</Text>
            <Text style={styles.exerciseStatValue}>{exercise.maxReps}</Text>
          </View>
          <View style={styles.exerciseStatItem}>
            <Text style={styles.exerciseStatLabel}>Total Volume</Text>
            <Text style={styles.exerciseStatValue}>{exercise.totalVolume.toFixed(0)}kg</Text>
            </View>
          </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={appStyle.gradients.header}
        style={styles.header}
      >
        <Text style={styles.title}>Stats & Analytics</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </LinearGradient>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {['week', 'month', 'all'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive
            ]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="chart-line"
          value={filteredData.length}
          label="Records"
          color={appStyle.colors.primary}
        />
        <StatCard
          icon="dumbbell"
          value={exerciseList.length}
          label="Exercises"
          color={appStyle.colors.accentLight}
        />
        <StatCard
          icon="run"
          value={totalCardio}
          label="Cardio"
          color={appStyle.colors.primaryLight}
        />
        <StatCard
          icon="trending-up"
          value={filteredData.length > 1 ?
            (filteredData[filteredData.length - 1].body_weight - filteredData[0].body_weight).toFixed(1) + 'kg' : '0kg'
          }
          label="Change"
          color={appStyle.colors.accent}
        />
      </View>

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        {['workouts', 'exercises'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive
            ]}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'workouts') setSelectedExercise(null);
            }}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab === 'workouts' ? 'Workouts' : 'Exercises'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Workout Charts Section */}
      {activeTab === 'workouts' && (
        <>
          {/* Chart Tabs */}
          <View style={styles.subTabContainer}>
            {['weight', 'workouts'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.subTabButton,
                  workoutChartTab === tab && styles.subTabButtonActive
                ]}
                onPress={() => setWorkoutChartTab(tab)}
              >
                <Text style={[
                  styles.subTabText,
                  workoutChartTab === tab && styles.subTabTextActive
                ]}>
                  {tab === 'weight' ? 'Weight Trend' : 'Volume Progression'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Charts */}
          {workoutChartTab === 'weight' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Body Weight Progress</Text>
              {filteredData.length > 0 ? (
                <LineChart
                  data={getWeightChartData()}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <MaterialCommunityIcons name="chart-line" size={40} color="#888" />
                  <Text style={styles.emptyChartText}>No weight data available</Text>
                </View>
              )}
            </View>
          )}

          {workoutChartTab === 'workouts' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Total Volume Progression</Text>
              <Text style={styles.chartSubtitle}>Total weight lifted per workout (kg)</Text>
              {workoutLogs.length > 0 ? (
                <LineChart
                  data={getWorkoutChartData()}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <MaterialCommunityIcons name="weight-kilogram" size={40} color="#888" />
                  <Text style={styles.emptyChartText}>No volume data available</Text>
                  <Text style={styles.emptyChartSubtext}>Start logging workouts to see your volume progression</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {/* Exercise Stats Section */}
      {activeTab === 'exercises' && (
        <>
          {exerciseList.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="dumbbell" size={60} color="#666" />
              <Text style={styles.emptyStateText}>No exercise data yet</Text>
              <Text style={styles.emptyStateSubtext}>Start logging workouts to see your exercise stats</Text>
            </View>
          ) : (
            <>
              {/* Exercise List */}
              <View style={styles.exerciseListContainer}>
                <Text style={styles.sectionTitle}>All Exercises ({exerciseList.length})</Text>
                <FlatList
                  data={exerciseList}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={({ item }) => <ExerciseCard exercise={item} />}
                  scrollEnabled={false}
                />
              </View>

              {/* Selected Exercise Charts */}
              {selectedExercise && exerciseStats[selectedExercise.toLowerCase()] && (
                <View style={styles.exerciseChartsContainer}>
                  <View style={styles.selectedExerciseHeader}>
                    <Text style={styles.selectedExerciseTitle}>{selectedExercise}</Text>
                    <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                      <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Exercise Chart Tabs */}
                  <View style={styles.exerciseChartTabs}>
                    {['weight', 'reps', 'volume'].map((metric) => (
                      <TouchableOpacity
                        key={metric}
                        style={[
                          styles.exerciseChartTab,
                          exerciseMetric === metric && styles.exerciseChartTabActive
                        ]}
                        onPress={() => setExerciseMetric(metric)}
                      >
                        <Text style={[
                          styles.exerciseChartTabText,
                          exerciseMetric === metric && styles.exerciseChartTabTextActive
                        ]}>
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Exercise Chart */}
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>
                      {exerciseMetric === 'weight' ? 'Max Weight Over Time' :
                       exerciseMetric === 'reps' ? 'Max Reps Over Time' :
                       'Total Volume Over Time'}
                    </Text>
                    <LineChart
                      data={getExerciseChartData(selectedExercise, exerciseMetric)}
                      width={screenWidth}
                      height={200}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                    />
                  </View>

                  {/* Exercise PR Stats */}
                  {personalRecords[selectedExercise.toLowerCase()] && (
                    <View style={styles.prContainer}>
                      <Text style={styles.prTitle}>Personal Records</Text>
                      <View style={styles.prGrid}>
                        <View style={styles.prItem}>
                          <Text style={styles.prLabel}>Max Weight</Text>
                          <Text style={styles.prValue}>
                            {personalRecords[selectedExercise.toLowerCase()].maxWeight.toFixed(1)}kg
                          </Text>
                        </View>
                        <View style={styles.prItem}>
                          <Text style={styles.prLabel}>Max Reps</Text>
                          <Text style={styles.prValue}>
                            {personalRecords[selectedExercise.toLowerCase()].maxReps}
                          </Text>
                        </View>
                        <View style={styles.prItem}>
                          <Text style={styles.prLabel}>Max Volume</Text>
                          <Text style={styles.prValue}>
                            {personalRecords[selectedExercise.toLowerCase()].maxVolume.toFixed(0)}kg
                          </Text>
                        </View>
                        <View style={styles.prItem}>
                          <Text style={styles.prLabel}>Est. 1RM</Text>
                          <Text style={styles.prValue}>
                            {personalRecords[selectedExercise.toLowerCase()].maxOneRepMax.toFixed(1)}kg
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </>
      )}

      {/* Insights */}
      {filteredData.length > 1 && activeTab === 'workouts' && (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD700" />
            <Text style={styles.insightText}>
              {filteredData.length} workouts recorded in the last {timeRange}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD700" />
            <Text style={styles.insightText}>
              {cardioPercentage}% of your workouts included cardio
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: appStyle.colors.text,
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  subtitle: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: appStyle.colors.surface,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: appStyle.colors.accent,
  },
  timeRangeText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: appStyle.colors.cardBackground,
    padding: 12,
    borderRadius: 16,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  statValue: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginVertical: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: appStyle.colors.accent,
  },
  tabText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  subTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabButtonActive: {
    backgroundColor: appStyle.colors.accent,
  },
  subTabText: {
    color: appStyle.colors.text,
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  chartContainer: {
    backgroundColor: appStyle.colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.medium,
  },
  chartTitle: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  chartSubtitle: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 12,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 10,
  },
  emptyChartSubtext: {
    color: '#666',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 5,
    textAlign: 'center',
  },
  insightsContainer: {
    backgroundColor: appStyle.colors.cardBackground,
    margin: 20,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  insightsTitle: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginLeft: 8,
    flex: 1,
  },
  // Exercise Stats Styles
  exerciseListContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  exerciseChartsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectedExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedExerciseTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  exerciseChartTabs: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  exerciseChartTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  exerciseChartTabActive: {
    backgroundColor: appStyle.colors.accent,
  },
  exerciseChartTabText: {
    color: appStyle.colors.text,
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  exerciseChartTabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  prContainer: {
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  prTitle: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prItem: {
    width: '48%',
    backgroundColor: appStyle.colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  prLabel: {
    color: appStyle.colors.textSecondary,
    fontSize: 10,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 6,
  },
  prValue: {
    color: '#FFD700',
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default StatsPage;

