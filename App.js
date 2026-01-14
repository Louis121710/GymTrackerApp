import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import './global.css';
import MainTabs from './src/navigation/MainTabs';
import appStyle from './appStyle';
import { AuthProvider } from './src/context/AuthContext';
import { UserProfileProvider } from './src/context/UserProfileContext';

const AppRoot = () => {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });
  const [styleTheme, setStyleTheme] = useState(null);

  useEffect(() => {
    if (appStyle && appStyle.colors) {
      setStyleTheme(appStyle);
    } else {
      console.error('AppRoot style invalid');
    }
  }, []);

  if (!fontsLoaded || !styleTheme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#DC2626', fontSize: 18, fontFamily: 'Inter-Bold' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider theme={styleTheme}>
          <AuthProvider>
            <UserProfileProvider>
              <NavigationContainer theme={styleTheme}>
                <MainTabs />
              </NavigationContainer>
            </UserProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default AppRoot;