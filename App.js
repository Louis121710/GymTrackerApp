import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Show nothing until fonts load
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}