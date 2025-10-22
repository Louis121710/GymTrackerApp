// AddEntryScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import { loadEntries, saveEntries } from '../utils/storage';
import { theme } from '../../theme';

export default function AddEntryScreen({ route, navigation }) {
  const { entry, index } = route.params || {};
  const [date, setDate] = useState(entry ? entry.date : new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(entry ? entry.body_weight.toString() : '');
  const [cardio, setCardio] = useState(!!entry?.did_cardio);

  const handleSave = async () => {
    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      Alert.alert('Invalid Input', 'Weight must be a positive number');
      return;
    }

    const newEntry = { date, body_weight: parseFloat(weight), did_cardio: cardio ? 1 : 0 };
    const entries = await loadEntries();
    if (index !== undefined) {
      entries[index] = newEntry; // Edit
    } else {
      entries.push(newEntry); // Add
    }
    await saveEntries(entries);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
        theme={{ colors: { text: theme.colors.text, primary: theme.colors.accent } }}
      />
      <TextInput
        label="Body Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { text: theme.colors.text, primary: theme.colors.accent } }}
      />
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Did Cardio?</Text>
        <Switch
          value={cardio}
          onValueChange={setCardio}
          color={theme.colors.accent}
        />
      </View>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonLabel}
        onPress={handleSave}
      >
        Save Entry
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  input: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  switchLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    marginRight: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  buttonLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.text,
  },
});