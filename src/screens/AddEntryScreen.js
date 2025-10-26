import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, Appbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { saveEntries, loadEntries } from '../utils/storage';
import { theme } from '../../theme';

export default function AddEntryScreen() {
  const [weight, setWeight] = useState('');
  const [cardio, setCardio] = useState(false);
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const navigation = useNavigation();
  const route = useRoute();
  const { index, entry } = route.params || {};

  useEffect(() => {
    if (entry) {
      setWeight(entry.body_weight.toString());
      setCardio(!!entry.did_cardio);
      setDate(entry.date);
    }
  }, [entry]);

  const saveEntry = async () => {
    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      Alert.alert('Invalid Input', 'Weight must be a positive number');
      return;
    }
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      Alert.alert('Invalid Date', 'Use YYYY-MM-DD format');
      return;
    }
    const newEntry = { body_weight: parseFloat(weight), did_cardio: cardio ? 1 : 0, date };
    const entries = await loadEntries() || [];
    if (index !== undefined) {
      entries[index] = newEntry;
    } else {
      entries.push(newEntry);
    }
    await saveEntries(entries);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={<Text>{index !== undefined ? 'Edit Entry' : 'Add Entry'}</Text>} titleStyle={{ fontFamily: 'Inter-Bold', color: theme.colors.text }} />
      </Appbar.Header>
      <View style={{ padding: 16 }}>
        <TextInput
          label={<Text>Date (YYYY-MM-DD)</Text>}
          value={date}
          onChangeText={setDate}
          style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
        />
        <TextInput
          label={<Text>Body Weight (kg)</Text>}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular', marginRight: 8 }}>Did Cardio?</Text>
          <Switch value={cardio} onValueChange={setCardio} color={theme.colors.accent} />
        </View>
        <Button mode="contained" onPress={saveEntry} style={{ borderRadius: theme.roundness }}>
          <Text>Save Entry</Text>
        </Button>
      </View>
    </View>
  );
}