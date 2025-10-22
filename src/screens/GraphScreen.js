import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { loadEntries } from '../utils/storage';
import { theme } from '../../theme';

export default function GraphScreen() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await loadEntries() || [];
      setEntries(data);
    };
    load();
  }, []);

  if (entries.length === 0) {
    return (
      <View style={theme.container}>
        <Text style={theme.emptyText}>No data to display graph</Text>
      </View>
    );
  }

  const data = {
    labels: entries.map(e => e.date.split('-').slice(1).join('-')), // MM-DD
    datasets: [{ data: entries.map(e => e.body_weight), color: () => theme.colors.primary }],
  };

  return (
    <View style={theme.container}>
      <Text style={theme.title}>Weight Progress</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: theme.colors.background,
          backgroundGradientFrom: theme.colors.background,
          backgroundGradientTo: theme.colors.background,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(198, 40, 40, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '1', stroke: '#C62828' },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
}