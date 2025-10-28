import { DefaultTheme } from 'react-native-paper';

const appStyle = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C62828',
    background: '#1C1C1C',
    surface: '#2C2C2C',
    text: '#FFFFFF',
    accent: '#EF5350',
    error: '#f13a59',
  },
  fonts: {
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold',
    },
  },
  roundness: 8,
};

export default appStyle;