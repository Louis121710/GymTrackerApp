import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import appStyle from '../../appStyle';
import { loadEntries, getCurrentUser, loadWorkoutLogs, loadPersonalRecords } from '../utils/storage';
import StatCard from '../components/ui/StatCard';
import ExerciseCard from '../components/features/ExerciseCard';
import { formatDateLabel } from '../utils/formatters';
import styles from './StatsPage.styles';

// Screen displaying various statistics and charts for workout data
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
    const safeEntries = Array.isArray(loadedEntries) ? loadedEntries : [];
    const sortedEntries = safeEntries.sort((a, b) => a.timestamp - b.timestamp);
    setEntries(sortedEntries);

    const logs = await loadWorkoutLogs(username);
    const safeLogs = Array.isArray(logs) ? logs : [];
    setWorkoutLogs(safeLogs);

    const prs = await loadPersonalRecords(username);
    setPersonalRecords(prs);

    // Process exercise stats
    processExerciseStats(safeLogs);
  };

  const processExerciseStats = (logs) => {
    if (!logs || !Array.isArray(logs)) return;
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
    if (!entries || !Array.isArray(entries) || entries.length === 0) return [];
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

    return filtered.length > 0 ? filtered : (entries || []);
  };


  const getWeightChartData = () => {
    const filteredData = getFilteredData();

    if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Show data in chronological order (oldest to newest, left to right)
    return {
      labels: (Array.isArray(filteredData) ? filteredData : []).map(entry => formatDateLabel(entry.timestamp, timeRange)),
      datasets: [{
        data: (Array.isArray(filteredData) ? filteredData : []).map(entry => entry.body_weight || 0),
        color: () => '#FF6B35', // Orange accent from gradient
        strokeWidth: 3, // Premium line width
      }],
    };
  };

  const getWorkoutChartData = () => {
    // Filter workout logs by time range
    if (!workoutLogs || !Array.isArray(workoutLogs)) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }
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

    // Show data in chronological order (oldest to newest, left to right)
    return {
      labels: (Array.isArray(dates) ? dates : []).map(date => formatDateLabel(new Date(date).getTime(), timeRange)),
      datasets: [{
        data: (Array.isArray(dates) ? dates : []).map(date => Math.round(dailyVolume[date])),
        color: () => '#FF6B35', // Orange accent from gradient
        strokeWidth: 3, // Premium line width
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
    if (!exerciseData || !exerciseData.sessions || !Array.isArray(exerciseData.sessions)) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }
    
    const sessions = exerciseData.sessions
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .slice(-10); // Last 10 sessions

    if (!sessions || sessions.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    let data = [];
    sessions.forEach(session => {
      const sets = Array.isArray(session.sets) ? session.sets : [];
      if (metric === 'weight') {
        const maxWeight = sets.length > 0 ? Math.max(...(Array.isArray(sets) ? sets : []).map(s => parseFloat(s.weight) || 0)) : 0;
        data.push(maxWeight);
      } else if (metric === 'reps') {
        const maxReps = sets.length > 0 ? Math.max(...(Array.isArray(sets) ? sets : []).map(s => parseFloat(s.reps) || 0)) : 0;
        data.push(maxReps);
      } else if (metric === 'volume') {
        const totalVolume = sets.reduce((sum, s) => {
          return sum + ((parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0));
        }, 0);
        data.push(totalVolume);
      }
    });

    return {
      labels: (Array.isArray(sessions) ? sessions : []).map(s => formatDateLabel(s.timestamp, timeRange)),
      datasets: [{
        data: data,
        color: () => '#FF6B35', // Orange accent from gradient
        strokeWidth: 3, // Premium line width
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
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    backgroundGradientFrom: appStyle.colors.surface,
    backgroundGradientTo: appStyle.colors.surface,
    decimalPlaces: 1,
    // Orange gradient color for data lines (#FF3333 → #FF8C42)
    color: (opacity = 1) => {
      // Use the primary orange color with opacity
      return `rgba(255, 51, 51, ${opacity})`; // #FF3333 with opacity
    },
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // Slate-400 (#94A3B8)
    style: {
      borderRadius: 16, // Exact 16px as specified
    },
    propsForDots: {
      r: '6', // Slightly larger for premium look
      strokeWidth: '3',
      stroke: '#FF6B35', // Orange accent from gradient
      fill: '#FF3333', // Primary orange
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Solid lines
      stroke: appStyle.colors.cardBorder, // #334155 (Slate-700)
      strokeWidth: 1,
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const { totalCardio, cardioPercentage } = getCardioStats();
  const filteredData = getFilteredData();
  const exerciseList = Object.values(exerciseStats).sort((a, b) => 
    (b.lastPerformed || 0) - (a.lastPerformed || 0)
  );


  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#000000', '#0F172A']}
          style={styles.header}
        >
          <Text style={styles.title}>Stats & Analytics</Text>
          <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>Track your fitness journey</Text>
        </LinearGradient>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(Array.isArray(['week', 'month', 'all']) ? ['week', 'month', 'all'] : []).map((range) => (
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
        {(Array.isArray(['workouts', 'exercises']) ? ['workouts', 'exercises'] : []).map((tab) => (
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
            activeOpacity={0.8}
          >
            {activeTab === tab ? (
              <LinearGradient
                colors={['#FF3333', '#FF6B35', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabButtonGradient}
              >
                <Text style={[styles.tabText, styles.tabTextActive]}>
                  {tab === 'workouts' ? 'Workouts' : 'Exercises'}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabButtonInactive}>
                <Text style={styles.tabText}>
                  {tab === 'workouts' ? 'Workouts' : 'Exercises'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Workout Charts Section */}
      {activeTab === 'workouts' && (
        <>
          {/* Chart Tabs */}
          <View style={styles.subTabContainer}>
            {(Array.isArray(['weight', 'workouts']) ? ['weight', 'workouts'] : []).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.subTabButton,
                  workoutChartTab === tab && styles.subTabButtonActive
                ]}
                onPress={() => setWorkoutChartTab(tab)}
                activeOpacity={0.8}
              >
                {workoutChartTab === tab ? (
                  <LinearGradient
                    colors={['#FF3333', '#FF6B35', '#FF8C42']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subTabButtonGradient}
                  >
                    <Text style={[styles.subTabText, styles.subTabTextActive]}>
                      {tab === 'weight' ? 'Weight Trend' : 'Volume Progression'}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.subTabButtonInactive}>
                    <Text style={styles.subTabText}>
                      {tab === 'weight' ? 'Weight Trend' : 'Volume Progression'}
                    </Text>
                  </View>
                )}
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
              {workoutLogs && Array.isArray(workoutLogs) && workoutLogs.length > 0 ? (
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
                    {(Array.isArray(['weight', 'reps', 'volume']) ? ['weight', 'reps', 'volume'] : []).map((metric) => (
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

      {/* Workout Summary */}
      {activeTab === 'workouts' && (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Workout Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Volume Lifted</Text>
            <Text style={styles.summaryValue}>
              {(workoutLogs && Array.isArray(workoutLogs) ? workoutLogs : []).reduce((total, log) => {
                if (log.exercises && Array.isArray(log.exercises)) {
                  log.exercises.forEach(exercise => {
                    if (exercise.sets && Array.isArray(exercise.sets)) {
                      exercise.sets.forEach(set => {
                        const weight = parseFloat(set.weight) || 0;
                        const reps = parseFloat(set.reps) || 0;
                        total += weight * reps;
                      });
                    }
                  });
                }
                return total;
              }, 0).toLocaleString()} kg
            </Text>
          </View>
        </View>
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

export default StatsPage;

