import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../appStyle';
import { loadEntries, saveEntries } from '../utils/storage';

const RecordListPage = () => {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEntriesData();
  }, []);

  const loadEntriesData = async () => {
    const loadedEntries = await loadEntries();
    const sortedEntries = loadedEntries.sort((a, b) => b.timestamp - a.timestamp);
    setEntries(sortedEntries);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntriesData();
    setRefreshing(false);
  };

  const deleteEntry = async (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entries.filter(entry => entry.id !== id);
            await saveEntries(updatedEntries);
            setEntries(updatedEntries);
          }
        }
      ]
    );
  };

  const EntryCard = ({ item }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={16} color={appStyle.colors.accent} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.typeIndicator}>
          <MaterialCommunityIcons
            name={item.did_cardio ? "run" : "dumbbell"}
            size={16}
            color={appStyle.colors.primary}
          />
          <Text style={styles.typeText}>
            {item.did_cardio ? 'Cardio' : 'Strength'}
          </Text>
        </View>
      </View>

      <View style={styles.entryBody}>
        <View style={styles.weightSection}>
          <Text style={styles.weightLabel}>Weight</Text>
          <Text style={styles.weightValue}>{item.body_weight} kg</Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert('Edit', `Edit entry from ${item.date}`)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#4CAF50" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteEntry(item.id)}
          >
            <MaterialCommunityIcons name="delete" size={16} color="#F44336" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#888" />
      <Text style={styles.emptyTitle}>No Records Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your workouts to see them here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <Text style={styles.subtitle}>
          {entries.length} record{entries.length !== 1 ? 's' : ''} total
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          entries.map((item, index) => (
            <EntryCard key={item.id || `entry-${index}`} item={item} />
          ))
        )}
      </ScrollView>
    </View>
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
  listContainer: {
    flex: 1,
    padding: 20,
  },
  entryCard: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginLeft: 5,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginLeft: 4,
  },
  entryBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightSection: {
    flex: 1,
  },
  weightLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 2,
  },
  weightValue: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C62828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginLeft: 4,
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#363636',
  },
  notesLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 2,
  },
  notesText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecordListPage;