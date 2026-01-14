import { StyleSheet, Dimensions } from 'react-native';
import appStyle from '../../appStyle';

const { width } = Dimensions.get('window');

/**
 * Styles for SetupPage component
 * Onboarding form styles matching the app's design system
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: Math.min(width * 0.75, 320),
    height: Math.min(width * 0.75 * 0.75, 240),
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: appStyle.roundness.large,
    padding: 32,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.large,
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleAccent: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  setupTitle: {
    ...appStyle.typography.h1,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  setupSubtitle: {
    ...appStyle.typography.body,
    textAlign: 'center',
    color: appStyle.colors.textSecondary,
  },
  inputsContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: appStyle.roundness.medium,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    overflow: 'hidden',
    minHeight: 56,
  },
  inputIcon: {
    paddingLeft: 18,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: appStyle.colors.text,
    padding: 18,
    paddingLeft: 0,
    ...appStyle.typography.body,
  },
  goalSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  goalLabel: {
    ...appStyle.typography.body,
    color: appStyle.colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  goalButtonsContainer: {
    gap: 12,
  },
  goalButton: {
    borderRadius: appStyle.roundness.medium,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    overflow: 'hidden',
    minHeight: 56,
  },
  goalButtonActive: {
    borderColor: appStyle.colors.accent,
    ...appStyle.shadows.accent,
  },
  goalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  goalButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  goalButtonText: {
    ...appStyle.typography.body,
    color: appStyle.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  goalButtonTextActive: {
    ...appStyle.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completeButton: {
    borderRadius: appStyle.roundness.full,
    overflow: 'hidden',
    marginBottom: 16,
    ...appStyle.shadows.accent,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 56,
  },
  completeButtonText: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  requiredNote: {
    ...appStyle.typography.caption,
    textAlign: 'center',
    color: appStyle.colors.textSecondary,
    marginTop: 8,
  },
});

export default styles;
