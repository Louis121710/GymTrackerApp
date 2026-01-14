import { StyleSheet } from 'react-native';
import appStyle from '../../../appStyle';

const styles = StyleSheet.create({
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: appStyle.colors.surface, // #1E293B (Slate-800)
    borderRadius: 16, // Exact 16px as specified
    padding: appStyle.spacing.lg, // 24px premium spacing
    marginHorizontal: appStyle.spacing.lg, // 24px
    marginBottom: appStyle.spacing.lg,
    marginTop: -15, // Overlap with header for seamless design
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder, // #334155 (Slate-700)
    gap: appStyle.spacing.md, // 16px
    ...appStyle.shadows.medium, // Premium shadow
    alignItems: 'flex-start', // Align icon to top
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    ...appStyle.typography.body, // White text
    color: appStyle.colors.text, // #FFFFFF
    fontStyle: 'italic',
    marginBottom: appStyle.spacing.sm, // 8px
    lineHeight: 22, // Premium line height
  },
  quoteAuthor: {
    ...appStyle.typography.small, // Slate-400
    color: appStyle.colors.textSecondary, // #94A3B8
    fontWeight: '500', // Slightly bolder for premium look
  },
});

export default styles;
