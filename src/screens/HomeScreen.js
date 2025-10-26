import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Button, Appbar, Text, Divider, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { loadEntries, saveEntries } from '../utils/storage';
import { theme } from '../../theme';
import EntryListItem from '../components/EntryListItem';

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);
  const [entryStreak, setEntryStreak] = useState(0);
  const [cardioStreak, setCardioStreak] = useState(0);
  const navigation = useNavigation();

  const loadAndCalculate = async () => {
    const data = await loadEntries();
    setEntries(data || []);
    calculateStreaks(data || []);
  };

  useEffect(() => {
    loadAndCalculate();
    const unsubscribe = navigation.addListener('focus', loadAndCalculate);
    return unsubscribe;
  }, [navigation]);

  const calculateStreaks = (data) => {
    if (data.length === 0) {
      setEntryStreak(0);
      setCardioStreak(0);
      return;
    }

    const groupedByDate = data.reduce((acc, entry) => {
      const dateKey = moment(entry.date).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = { hasCardio: entry.did_cardio === 1 };
      } else {
        if (entry.did_cardio === 1) acc[dateKey].hasCardio = true;
      }
      return acc;
    }, {});

    const uniqueDates = Object.keys(groupedByDate).sort((a, b) => moment(b) - moment(a));

    let entryCount = 1;
    let currentDate = moment(uniqueDates[0]);
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = moment(uniqueDates[i]);
      if (currentDate.diff(prevDate, 'days') === 1) {
        entryCount++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    setEntryStreak(entryCount);

    let cardioCount = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (groupedByDate[uniqueDates[i]].hasCardio) {
        cardioCount++;
      } else {
        break;
      }
    }
    setCardioStreak(cardioCount);
  };

  const editEntry = (index) => {
    navigation.navigate('AddEntry', { index, entry: entries[index] });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.Content title={<Text>Gym Tracker</Text>} titleStyle={{ fontFamily: 'Inter-Bold', color: theme.colors.text }} />
      </Appbar.Header>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Card style={{ flex: 1, marginRight: 8, padding: 16, borderRadius: theme.roundness, elevation: theme.elevation.level2 }}>
            <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>Entry Streak</Text>
            <Text style={{ color: theme.colors.primary, fontFamily: 'Inter-Bold', fontSize: 24 }}>{entryStreak} days</Text>
          </Card>
          <Card style={{ flex: 1, marginLeft: 8, padding: 16, borderRadius: theme.roundness, elevation: theme.elevation.level2 }}>
            <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>Cardio Streak</Text>
            <Text style={{ color: theme.colors.primary, fontFamily: 'Inter-Bold', fontSize: 24 }}>{cardioStreak} days</Text>
          </Card>
        </View>
        <Button mode="contained" onPress={() => navigation.navigate('AddEntry')} style={{ marginBottom: 8, borderRadius: theme.roundness }}>
          <Text>Add Entry</Text>
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Graph')} style={{ borderRadius: theme.roundness }}>
          <Text>View Graph</Text>
        </Button>
      </View>
      <Divider />
      <FlatList
        data={entries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <EntryListItem item={item} onEdit={() => editEntry(index)} />
        )}
        ListEmptyComponent={<Text style={{ color: theme.colors.text, textAlign: 'center', marginTop: 20, fontFamily: 'Inter-Regular' }}>No entries yet</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}