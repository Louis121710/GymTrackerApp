import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../appStyle';
import { loadEntries, saveEntries, getCurrentUser } from '../utils/storage';
import { useUserProfile } from '../context/UserProfileContext';

const AddRecordPage = () => {
  const navigation = useNavigation();
  const { goalWeight } = useUserProfile();
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [bodyWeight, setBodyWeight] = useState('');
  const [didCardio, setDidCardio] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');

  const weightInputRef = useRef(null);
  const notesInputRef = useRef(null);

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

      Alert.alert('Success', 'Workout record saved!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save record');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Workout Record</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>

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
              activeOpacity={0.7}
              disabled={!bodyWeight}
            >
              <Text style={styles.saveButtonText}>
                {bodyWeight ? 'Save Record' : 'Enter Weight'}
              </Text>
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
  form: {
    padding: 20,
    paddingBottom: 0,
  },
  inputCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputContent: {
    flex: 1,
    marginLeft: 15,
  },
  inputLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  inputValue: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  dateHint: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 2,
  },
  weightInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    paddingVertical: 5,
    includeFontPadding: false,
  },
  unit: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginLeft: 10,
  },
  goalWeightText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editGoalButton: {
    backgroundColor: appStyle.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editGoalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  goalHint: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 5,
    fontStyle: 'italic',
  },
  notesInput: {
    minHeight: 80,
    maxHeight: 120,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#363636',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: appStyle.colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#888',
  },
  toggleKnobActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 22 }],
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#1E3A28',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressContent: {
    flex: 1,
    marginLeft: 15,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 2,
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveButton: {
    flex: 2,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  saveButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  dismissArea: {
    height: 100,
  },
});

export default AddRecordPage;