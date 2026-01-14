import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { loadEntries, getCurrentUser, deleteEntry as deleteEntryStorage } from '../utils/storage';
import { useEntries } from '../hooks/useEntries';
import EntryCard from '../components/features/EntryCard';
import EmptyState from '../components/ui/EmptyState';

// Screen displaying a list of all workout records
const RecordListPage = () => {
  const { entries, refreshing, onRefresh } = useEntries();

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
            await deleteEntryStorage(id);
            await onRefresh();
          }
        }
      ]
    );
  };


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
        {(!entries || entries.length === 0) ? (
          <EmptyState 
            icon="clipboard-text-outline"
            title="No Records Yet"
            subtitle="Start tracking your workouts to see them here"
          />
        ) : (
          (Array.isArray(entries) ? entries : []).map((item, index) => (
            <EntryCard 
              key={item.id || `entry-${index}`} 
              item={item}
              onDelete={deleteEntry}
            />
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
});

export default RecordListPage;