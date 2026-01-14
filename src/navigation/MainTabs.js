import React from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginPage from '../screens/LoginPage';
import HomePage from '../screens/HomePage';
import AddRecordPage from '../screens/AddRecordPage';
import StatsPage from '../screens/StatsPage';
import ProfilePage from '../screens/ProfilePage';
import CustomWorkoutPage from '../screens/CustomWorkoutPage';
import appStyle from '../../appStyle';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appStyle.colors.background }}>
        <Text style={{ color: appStyle.colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Calculate safe bottom padding for navigation bar
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  // Custom tab bar component that wraps icon and label together
  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderTopColor: appStyle.colors.cardBorder,
          borderTopWidth: 1,
          height: 70 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 12,
          elevation: 20,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AddRecord') {
            iconName = 'plus-box';
          } else if (route.name === 'CustomWorkout') {
            iconName = 'dumbbell';
          } else if (route.name === 'Stats') {
            iconName = 'chart-line';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else if (route.name === 'Login') {
            iconName = 'login';
          }

          const iconColor = isFocused ? '#FFFFFF' : appStyle.colors.textSecondary;
          const labelColor = isFocused ? '#FFFFFF' : appStyle.colors.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {isFocused ? (
                <LinearGradient
                  colors={appStyle.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 60,
                  }}
                >
                  <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
                  <Text style={{ color: labelColor, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                    {label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                  <Text style={{ color: labelColor, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                    {label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AddRecord') {
            iconName = 'plus-box';
          } else if (route.name === 'CustomWorkout') {
            iconName = 'dumbbell';
          } else if (route.name === 'Stats') {
            iconName = 'chart-line';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else if (route.name === 'Login') {
            iconName = 'login';
          }

          return null; // We'll handle icons in custom tab bar
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: appStyle.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we use custom one
        },
        headerShown: false,
      })}
      tabBar={(props) => (user ? <CustomTabBar {...props} /> : null)}
    >
      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen name="Home" component={HomePage} />
          <Tab.Screen 
            name="AddRecord" 
            component={AddRecordPage}
            options={{ tabBarLabel: 'Records' }}
          />
          <Tab.Screen 
            name="CustomWorkout" 
            component={CustomWorkoutPage}
            options={{ tabBarLabel: 'Workouts' }}
          />
          <Tab.Screen name="Stats" component={StatsPage} />
          <Tab.Screen name="Profile" component={ProfilePage} />
        </>
      ) : (
        // Not authenticated - only show login
        <Tab.Screen name="Login" component={LoginPage} />
      )}
    </Tab.Navigator>
  );
};

export default MainTabs;