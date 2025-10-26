import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as Updates from 'expo-updates'; // Correct import
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Conditionally handle updates only in production
  useEffect(() => {
    if (__DEV__) {
      // Skip update check in development
      return;
    } else {
      const checkForUpdates = async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {
          console.error('Update check failed:', e);
        }
      };
      checkForUpdates();
    }
  }, []);

  if (!fontsLoaded) {
    return null; // Loading state
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}