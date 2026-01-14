/**
 * Modal component for selecting/adding exercises
 * Handles exercise search, muscle group filtering, and custom exercise creation
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { EXERCISE_LIBRARY } from '../../constants/exercises';

const ExerciseModal = ({
  visible,
  editingExerciseIndex,
  newExercise,
  exerciseSearchQuery,
  selectedMuscleGroup,
  showSaveExercisePrompt,
  customExercises,
  onClose,
  onSearchChange,
  onMuscleGroupSelect,
  onExerciseSelect,
  onAddExercise,
  onSaveCustomExercise,
  onSkipSave
}) => {
  const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY).flat();
  
  const getAllExercises = () => {
    const custom = Array.isArray(customExercises) ? customExercises : [];
    return [...COMMON_EXERCISES, ...custom];
  };

  const getFilteredExercises = () => {
    const allExercises = selectedMuscleGroup 
      ? getExercisesByMuscleGroup(selectedMuscleGroup)
      : getAllExercises();
    
    if (!exerciseSearchQuery.trim()) {
      return allExercises;
    }
    
    const query = exerciseSearchQuery.toLowerCase().trim();
    return allExercises.filter(exercise => 
      exercise.toLowerCase().includes(query)
    );
  };

  const getExercisesByMuscleGroup = (group) => {
    if (!group || !EXERCISE_LIBRARY[group]) return [];
    return EXERCISE_LIBRARY[group];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Exercise Name - Search and Select */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Search or Type Exercise Name</Text>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor="#888"
                    value={exerciseSearchQuery}
                    onChangeText={onSearchChange}
                    color={appStyle.colors.text}
                  />
                  {exerciseSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => onSearchChange('')}
                      style={styles.searchClearButton}
                    >
                      <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Manual Input for Custom Exercise */}
                {exerciseSearchQuery.length > 0 && !getAllExercises().some(ex => ex.toLowerCase() === exerciseSearchQuery.toLowerCase()) && (
                  <View style={styles.customExercisePrompt}>
                    <Text style={styles.customExercisePromptText}>
                      "{exerciseSearchQuery}" not found. Create it?
                    </Text>
                    <TouchableOpacity
                      style={styles.customExerciseCreateButton}
                      onPress={() => {
                        onExerciseSelect(exerciseSearchQuery);
                        onSearchChange('');
                      }}
                    >
                      <MaterialCommunityIcons name="plus-circle" size={18} color={appStyle.colors.primary} />
                      <Text style={styles.customExerciseCreateButtonText}>Create & Save</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Muscle Group Tabs */}
                {exerciseSearchQuery.length === 0 && (
                  <>
                    <Text style={styles.modalSubLabel}>Or select from exercises by muscle group:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleGroupTabs}>
                      <TouchableOpacity
                        style={[styles.muscleGroupTab, selectedMuscleGroup === null && styles.muscleGroupTabActive]}
                        onPress={() => onMuscleGroupSelect(null)}
                      >
                        <Text style={[styles.muscleGroupTabText, selectedMuscleGroup === null && styles.muscleGroupTabTextActive]}>
                          All
                        </Text>
                      </TouchableOpacity>
                      {(Array.isArray(Object.keys(EXERCISE_LIBRARY)) ? Object.keys(EXERCISE_LIBRARY) : []).map(group => (
                        <TouchableOpacity
                          key={group}
                          style={[styles.muscleGroupTab, selectedMuscleGroup === group && styles.muscleGroupTabActive]}
                          onPress={() => onMuscleGroupSelect(group)}
                        >
                          <Text style={[styles.muscleGroupTabText, selectedMuscleGroup === group && styles.muscleGroupTabTextActive]}>
                            {group}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Exercises List */}
              <FlatList
                data={getFilteredExercises()}
                keyExtractor={(item, index) => `${item}-${index}`}
                numColumns={2}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.exercisesListContent}
                style={styles.exercisesListFlatList}
                removeClippedSubviews={true}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.exerciseOption,
                      newExercise.name === item && styles.exerciseOptionSelected
                    ]}
                    onPress={() => {
                      onExerciseSelect(item);
                      onSearchChange('');
                    }}
                  >
                    <Text style={[
                      styles.exerciseOptionText,
                      newExercise.name === item && styles.exerciseOptionTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  exerciseSearchQuery.length > 0 ? (
                    <View style={styles.emptySearchResults}>
                      <MaterialCommunityIcons name="magnify" size={48} color="#666" />
                      <Text style={styles.emptySearchText}>No exercises found</Text>
                      <Text style={styles.emptySearchSubtext}>Try a different search or create a new exercise</Text>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  <>
                    {/* Save Exercise Prompt */}
                    {showSaveExercisePrompt && (
                      <View style={styles.saveExercisePrompt}>
                        <Text style={styles.saveExercisePromptText}>
                          Save "{newExercise.name.trim()}" to the global exercise database?
                        </Text>
                        <Text style={styles.saveExercisePromptSubtext}>
                          This exercise will be available for all users
                        </Text>
                        <View style={styles.saveExercisePromptButtons}>
                          <TouchableOpacity
                            style={styles.saveExercisePromptButton}
                            onPress={onSkipSave}
                          >
                            <Text style={styles.saveExercisePromptButtonText}>Skip</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.saveExercisePromptButton, styles.saveExercisePromptButtonPrimary]}
                            onPress={onSaveCustomExercise}
                          >
                            <Text style={[styles.saveExercisePromptButtonText, styles.saveExercisePromptButtonTextPrimary]}>
                              Save Globally
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Modal Actions */}
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={onClose}
                      >
                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalSaveButton}
                        onPress={onAddExercise}
                      >
                        <Text style={styles.modalSaveButtonText}>
                          {editingExerciseIndex !== null ? 'Update' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: appStyle.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  modalSubLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginTop: 10,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363636',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  searchClearButton: {
    padding: 4,
  },
  customExercisePrompt: {
    backgroundColor: '#363636',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  customExercisePromptText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  customExerciseCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.primary + '30',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  customExerciseCreateButtonText: {
    color: appStyle.colors.primary,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  muscleGroupTabs: {
    marginVertical: 15,
    maxHeight: 50,
  },
  muscleGroupTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#363636',
    marginRight: 8,
  },
  muscleGroupTabActive: {
    backgroundColor: appStyle.colors.primary,
  },
  muscleGroupTabText: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  muscleGroupTabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  exercisesListFlatList: {
    maxHeight: 400,
  },
  exercisesListContent: {
    paddingBottom: 20,
  },
  exerciseOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#363636',
    margin: 5,
    alignItems: 'center',
  },
  exerciseOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  exerciseOptionText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  exerciseOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  emptySearchResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySearchSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
  },
  saveExercisePrompt: {
    backgroundColor: '#363636',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveExercisePromptText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  saveExercisePromptSubtext: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  saveExercisePromptButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  saveExercisePromptButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
  },
  saveExercisePromptButtonPrimary: {
    backgroundColor: appStyle.colors.primary,
  },
  saveExercisePromptButtonText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  saveExercisePromptButtonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalSaveButton: {
    flex: 2,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default ExerciseModal;
