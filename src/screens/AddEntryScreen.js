import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
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
      setCardio(entry.cardio || false);
      setDate(entry.date);
    }
  }, [entry]);

  const saveEntry = async () => {
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      Alert.alert('Invalid Date', 'Use YYYY-MM-DD format.');
      return;
    }
    const newEntry = { body_weight: parseFloat(weight), cardio, date };
    const currentEntries = await loadEntries() || [];
    let updatedEntries;
    if (index !== undefined) {
      updatedEntries = [...currentEntries];
      updatedEntries[index] = newEntry;
    } else {
      updatedEntries = [newEntry, ...currentEntries];
    }
    await saveEntries(updatedEntries);
    navigation.goBack();
  };

  return (
    <View style={theme.container}>
      <Text style={theme.title}>{index !== undefined ? 'Edit Entry' : 'Add Entry'}</Text>
      <TextInput
        label="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={theme.input}
      />
      <TextInput
        label="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={theme.input}
      />
      <View style={theme.switchContainer}>
        <Text>Cardio</Text>
        <Switch value={cardio} onValueChange={setCardio} />
      </View>
      <Button mode="contained" onPress={saveEntry} style={theme.button} labelStyle={theme.buttonText}>
        Save
      </Button>
    </View>
  );
}