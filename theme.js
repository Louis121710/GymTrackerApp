// theme.js
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C62828', // Red
    background: '#1C1C1C', // Dark gray
    surface: '#2C2C2C', // Card/input background
    text: '#FFFFFF', // White
    accent: '#EF5350', // Softer red
  },
  fonts: {
    regular: { fontFamily: 'Inter-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Inter-Bold', fontWeight: 'bold' },
  },
};