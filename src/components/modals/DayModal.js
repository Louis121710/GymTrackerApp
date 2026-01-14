/**
 * Modal component for selecting workout day
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { DAYS_OF_WEEK } from '../../constants/exercises';

const DayModal = ({ visible, selectedDay, onSelectDay, onClose, isEditing = false, onEditSelect }) => (
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
              <Text style={styles.modalTitle}>Select Day</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DAYS_OF_WEEK}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dayOption,
                    selectedDay === item && styles.dayOptionSelected
                  ]}
                  onPress={() => {
                    onSelectDay(item);
                    if (isEditing && onEditSelect) {
                      onEditSelect(item);
                    }
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.dayOptionText,
                    selectedDay === item && styles.dayOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {selectedDay === item && (
                    <MaterialCommunityIcons name="check" size={20} color={appStyle.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

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
  dayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#363636',
  },
  dayOptionSelected: {
    backgroundColor: appStyle.colors.primary + '30',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
  },
  dayOptionText: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  dayOptionTextSelected: {
    color: appStyle.colors.primary,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default DayModal;
