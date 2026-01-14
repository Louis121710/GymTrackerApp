import { DefaultTheme } from 'react-native-paper';

const appStyle = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors - Orange-to-Coral gradient theme (matching logo)
    primary: '#FF3333', // Primary orange-red (exact logo color)
    primaryDark: '#E55A2B', // Darker orange for depth
    primaryLight: '#FF8C42', // Lighter orange for highlights
    
    // Background colors - Slate palette
    background: '#0F172A', // Slate-900 (main background)
    surface: '#1E293B', // Slate-800 (cards)
    surfaceElevated: '#334155', // Slate-700 (elevated surfaces)
    
    // Text colors
    text: '#FFFFFF', // Pure white (headings)
    textSecondary: '#94A3B8', // Slate-400 (secondary text)
    textTertiary: '#64748B', // Slate-500 (muted text)
    
    // Accent colors
    accent: '#FF6B35', // Orange-red accent (from logo gradient)
    accentLight: '#FF8C42', // Light orange
    accentDark: '#FF4D2D', // Darker orange
    
    // Status colors
    error: '#EF4444', // Red error
    success: '#4CAF50', // Green success
    warning: '#FFA726', // Orange warning
    info: '#3B82F6', // Blue info
    
    // Gradient colors - Orange-to-Coral (matching logo exactly)
    gradientStart: '#FF3333', // Orange-red (start) - exact logo color
    gradientMid: '#FF6B35', // Orange-red (middle)
    gradientEnd: '#FF8C42', // Coral (end)
    
    // Card and component colors
    cardBackground: '#1E293B', // Slate-800 (card background)
    cardBorder: '#334155', // Slate-700 (subtle border)
    divider: '#334155', // Slate-700
    
    // Interactive states
    active: '#FF6B35', // Orange for active states
    inactive: '#475569', // Slate-600 for inactive
    hover: '#334155', // Slate-700 hover state
    pressed: '#FF4D2D', // Pressed state (darker orange)
  },
  gradients: {
    primary: ['#FF3333', '#FF6B35', '#FF8C42'], // Orange-to-Coral (exact logo gradient)
    header: ['#FF3333', '#FF6B35', '#FF8C42'], // Header gradient (matches logo exactly)
    accent: ['#FF6B35', '#FF8C42'], // Orange accent gradient
    dark: ['#0F172A', '#1E293B'], // Dark gradient
    card: ['#1E293B', '#334155'], // Card gradient
    section: ['#1E293B', '#0F172A'], // Section background
    button: ['#FF3333', '#FF6B35'], // Button gradient
    success: ['#4CAF50', '#66BB6A'], // Success gradient
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  roundness: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
    full: 9999, // rounded-full
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    accent: {
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
    h2: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
    h3: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    body: { fontSize: 16, fontWeight: '400', color: '#94A3B8' },
    bodyBold: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    caption: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
    small: { fontSize: 12, fontWeight: '400', color: '#64748B' },
  },
};

export default appStyle;
