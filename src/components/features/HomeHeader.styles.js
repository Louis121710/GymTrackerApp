import { StyleSheet } from 'react-native';
import appStyle from '../../../appStyle';

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: appStyle.spacing.xl, // 32px
    paddingHorizontal: appStyle.spacing.lg, // 24px
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...appStyle.shadows.large, // Premium shadow effect
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: appStyle.spacing.lg, // 24px
  },
  welcomeSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appStyle.spacing.sm, // 8px
    gap: appStyle.spacing.sm,
  },
  greeting: {
    ...appStyle.typography.caption, // Slate-400
    color: 'rgba(255, 255, 255, 0.9)', // White
  },
  username: {
    ...appStyle.typography.h1, // White heading
    color: '#FFFFFF', // White
    marginBottom: appStyle.spacing.xs, // 4px
  },
  subtitle: {
    ...appStyle.typography.body, // Slate-400
    color: 'rgba(255, 255, 255, 0.8)', // White
  },
  statsOverview: {
    flexDirection: 'row',
    gap: appStyle.spacing.sm, // 8px
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appStyle.spacing.md, // 16px
    paddingVertical: appStyle.spacing.xs + 2, // 6px
    borderRadius: appStyle.roundness.full, // Rounded-full
    gap: appStyle.spacing.xs, // 4px
  },
  statPillText: {
    ...appStyle.typography.small, // Orange text
    color: '#000000', // Black text on orange background
    fontWeight: '700',
  },
  progressSection: {
    marginTop: appStyle.spacing.lg, // 24px
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800) - matches quote card
    borderRadius: 16, // Exact 16px as specified - matches quote card
    padding: appStyle.spacing.lg, // 24px premium spacing - matches quote card
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700) - matches quote card
    ...appStyle.shadows.medium, // Premium shadow - matches quote card
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appStyle.spacing.xs, // 4px
  },
  progressLabel: {
    ...appStyle.typography.caption, // Slate-400
    color: 'rgba(255, 255, 255, 0.8)', // White
  },
  progressText: {
    ...appStyle.typography.bodyBold, // White bold
    color: '#FFFFFF', // White
  },
  progressSubtext: {
    ...appStyle.typography.small, // Slate-400
    color: 'rgba(255, 255, 255, 0.7)', // White
  },
});

export default styles;
