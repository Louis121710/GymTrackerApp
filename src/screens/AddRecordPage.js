import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  Modal
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { loadEntries, saveEntries, getCurrentUser, deleteEntry as deleteEntryStorage, updateEntry } from '../utils/storage';
import { useUserProfile } from '../context/UserProfileContext';
import { useEntries } from '../hooks/useEntries';
import EntryCard from '../components/features/EntryCard';
import EmptyState from '../components/ui/EmptyState';
import styles from './AddRecordPage.styles';

// Screen for adding new workout records and viewing existing entries
const AddRecordPage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { goalWeight } = useUserProfile();
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'
  
  // Add record state
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [bodyWeight, setBodyWeight] = useState('');
  const [didCardio, setDidCardio] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // View records state
  const { entries, setEntries, refreshing, onRefresh } = useEntries();
  const [editingEntry, setEditingEntry] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editBodyWeight, setEditBodyWeight] = useState('');
  const [editDidCardio, setEditDidCardio] = useState(false);
  const [editWorkoutNotes, setEditWorkoutNotes] = useState('');

  const weightInputRef = useRef(null);
  const notesInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'view') {
      // Entries are loaded by useEntries hook
    }
  }, [activeTab, isFocused]);

  const handleSave = async () => {
    if (!bodyWeight) {
      Alert.alert('Error', 'Please enter your body weight');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      date: date,
      body_weight: parseFloat(bodyWeight),
      did_cardio: didCardio,
      notes: workoutNotes,
      goalWeight: goalWeight,
      timestamp: new Date().getTime()
    };

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save entries');
        return;
      }
      const existingEntries = await loadEntries(username);
      const updatedEntries = [...existingEntries, newEntry];
      await saveEntries(updatedEntries, username);

      // Reset form
      setBodyWeight('');
      setDidCardio(false);
      setWorkoutNotes('');
      
      Alert.alert('Success', 'Workout record saved!', [
        { text: 'OK', onPress: () => setActiveTab('view') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save record');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEditDate(entry.date);
    setEditBodyWeight(entry.body_weight.toString());
    setEditDidCardio(entry.did_cardio || false);
    setEditWorkoutNotes(entry.notes || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editBodyWeight) {
      Alert.alert('Error', 'Please enter your body weight');
      return;
    }

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to edit entries');
        return;
      }

      await updateEntry(editingEntry.id, {
        date: editDate,
        body_weight: parseFloat(editBodyWeight),
        did_cardio: editDidCardio,
        notes: editWorkoutNotes,
        timestamp: editingEntry.timestamp
      }, username);

      setEditModalVisible(false);
      setEditingEntry(null);
      await onRefresh();
      Alert.alert('Success', 'Record updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update record');
    }
  };

  const handleDelete = async (id) => {
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderAddForm = () => (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.form}>
          {/* Date Display */}
          <TouchableOpacity
            style={styles.inputCard}
            onPress={dismissKeyboard}
            activeOpacity={1}
          >
            <MaterialCommunityIcons name="calendar" size={24} color={appStyle.colors.accent} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Date</Text>
              <Text style={styles.inputValue}>{date}</Text>
              <Text style={styles.dateHint}>(Today's date)</Text>
            </View>
          </TouchableOpacity>

          {/* Body Weight Input */}
          <TouchableOpacity
            style={styles.inputCard}
            onPress={() => weightInputRef.current?.focus()}
            activeOpacity={1}
          >
            <MaterialCommunityIcons name="scale" size={24} color={appStyle.colors.accent} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Body Weight (kg)</Text>
              <View style={styles.weightInput}>
                <TextInput
                  ref={weightInputRef}
                  style={styles.textInput}
                  placeholder="Enter current weight"
                  placeholderTextColor="#888"
                  value={bodyWeight}
                  onChangeText={setBodyWeight}
                  keyboardType="decimal-pad"
                  color={appStyle.colors.text}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => notesInputRef.current?.focus()}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Goal Weight Display */}
          <TouchableOpacity
            style={styles.inputCard}
            onPress={dismissKeyboard}
            activeOpacity={1}
          >
            <MaterialCommunityIcons name="flag" size={24} color="#FF9800" />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Goal Weight</Text>
              <View style={styles.weightInput}>
                <Text style={styles.goalWeightText}>{goalWeight} kg</Text>
                <TouchableOpacity
                  style={styles.editGoalButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Text style={styles.editGoalText}>Edit in Profile</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>
                You're {bodyWeight ? (parseFloat(bodyWeight) - goalWeight).toFixed(1) : '0'}kg from your goal
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cardio Toggle */}
          <TouchableOpacity
            style={styles.inputCard}
            onPress={() => {
              dismissKeyboard();
              setDidCardio(!didCardio);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={didCardio ? "run" : "run-fast"}
              size={24}
              color={appStyle.colors.accent}
            />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Cardio Session</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>{didCardio ? 'Yes' : 'No'}</Text>
                <View style={[styles.toggle, didCardio && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, didCardio && styles.toggleKnobActive]} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Workout Notes */}
          <TouchableOpacity
            style={styles.inputCard}
            onPress={() => notesInputRef.current?.focus()}
            activeOpacity={1}
          >
            <MaterialCommunityIcons name="text" size={24} color={appStyle.colors.accent} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Workout Notes</Text>
              <TextInput
                ref={notesInputRef}
                style={[styles.textInput, styles.notesInput]}
                placeholder="Add any notes about your workout... (optional)"
                placeholderTextColor="#888"
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                multiline
                numberOfLines={4}
                color={appStyle.colors.text}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={dismissKeyboard}
                textAlignVertical="top"
              />
            </View>
          </TouchableOpacity>

          {/* Progress Preview */}
          {bodyWeight && (
            <TouchableOpacity
              style={styles.progressCard}
              onPress={dismissKeyboard}
              activeOpacity={1}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color="#4CAF50" />
              <View style={styles.progressContent}>
                <Text style={styles.progressTitle}>Progress Preview</Text>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressLabel}>Current</Text>
                    <Text style={styles.progressValue}>{bodyWeight} kg</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressLabel}>Goal</Text>
                    <Text style={styles.progressValue}>{goalWeight} kg</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressLabel}>Difference</Text>
                    <Text style={[
                      styles.progressValue,
                      { color: (parseFloat(bodyWeight) - goalWeight) > 0 ? '#EF5350' : '#4CAF50' }
                    ]}>
                      {bodyWeight ? (parseFloat(bodyWeight) - goalWeight).toFixed(1) : '0'} kg
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                dismissKeyboard();
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !bodyWeight && styles.saveButtonDisabled
              ]}
              onPress={() => {
                dismissKeyboard();
                handleSave();
              }}
              activeOpacity={0.8}
              disabled={!bodyWeight}
            >
              <LinearGradient
                colors={!bodyWeight ? ['#404040', '#404040'] : ['#FF3333', '#FF6B35', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {bodyWeight ? 'Save Record' : 'Enter Weight'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hidden touch area to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>
      </ScrollView>
    </TouchableWithoutFeedback>
  );


  const renderViewRecords = () => (
    <View style={styles.container}>
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {(!entries || entries.length === 0) ? (
          <EmptyState />
        ) : (
            (Array.isArray(entries) ? entries : []).map((item, index) => (
            <EntryCard key={item.id || `entry-${index}`} item={item} />
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#0F172A']}
        style={styles.header}
      >
        <Text style={styles.title}>
          {activeTab === 'add' ? 'Add Workout Record' : 'Workout History'}
        </Text>
        <Text style={styles.subtitle}>
          {activeTab === 'add' 
            ? 'Track your fitness journey'
            : `${entries.length} record${entries.length !== 1 ? 's' : ''} total`
          }
        </Text>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'add' && styles.tabButtonActive]}
          onPress={() => setActiveTab('add')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="plus" 
            size={24} 
            color={activeTab === 'add' ? '#FFFFFF' : appStyle.colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
                Add Record
              </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'view' && styles.tabButtonActive]}
          onPress={() => setActiveTab('view')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="format-list-bulleted" 
            size={24} 
            color={activeTab === 'view' ? '#FFFFFF' : appStyle.colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'view' && styles.tabTextActive]}>
                View Records
              </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'add' ? renderAddForm() : renderViewRecords()}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Record</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputCard}>
                <MaterialCommunityIcons name="calendar" size={24} color={appStyle.colors.accent} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDate}
                    onChangeText={setEditDate}
                    placeholder="Date"
                    placeholderTextColor="#888"
                    color={appStyle.colors.text}
                  />
                </View>
              </View>

              <View style={styles.inputCard}>
                <MaterialCommunityIcons name="scale" size={24} color={appStyle.colors.accent} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Body Weight (kg)</Text>
                  <View style={styles.weightInput}>
                    <TextInput
                      style={styles.textInput}
                      value={editBodyWeight}
                      onChangeText={setEditBodyWeight}
                      placeholder="Enter weight"
                      placeholderTextColor="#888"
                      keyboardType="decimal-pad"
                      color={appStyle.colors.text}
                    />
                    <Text style={styles.unit}>kg</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.inputCard}
                onPress={() => setEditDidCardio(!editDidCardio)}
              >
                <MaterialCommunityIcons
                  name={editDidCardio ? "run" : "run-fast"}
                  size={24}
                  color={appStyle.colors.accent}
                />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Cardio Session</Text>
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>{editDidCardio ? 'Yes' : 'No'}</Text>
                    <View style={[styles.toggle, editDidCardio && styles.toggleActive]}>
                      <View style={[styles.toggleKnob, editDidCardio && styles.toggleKnobActive]} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.inputCard}>
                <MaterialCommunityIcons name="text" size={24} color={appStyle.colors.accent} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Workout Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.notesInput]}
                    value={editWorkoutNotes}
                    onChangeText={setEditWorkoutNotes}
                    placeholder="Add notes..."
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={4}
                    color={appStyle.colors.text}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF3333', '#FF6B35', '#FF8C42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddRecordPage;