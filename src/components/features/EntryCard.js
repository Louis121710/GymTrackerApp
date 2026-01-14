/**
 * Entry card component for displaying workout records
 * Shows date, type (cardio/strength), weight, and action buttons
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';

const EntryCard = ({ item, onEdit, onDelete }) => (
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

      {(onEdit || onDelete) && (
        <View style={styles.actionsSection}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(item)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF3333', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="delete" size={16} color="#FF3333" />
              <Text style={[styles.actionText, { color: '#FF3333' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>

    {item.notes && (
      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>Notes</Text>
        <Text style={styles.notesText}>{item.notes}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  entryCard: {
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
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
    backgroundColor: appStyle.colors.surfaceElevated,
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
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 40,
    shadowColor: '#FF3333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 40,
    borderWidth: 2,
    borderColor: '#FF3333',
    backgroundColor: 'transparent',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginLeft: 6,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: appStyle.colors.cardBorder,
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
});

export default EntryCard;
