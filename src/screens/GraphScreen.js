// GraphScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { loadEntries } from '../utils/storage';
import { theme } from '../../theme';

export default function GraphScreen() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await loadEntries();
      setEntries(data);
    };
    load();
  }, []);

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No data to display graph</Text>
      </View>
    );
  }

  const data = {
    labels: entries.map(e => e.date.split('-').slice(1).join('-')), // Shorten to MM-DD
    datasets: [{ data: entries.map(e => e.body_weight) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Body Weight Over Time</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 32}
        height={300}
        chartConfig={{
          backgroundColor: theme.colors.background,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 1,
          color: () => theme.colors.accent,
          labelColor: () => theme.colors.text,
          propsForDots: { r: '6', strokeWidth: '2', stroke: theme.colors.primary },
          propsForBackgroundLines: { stroke: '#424242' },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 8,
    elevation: 4,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
});