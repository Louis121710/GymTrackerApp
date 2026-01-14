/**
 * Modal component for rest timer controls
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appStyle from '../../../appStyle';
import { formatTime } from '../../utils/formatters';

const REST_TIMER_PRESETS = [30, 60, 90, 120, 180];

const RestTimerModal = ({
  visible,
  restTimer,
  restTimerActive,
  defaultRestTime,
  onStart,
  onStop,
  onClose,
  onPresetSelect
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.restTimerModalOverlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.restTimerModalContent}>
            <View style={styles.restTimerModalHeader}>
              <Text style={styles.restTimerModalTitle}>Rest Timer</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.restTimerDisplay}>
              <Text style={styles.restTimerDisplayText}>{formatTime(restTimer)}</Text>
              <Text style={styles.restTimerDisplayLabel}>
                {restTimerActive ? 'Resting...' : 'Ready'}
              </Text>
            </View>

            <View style={styles.restTimerPresets}>
              <Text style={styles.restTimerPresetsLabel}>Quick Start:</Text>
              <View style={styles.restTimerPresetsGrid}>
                {(Array.isArray(REST_TIMER_PRESETS) ? REST_TIMER_PRESETS : []).map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={styles.restTimerPresetButton}
                    onPress={() => {
                      onPresetSelect(seconds);
                      onClose();
                    }}
                  >
                    <Text style={styles.restTimerPresetText}>{formatTime(seconds)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.restTimerControls}>
              {restTimerActive ? (
                <TouchableOpacity
                  style={styles.restTimerStopButton}
                  onPress={() => {
                    onStop();
                    onClose();
                  }}
                >
                  <MaterialCommunityIcons name="stop" size={20} color="#FFFFFF" />
                  <Text style={styles.restTimerStopButtonText}>Stop</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.restTimerStartButton}
                  onPress={() => {
                    onStart();
                    onClose();
                  }}
                >
                  <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.restTimerStartButtonText}>Start {formatTime(defaultRestTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  restTimerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimerModalContent: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  restTimerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  restTimerModalTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  restTimerDisplayText: {
    color: appStyle.colors.primary,
    fontSize: 48,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 10,
  },
  restTimerDisplayLabel: {
    color: '#888',
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  restTimerPresets: {
    width: '100%',
    marginBottom: 20,
  },
  restTimerPresetsLabel: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
  restTimerPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  restTimerPresetButton: {
    backgroundColor: '#363636',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  restTimerPresetText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerControls: {
    width: '100%',
  },
  restTimerStartButton: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restTimerStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  restTimerStopButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restTimerStopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default RestTimerModal;
