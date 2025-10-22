// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { loadEntries, saveEntries } from '../utils/storage';
import EntryListItem from '../components/EntryListItem';
import { theme } from '../../theme';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await loadEntries();
      setEntries(data);
    };
    load();
  }, []);

  const deleteEntry = async (index) => {
    Alert.alert('Confirm Delete', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const newEntries = entries.filter((_, i) => i !== index);
          setEntries(newEntries);
          await saveEntries(newEntries);
        },
      },
    ]);
  };

  const editEntry = (index) => {
    navigation.navigate('AddEntry', { entry: entries[index], index });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('AddEntry')}
        >
          Add Entry
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('Graph')}
        >
          View Graph
        </Button>
      </View>
      <Text style={styles.title}>Gym Entries</Text>
      {entries.length === 0 ? (
        <Text style={styles.emptyText}>No entries yet</Text>
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item, index }) => (
            <EntryListItem item={item} onEdit={() => editEntry(index)} onDelete={() => deleteEntry(index)} />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    elevation: 4,
  },
  buttonLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
});