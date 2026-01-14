import { StyleSheet } from 'react-native';
import appStyle from '../../../appStyle';

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    gap: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentDate: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 4,
  },
  recentDetails: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
});

export default styles;
