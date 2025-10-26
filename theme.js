import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    primary: '#C62828',
    background: '#1C1C1C',
    surface: '#2C2C2C',
    text: '#FFFFFF',
    accent: '#EF5350',
    onSurfaceVariant: '#FFFFFF',
  },
  fonts: {
    regular: { fontFamily: 'Inter-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Inter-Bold', fontWeight: 'bold' },
    titleLarge: { fontFamily: 'Inter-Bold', fontWeight: 'bold', fontSize: 22, letterSpacing: 0.1 },
    labelLarge: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 14, letterSpacing: 0.1 },
    bodyMedium: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 16 },
    labelMedium: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 12, letterSpacing: 0.3 },
    bodySmall: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 12, letterSpacing: 0.2 },
    headlineSmall: { fontFamily: 'Inter-Bold', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.15 },
    bodyLarge: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 18, letterSpacing: 0.15 },
    headlineMedium: { fontFamily: 'Inter-Bold', fontWeight: 'bold', fontSize: 20, letterSpacing: 0.1 },
    displayLarge: { fontFamily: 'Inter-Bold', fontWeight: 'bold', fontSize: 28, letterSpacing: 0.05 },
    titleMedium: { fontFamily: 'Inter-Bold', fontWeight: 'bold', fontSize: 20, letterSpacing: 0.15 },
    labelSmall: { fontFamily: 'Inter-Regular', fontWeight: 'normal', fontSize: 10, letterSpacing: 0.4 },
  },
  roundness: 8,
  elevation: {
    level2: 4,
  },
};