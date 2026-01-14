/**
 * Modal component for selecting workout types
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { WORKOUT_TYPES } from '../../constants/exercises';

const WorkoutTypeModal = ({ visible, selectedTypes, onSelectTypes, onClose, isEditing = false, onEditSelect }) => {
  const handleToggleType = (item) => {
    let updatedTypes;
    const isSelected = selectedTypes.includes(item);
    if (isSelected) {
      updatedTypes = selectedTypes.filter(type => type !== item);
    } else {
      updatedTypes = [...selectedTypes, item];
    }
    onSelectTypes(updatedTypes);
    if (isEditing && onEditSelect) {
      onEditSelect(updatedTypes);
    }
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
                <Text style={styles.modalTitle}>Select Workout Type</Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={WORKOUT_TYPES}
                keyExtractor={(item) => item}
                numColumns={2}
                renderItem={({ item }) => {
                  const isSelected = selectedTypes.includes(item);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.workoutTypeOption,
                        isSelected && styles.workoutTypeOptionSelected
                      ]}
                      onPress={() => handleToggleType(item)}
                    >
                      <Text style={[
                        styles.workoutTypeOptionText,
                        isSelected && styles.workoutTypeOptionTextSelected
                      ]}>
                        {item}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={20} color={appStyle.colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={onClose}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
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
  workoutTypeOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#363636',
    margin: 5,
    minWidth: '45%',
  },
  workoutTypeOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  workoutTypeOptionText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  workoutTypeOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  modalDoneButton: {
    flex: 1,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default WorkoutTypeModal;
