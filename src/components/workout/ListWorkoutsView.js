/**
 * View component for displaying list of saved custom workouts
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../../appStyle';
import WorkoutCard from '../features/WorkoutCard';
import EmptyState from '../ui/EmptyState';

const ListWorkoutsView = ({
  savedWorkouts,
  refreshing,
  onRefresh,
  onEditWorkout,
  onDeleteWorkout,
  onCreateWorkout
}) => (
  <View style={styles.container}>
    <ScrollView
      style={styles.listContainer}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      scrollEventThrottle={16}
      decelerationRate="normal"
      bounces={true}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
    >
      {savedWorkouts.length === 0 ? (
        <EmptyState 
          icon="dumbbell"
          title="No Workouts Yet"
          subtitle="Create your first custom workout to get started"
          actionLabel="Create Workout"
          onAction={onCreateWorkout}
        />
      ) : (
        <View style={styles.workoutsList}>
          {(Array.isArray(savedWorkouts) ? savedWorkouts : []).map((workout) => (
            <WorkoutCard 
              key={workout.id} 
              workout={workout}
              onPress={onEditWorkout}
              onDelete={onDeleteWorkout}
            />
          ))}
        </View>
      )}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...appStyle.shadows.large,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  listContainer: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    flexGrow: 1,
  },
  workoutsList: {
    gap: 15,
  },
});

export default ListWorkoutsView;
