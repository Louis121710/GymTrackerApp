/**
 * Modal component for editing a workout
 * Handles day selection, workout types, exercises with sets, notes, and logging
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { calculateTotalVolume } from '../../utils/workoutCalculations';

const EditWorkoutModal = ({
  visible,
  editingWorkoutDay,
  editingWorkoutTypes,
  editingWorkoutExercises,
  editingWorkoutNotes,
  setEditingWorkoutNotes,
  onClose,
  onDayPress,
  onWorkoutTypePress,
  onDecrementWeight,
  onIncrementWeight,
  onUpdateSet,
  onRemoveSet,
  onAddSet,
  onSave
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={false}
    onRequestClose={onClose}
  >
    <View style={styles.editModalContainer}>
      <View style={styles.editModalHeader}>
        <Text style={styles.editModalTitle}>Edit Workout</Text>
        <TouchableOpacity onPress={onClose} style={styles.editModalCloseButton}>
          <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.editModalContent} 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      >
        {/* Day and Workout Types */}
        <View style={styles.editSection}>
          <TouchableOpacity style={styles.inputCard} onPress={onDayPress}>
            <MaterialCommunityIcons name="calendar" size={24} color={appStyle.colors.accent} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Day</Text>
              <Text style={styles.inputValue}>{editingWorkoutDay}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputCard} onPress={onWorkoutTypePress}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={appStyle.colors.accent} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Workout Types</Text>
              {editingWorkoutTypes.length > 0 ? (
                <View style={styles.selectedTypesContainer}>
                  {(Array.isArray(editingWorkoutTypes) ? editingWorkoutTypes : []).map((type, index) => (
                    <View key={index} style={styles.selectedTypeChip}>
                      <Text style={styles.selectedTypeChipText}>{type}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.inputValue}>Tap to select</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Exercises with Sets */}
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Exercises & Sets</Text>
          {(Array.isArray(editingWorkoutExercises) ? editingWorkoutExercises : []).map((exercise, exerciseIndex) => (
            <TouchableOpacity 
              key={exerciseIndex} 
              style={styles.editExerciseCard}
              activeOpacity={1}
            >
              <Text style={styles.editExerciseName}>{exercise.name}</Text>
              
              {/* Sets List */}
              <View style={styles.setsListContainer}>
                {(Array.isArray(exercise.sets) ? exercise.sets : []).map((set, setIndex) => (
                  <View key={setIndex} style={styles.editSetRow}>
                    <View style={styles.setNumberSmall}>
                      <Text style={styles.setNumberSmallText}>{setIndex + 1}</Text>
                    </View>
                    <View style={styles.editSetInputs}>
                      <View style={styles.editSetInputGroup}>
                        <Text style={styles.editSetLabel}>Weight (kg)</Text>
                        <View style={styles.editSetInputWithButtons}>
                          <TouchableOpacity
                            style={styles.weightButtonSmall}
                            onPress={() => {
                              Keyboard.dismiss();
                              onDecrementWeight(exerciseIndex, setIndex, 2.5);
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="minus" size={16} color={appStyle.colors.text} />
                          </TouchableOpacity>
                          <TextInput
                            style={styles.editSetTextInput}
                            placeholder="0"
                            placeholderTextColor="#888"
                            value={set.weight ? set.weight.toString() : ''}
                            onChangeText={(text) => onUpdateSet(exerciseIndex, setIndex, 'weight', text)}
                            keyboardType="decimal-pad"
                            color={appStyle.colors.text}
                            returnKeyType="done"
                            blurOnSubmit={false}
                          />
                          <TouchableOpacity
                            style={styles.weightButtonSmall}
                            onPress={() => {
                              Keyboard.dismiss();
                              onIncrementWeight(exerciseIndex, setIndex, 2.5);
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="plus" size={16} color={appStyle.colors.text} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.editSetInputGroup}>
                        <Text style={styles.editSetLabel}>Reps</Text>
                        <TextInput
                          style={styles.editSetTextInputSingle}
                          placeholder="0"
                          placeholderTextColor="#888"
                          value={set.reps ? set.reps.toString() : ''}
                          onChangeText={(text) => onUpdateSet(exerciseIndex, setIndex, 'reps', text)}
                          keyboardType="number-pad"
                          color={appStyle.colors.text}
                        />
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeSetButton}
                      onPress={() => onRemoveSet(exerciseIndex, setIndex)}
                    >
                      <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add Set Button */}
              <TouchableOpacity
                style={styles.addSetToExerciseButton}
                onPress={() => onAddSet(exerciseIndex)}
              >
                <MaterialCommunityIcons name="plus-circle" size={18} color={appStyle.colors.primary} />
                <Text style={styles.addSetToExerciseText}>Add Set</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            placeholder="Add workout notes..."
            placeholderTextColor="#888"
            value={editingWorkoutNotes}
            onChangeText={setEditingWorkoutNotes}
            multiline
            color={appStyle.colors.text}
          />
        </View>

        {/* Summary */}
        <View style={styles.editWorkoutSummary}>
          <View style={styles.editWorkoutSummaryItem}>
            <Text style={styles.editWorkoutSummaryLabel}>Total Volume</Text>
            <Text style={styles.editWorkoutSummaryValue}>
              {calculateTotalVolume(editingWorkoutExercises).toFixed(0)}kg
            </Text>
          </View>
          <View style={styles.editWorkoutSummaryItem}>
            <Text style={styles.editWorkoutSummaryLabel}>Exercises</Text>
            <Text style={styles.editWorkoutSummaryValue}>{editingWorkoutExercises.length}</Text>
          </View>
        </View>

        {/* Save/Log Button */}
        <TouchableOpacity style={styles.saveEditedWorkoutButton} onPress={onSave}>
          <Text style={styles.saveEditedWorkoutButtonText}>Log Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  editModalContainer: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  editModalTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editModalCloseButton: {
    padding: 5,
  },
  editModalContent: {
    flex: 1,
    padding: 20,
  },
  editSection: {
    marginBottom: 25,
  },
  inputCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
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
  selectedTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  selectedTypeChip: {
    backgroundColor: appStyle.colors.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  selectedTypeChipText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editExerciseCard: {
    backgroundColor: appStyle.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#363636',
  },
  editExerciseName: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 12,
  },
  setsListContainer: {
    marginBottom: 10,
  },
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  setNumberSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appStyle.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberSmallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  editSetInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  editSetInputGroup: {
    flex: 1,
  },
  editSetLabel: {
    color: '#888',
    fontSize: 11,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 5,
  },
  editSetInputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  editSetTextInput: {
    flex: 1,
    padding: 8,
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  weightButtonSmall: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSetTextInputSingle: {
    padding: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  removeSetButton: {
    padding: 6,
  },
  addSetToExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary + '20',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 5,
  },
  addSetToExerciseText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  textInput: {
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    paddingVertical: 5,
    includeFontPadding: false,
  },
  notesInput: {
    minHeight: 80,
    maxHeight: 120,
    marginTop: 5,
    backgroundColor: '#363636',
    borderRadius: 8,
    padding: 12,
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  editWorkoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: appStyle.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  editWorkoutSummaryItem: {
    alignItems: 'center',
  },
  editWorkoutSummaryLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  editWorkoutSummaryValue: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveEditedWorkoutButton: {
    backgroundColor: appStyle.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveEditedWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default EditWorkoutModal;
