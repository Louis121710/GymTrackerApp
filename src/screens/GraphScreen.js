import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { loadEntries } from '../utils/storage';
import { theme } from '../../theme';

export default function GraphScreen() {
  const [entries, setEntries] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const data = await loadEntries();
      setEntries(data || []);
    };
    load();
  }, []);

  const chartData = {
    labels: entries.map(e => e.date),
    datasets: [{
      data: entries.map(e => e.body_weight),
    }],
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={<Text>Weight Graph</Text>} titleStyle={{ fontFamily: 'Inter-Bold', color: theme.colors.text }} />
      </Appbar.Header>
      <View style={{ padding: 16, alignItems: 'center' }}>
        {entries.length === 0 ? (
          <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>No data available</Text>
        ) : (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text,
              style: { borderRadius: theme.roundness },
              propsForDots: { r: '6', strokeWidth: '2', stroke: theme.colors.primary },
            }}
            bezier
            style={{ borderRadius: theme.roundness, elevation: theme.elevation.level2 }}
          />
        )}
      </View>
    </View>
  );
}