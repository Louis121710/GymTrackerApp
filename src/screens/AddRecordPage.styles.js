import { StyleSheet } from 'react-native';
import appStyle from '../../appStyle';

/**
 * Styles for AddRecordPage component
 * Extracted for better code organization and maintainability
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...appStyle.shadows.large,
  },
  title: {
    color: '#FFFFFF', // White
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  subtitle: {
    color: '#FFFFFF', // White
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
    backgroundColor: '#FF6B35', // Orange color
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
    backgroundColor: appStyle.colors.surfaceElevated,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
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
    borderWidth: 2,
    borderColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  cancelButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 16,
    marginLeft: 10,
    overflow: 'hidden',
    minHeight: 56,
    shadowColor: '#FF3333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '700',
  },
  dismissArea: {
    height: 100,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    minHeight: 52,
  },
  tabButtonActive: {
    backgroundColor: appStyle.colors.accent,
  },
  tabText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: appStyle.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: appStyle.colors.cardBorder,
  },
  modalTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: appStyle.colors.cardBorder,
  },
});

export default styles;
