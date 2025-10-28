import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import MainTabs from './src/navigation/MainTabs';
import appStyle from './appStyle';

// Try different import paths
let AuthProvider;
try {
  // Try the first path
  const authContext = require('./src/context/AuthContext');
  AuthProvider = authContext.AuthProvider;
} catch (error) {
  console.log('First import failed, trying alternative...');
  try {
    // Try without ./src
    const authContext = require('./context/AuthContext');
    AuthProvider = authContext.AuthProvider;
  } catch (error2) {
    console.log('All imports failed, creating simple AuthProvider...');
    // Create a simple fallback
    AuthProvider = ({ children }) => children;
  }
}

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1C' }}>
        <Text style={{ color: '#FFFFFF' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={styleTheme}>
        <AuthProvider>
          <NavigationContainer theme={styleTheme}>
            <MainTabs />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default AppRoot;