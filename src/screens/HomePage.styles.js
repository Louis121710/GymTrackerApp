import { StyleSheet } from 'react-native';
import appStyle from '../../appStyle';

/**
 * Styles for HomePage component
 * Extracted for better code organization and maintainability
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: appStyle.spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  greeting: {
    ...appStyle.typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  username: {
    ...appStyle.typography.h1,
    marginBottom: appStyle.spacing.sm,
  },
  subtitle: {
    ...appStyle.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: appStyle.roundness.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  statPillText: {
    ...appStyle.typography.small,
    color: appStyle.colors.text,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: appStyle.spacing.lg,
    borderRadius: appStyle.roundness.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    marginTop: appStyle.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appStyle.spacing.sm,
  },
  progressLabel: {
    ...appStyle.typography.caption,
    color: appStyle.colors.text,
  },
  progressText: {
    ...appStyle.typography.bodyBold,
    color: appStyle.colors.text,
  },
  progressSubtext: {
    ...appStyle.typography.small,
    color: appStyle.colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.surface,
    margin: appStyle.spacing.lg,
    marginTop: -15,
    padding: appStyle.spacing.lg,
    borderRadius: appStyle.roundness.large,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.medium,
    gap: appStyle.spacing.md,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    ...appStyle.typography.body,
    lineHeight: 22,
    marginBottom: 4,
  },
  quoteAuthor: {
    ...appStyle.typography.small,
    color: appStyle.colors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: appStyle.spacing.xl,
    paddingHorizontal: appStyle.spacing.lg,
  },
  streakSection: {
    marginBottom: appStyle.spacing.xl,
    paddingHorizontal: appStyle.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: appStyle.spacing.md,
  },
  sectionTitle: {
    ...appStyle.typography.h3,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: appStyle.spacing.md,
  },
  mainStreakCard: {
    flex: 2,
    padding: appStyle.spacing.lg,
  },
  streakCard: {
    flex: 1,
    borderRadius: appStyle.roundness.large,
    padding: appStyle.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...appStyle.shadows.small,
  },
  streakValue: {
    ...appStyle.typography.h2,
    marginBottom: 4,
  },
  mainStreakValue: {
    fontSize: 42,
    fontWeight: '700',
    color: appStyle.colors.text,
  },
  streakLabel: {
    ...appStyle.typography.small,
    color: appStyle.colors.textSecondary,
  },
  mainStreakLabel: {
    ...appStyle.typography.caption,
    color: appStyle.colors.text,
    fontWeight: '600',
  },
  streakMessage: {
    ...appStyle.typography.small,
    color: appStyle.colors.text,
    marginTop: appStyle.spacing.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  secondaryStreaks: {
    flex: 1,
    gap: appStyle.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActions: {
    gap: 10,
  },
  recentList: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: appStyle.roundness.large,
    padding: appStyle.spacing.md,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: appStyle.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: appStyle.colors.divider,
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: appStyle.spacing.sm,
  },
  recentDate: {
    ...appStyle.typography.bodyBold,
    marginBottom: 2,
  },
  recentDetails: {
    ...appStyle.typography.small,
    color: appStyle.colors.textSecondary,
  },
});

export default styles;
