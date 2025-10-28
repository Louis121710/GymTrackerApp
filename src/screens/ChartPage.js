import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import appStyle from '../../appStyle';
import { loadEntries } from '../utils/storage';

const ChartPage = () => {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('weight');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadEntriesData();
  }, []);

  const loadEntriesData = async () => {
    const loadedEntries = await loadEntries();
    // Sort by timestamp ascending for charts
    const sortedEntries = loadedEntries.sort((a, b) => a.timestamp - b.timestamp);
    setEntries(sortedEntries);
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
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Group by date and count workouts per day
    const workoutCount = {};
    filteredData.forEach(entry => {
      if (entry.timestamp) {
        const dateKey = new Date(entry.timestamp).toDateString();
        workoutCount[dateKey] = (workoutCount[dateKey] || 0) + 1;
      }
    });

    const dates = Object.keys(workoutCount).sort();

    return {
      labels: dates.map(date => formatDateLabel(new Date(date).getTime(), timeRange)),
      datasets: [{
        data: dates.map(date => workoutCount[date]),
        color: () => appStyle.colors.accent,
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
    backgroundColor: appStyle.colors.surface,
    backgroundGradientFrom: appStyle.colors.surface,
    backgroundGradientTo: appStyle.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(239, 83, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: appStyle.colors.primary,
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const { totalCardio, cardioPercentage } = getCardioStats();
  const filteredData = getFilteredData();

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Analytics</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

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
          color="#4CAF50"
        />
        <StatCard
          icon="run"
          value={totalCardio}
          label="Cardio"
          color="#2196F3"
        />
        <StatCard
          icon="percent"
          value={`${cardioPercentage}%`}
          label="Cardio Rate"
          color="#FF9800"
        />
        <StatCard
          icon="trending-up"
          value={filteredData.length > 1 ?
            (filteredData[filteredData.length - 1].body_weight - filteredData[0].body_weight).toFixed(1) + 'kg' : '0kg'
          }
          label="Change"
          color="#E91E63"
        />
      </View>

      {/* Chart Tabs */}
      <View style={styles.tabContainer}>
        {['weight', 'workouts'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab === 'weight' ? 'Weight Trend' : 'Workout Frequency'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Charts */}
      <View style={styles.chartContainer}>
        {activeTab === 'weight' && (
          <>
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
          </>
        )}

        {activeTab === 'workouts' && (
          <>
            <Text style={styles.chartTitle}>Workout Frequency</Text>
            {filteredData.length > 0 ? (
              <BarChart
                data={getWorkoutChartData()}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
              />
            ) : (
              <View style={styles.emptyChart}>
                <MaterialCommunityIcons name="chart-bar" size={40} color="#888" />
                <Text style={styles.emptyChartText}>No workout data available</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Insights */}
      {filteredData.length > 1 && (
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
    paddingTop: 40,
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
    backgroundColor: appStyle.colors.primary,
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
    backgroundColor: appStyle.colors.surface,
    padding: 12,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 3,
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
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: appStyle.colors.primary,
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
  chartContainer: {
    backgroundColor: appStyle.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  chartTitle: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
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
  insightsContainer: {
    backgroundColor: appStyle.colors.surface,
    margin: 20,
    borderRadius: 12,
    padding: 15,
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
});

export default ChartPage;