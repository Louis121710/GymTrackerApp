// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import GraphScreen from '../screens/GraphScreen';
import { theme } from '../../theme';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: 'Inter-Bold' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Gym Tracker' }} />
      <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add/Edit Entry' }} />
      <Stack.Screen name="Graph" component={GraphScreen} options={{ title: 'Weight Graph' }} />
    </Stack.Navigator>
  );
}