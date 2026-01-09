import { DefaultTheme } from 'react-native-paper';

const appStyle = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors - bold red and black theme
    primary: '#DC2626', // Bold red (primary actions)
    primaryDark: '#991B1B', // Darker red for depth
    primaryLight: '#EF4444', // Lighter red for highlights
    background: '#000000', // Pure black background
    surface: '#0F0F0F', // Very dark gray surface
    surfaceElevated: '#1A1A1A', // Elevated cards
    text: '#FFFFFF', // Pure white text
    textSecondary: '#B3B3B3', // Light gray text
    accent: '#DC2626', // Red accent (matches primary)
    accentLight: '#F87171', // Light red for subtle accents
    error: '#DC2626', // Red error (matches theme)
    success: '#22C55E', // Green success (for positive actions)
    warning: '#F59E0B', // Amber warning
    
    // Gradient colors - red to black
    gradientStart: '#1A0000', // Dark red-black
    gradientMid: '#0D0000', // Medium black-red
    gradientEnd: '#000000', // Pure black
    
    // Card and component colors
    cardBackground: '#0F0F0F', // Dark card background
    cardBorder: '#1F1F1F', // Subtle red-tinted border
    divider: '#1F1F1F',
    
    // Interactive states
    active: '#DC2626', // Red for active states
    inactive: '#404040', // Gray for inactive
    hover: '#2A2A2A', // Hover state
    pressed: '#991B1B', // Pressed state (darker red)
  },
  gradients: {
    primary: ['#1A0000', '#0D0000', '#000000'], // Red to black gradient
    header: ['#2A0000', '#1A0000', '#000000'], // Header gradient
    red: ['#DC2626', '#B91C1C', '#991B1B'], // Red gradient
    dark: ['#000000', '#0A0A0A', '#141414'], // Dark gradient
    accent: ['#DC2626', '#EF4444', '#F87171'], // Red accent gradient
    card: ['#0F0F0F', '#141414'], // Card gradient
    section: ['#0A0A0A', '#000000'], // Section background
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
  roundness: 16, // More rounded for modern look
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 12,
    },
  },
};

export default appStyle;