import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { loadEntries, saveEntries } from '../utils/storage';
import { theme } from '../../theme';
import EntryListItem from '../components/EntryListItem';

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const data = await loadEntries();
      setEntries(data || []);
    };
    load();
  }, []);

  const addEntry = () => {
    navigation.navigate('AddEntry');
  };

  const viewGraph = () => {
    navigation.navigate('Graph');
  };

  const editEntry = (index) => {
    navigation.navigate('AddEntry', { index, entry: entries[index] });
  };

  const deleteEntry = (index) => {
    Alert.alert('Confirm Delete', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const newEntries = entries.filter((_, i) => i !== index);
          setEntries(newEntries);
          await saveEntries(newEntries);
        },
      },
    ]);
  };

  return (
    <View style={theme.container}>
      <Text style={theme.title}>Gym Stats & Weight Tracker</Text>
      <View style={theme.buttonContainer}>
        <Button mode="contained" onPress={addEntry} style={theme.button} labelStyle={theme.buttonText}>
          Add Entry
        </Button>
        <Button mode="contained" onPress={viewGraph} style={theme.button} labelStyle={theme.buttonText}>
          View Graph
        </Button>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <EntryListItem
            entry={item}
            onEdit={() => editEntry(index)}
            onDelete={() => deleteEntry(index)}
          />
        )}
        ListEmptyComponent={<Text style={theme.emptyText}>No entries yet</Text>}
      />
    </View>
  );
}