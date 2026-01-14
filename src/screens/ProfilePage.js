import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { 
  getCurrentUser, 
  loadUsers, 
  saveUsers, 
  loadEntries, 
  loadWorkoutLogs,
  loadBodyMeasurements,
  addBodyMeasurement
} from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useIsFocused } from '@react-navigation/native';
import StatCard from '../components/ui/StatCard';
import styles from './ProfilePage.styles';

// Screen displaying user profile information and settings
const ProfilePage = () => {
  const { logout } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    height: '',
    age: '',
    goalWeight: '75',
    goal: 'lose_weight',
    profileVisibility: 'public',
    memberSince: null,
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'measurements'
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalVolume: 0,
    cardioSessions: 0
  });
  const [bodyMeasurements, setBodyMeasurements] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fieldData = {
    username: { label: 'Username', icon: 'account', type: 'text' },
    email: { label: 'Email', icon: 'email', type: 'email' },
    height: { label: 'Height (cm)', icon: 'ruler', type: 'numeric' },
    age: { label: 'Age', icon: 'cake', type: 'numeric' },
    goalWeight: { label: 'Goal Weight (kg)', icon: 'flag', type: 'numeric' },
    bodyFat: { label: 'Body Fat %', icon: 'percent', type: 'numeric' },
    chest: { label: 'Chest (cm)', icon: 'human-male', type: 'numeric' },
    waist: { label: 'Waist (cm)', icon: 'human-male', type: 'numeric' },
    hips: { label: 'Hips (cm)', icon: 'human-male', type: 'numeric' },
    biceps: { label: 'Biceps (cm)', icon: 'hand', type: 'numeric' },
    thighs: { label: 'Thighs (cm)', icon: 'human-male', type: 'numeric' }
  };

  useEffect(() => {
    if (isFocused) {
      loadUserProfile();
      loadStatistics();
      loadCalendarData();
      loadBodyMeasurementsData();
    }
  }, [isFocused, profile, currentMonth]);

  const loadUserProfile = async () => {
    const username = await getCurrentUser();
    setCurrentUser(username);

    if (profile && profile.username) {
      setUserData({
        username: profile.username,
        email: profile.email || '',
        height: profile.height || '',
        age: profile.age || '',
        goalWeight: profile.goalWeight || '75',
        goal: profile.goal || 'lose_weight',
        profileVisibility: profile.profileVisibility || 'public',
        memberSince: profile.memberSince || null,
        bodyFat: profile.bodyFat || '',
        chest: profile.chest || '',
        waist: profile.waist || '',
        hips: profile.hips || '',
        biceps: profile.biceps || '',
        thighs: profile.thighs || ''
      });
    } else if (username) {
      const users = await loadUsers();
      const user = users.find(u => u.username === username);
      if (user) {
        setUserData({
          username: user.username,
          email: user.email || '',
          height: user.height || '',
          age: user.age || '',
          goalWeight: user.goalWeight || '75',
          goal: user.goal || 'lose_weight',
          profileVisibility: user.profileVisibility || 'public',
          memberSince: user.memberSince || Date.now(),
          bodyFat: user.bodyFat || '',
          chest: user.chest || '',
          waist: user.waist || '',
          hips: user.hips || '',
          biceps: user.biceps || '',
          thighs: user.thighs || ''
        });
        // Set memberSince if not set
        if (!user.memberSince) {
          const updatedUsers = (Array.isArray(users) ? users : []).map(u => 
            u.username === username ? { ...u, memberSince: Date.now() } : u
          );
          await saveUsers(updatedUsers);
        }
      }
    }
  };

  const loadStatistics = async () => {
    const username = await getCurrentUser();
    if (!username) return;

    const entries = await loadEntries(username);
    const workoutLogs = await loadWorkoutLogs(username);

    // Calculate total exercises
    const exerciseSet = new Set();
    workoutLogs.forEach(log => {
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
          if (ex.name) exerciseSet.add(ex.name.toLowerCase());
        });
      }
    });

    // Calculate total volume
    let totalVolume = 0;
    workoutLogs.forEach(log => {
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
          if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach(set => {
              const weight = parseFloat(set.weight) || 0;
              const reps = parseFloat(set.reps) || 0;
              totalVolume += weight * reps;
            });
          }
        });
      }
    });

    // Calculate cardio sessions
    const cardioSessions = entries.filter(entry => entry.did_cardio).length;

    setStats({
      totalWorkouts: entries.length + workoutLogs.length,
      totalExercises: exerciseSet.size,
      totalVolume: Math.round(totalVolume),
      cardioSessions: cardioSessions
    });
  };

  const loadCalendarData = async () => {
    const username = await getCurrentUser();
    if (!username) return;

    const entries = await loadEntries(username);
    const workoutLogs = await loadWorkoutLogs(username);

    // Create a map of dates to activity types
    const dateMap = {};

    // Process entries (weight logging)
    entries.forEach(entry => {
      if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { weight: false, workout: false };
        }
        dateMap[dateKey].weight = true;
      }
    });

    // Process workout logs
    workoutLogs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { weight: false, workout: false };
        }
        dateMap[dateKey].workout = true;
      }
    });

    setCalendarData(dateMap);
  };

  const loadBodyMeasurementsData = async () => {
    const username = await getCurrentUser();
    if (!username) return;
    const measurements = await loadBodyMeasurements(username);
    setBodyMeasurements(measurements.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleSaveProfile = async () => {
    if (!userData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      const users = await loadUsers();
      const updatedUsers = (Array.isArray(users) ? users : []).map(user =>
        user.username === currentUser ? { ...user, ...userData } : user
      );

      await saveUsers(updatedUsers);
      setIsEditing(false);
      refreshProfile();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSaveBodyMeasurement = async () => {
    const username = await getCurrentUser();
    if (!username) return;

    const measurement = {
      bodyFat: userData.bodyFat || '',
      chest: userData.chest || '',
      waist: userData.waist || '',
      hips: userData.hips || '',
      biceps: userData.biceps || '',
      thighs: userData.thighs || ''
    };

    await addBodyMeasurement(measurement, username);
    await loadBodyMeasurementsData();
    Alert.alert('Success', 'Body measurement saved!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const openFieldEditor = (field) => {
    setActiveField(field);
    setTempValue(userData[field] || '');
  };

  const saveFieldValue = () => {
    if (activeField) {
      setUserData(prev => ({
        ...prev,
        [activeField]: tempValue
      }));
    }
    setActiveField(null);
  };

  const formatMemberSince = () => {
    if (!userData.memberSince) return 'Recently';
    const date = new Date(userData.memberSince);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `Member for ${diffDays} days`;
    if (diffDays < 365) return `Member for ${Math.floor(diffDays / 30)} months`;
    return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDateKey = (day) => {
    if (day === null) return null;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return `${year}-${month}-${day}`;
  };

  const getDayStatus = (day) => {
    const dateKey = getDateKey(day);
    if (!dateKey || !calendarData[dateKey]) return null;
    return calendarData[dateKey];
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };


  const ProfileField = ({ field, showEdit = true }) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={() => isEditing && showEdit && openFieldEditor(field)}
      activeOpacity={isEditing && showEdit ? 0.7 : 1}
    >
      <MaterialCommunityIcons name={fieldData[field]?.icon || 'circle'} size={20} color={appStyle.colors.accent} />
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{fieldData[field]?.label || field}</Text>
        <Text style={styles.fieldValue} numberOfLines={1}>
          {userData[field] || 'Not set'}
        </Text>
      </View>
      {isEditing && showEdit && (
        <MaterialCommunityIcons name="pencil" size={16} color="#888" />
      )}
    </TouchableOpacity>
  );

  const CalendarView = () => {
    const days = getDaysInMonth(currentMonth) || [];
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={appStyle.colors.text} />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>{monthName}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavButton}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={appStyle.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {(Array.isArray(weekDays) ? weekDays : []).map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {(Array.isArray(days) ? days : []).map((day, index) => {
            const status = getDayStatus(day);
            const isToday = day !== null && 
              currentMonth.getFullYear() === new Date().getFullYear() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              day === new Date().getDate();

            return (
              <View key={index} style={styles.calendarDayCell}>
                {day !== null ? (
                  <View style={[
                    styles.calendarDay,
                    isToday && styles.calendarDayToday,
                    status && (status.weight || status.workout) && styles.calendarDayActive
                  ]}>
                    <Text style={[
                      styles.calendarDayText,
                      isToday && styles.calendarDayTextToday,
                      status && (status.weight || status.workout) && styles.calendarDayTextActive
                    ]}>
                      {day}
                    </Text>
                    {status && (
                      <View style={styles.calendarDayIndicators}>
                        {status.weight && (
                          <View style={[styles.indicator, styles.weightIndicator]} />
                        )}
                        {status.workout && (
                          <View style={[styles.indicator, styles.workoutIndicator]} />
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.calendarDayEmpty} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, styles.weightIndicator]} />
            <Text style={styles.legendText}>Weight Logged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, styles.workoutIndicator]} />
            <Text style={styles.legendText}>Workout logged</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={appStyle.gradients.header}
          style={styles.header}
        >
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.username}>{userData.username || 'User'}</Text>
          <Text style={styles.memberSince}>{formatMemberSince()}</Text>
        </LinearGradient>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard icon="dumbbell" value={stats.totalWorkouts} label="Workouts" color={appStyle.colors.primary} />
          <StatCard icon="weight-lifter" value={stats.totalExercises} label="Exercises" color={appStyle.colors.accentLight} />
          <StatCard icon="weight-kilogram" value={stats.totalVolume.toLocaleString()} label="Total Volume" color={appStyle.colors.primaryLight} />
          <StatCard icon="run" value={stats.cardioSessions} label="Cardio" color={appStyle.colors.primary} />
        </View>

        {/* Calendar */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Activity Calendar</Text>
          <CalendarView />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(Array.isArray(['overview', 'measurements']) ? ['overview', 'measurements'] : []).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <ProfileField field="username" />
              <ProfileField field="email" />
              <ProfileField field="height" />
              <ProfileField field="age" />
              <ProfileField field="goalWeight" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fitness Goals</Text>
              <View style={styles.fieldContainer}>
                <MaterialCommunityIcons name="target" size={20} color={appStyle.colors.accent} />
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Primary Goal</Text>
                  {isEditing ? (
                    <View style={styles.goalButtons}>
                      {[
                        { value: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
                        { value: 'gain_muscle', label: 'Gain Muscle', icon: 'trending-up' },
                        { value: 'maintain', label: 'Maintain', icon: 'trending-neutral' }
                      ].map(goal => (
                        <TouchableOpacity
                          key={goal.value}
                          style={[
                            styles.goalButton,
                            userData.goal === goal.value && styles.goalButtonActive
                          ]}
                          onPress={() => {
                            setUserData(prev => ({ ...prev, goal: goal.value }));
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name={goal.icon}
                            size={16}
                            color={userData.goal === goal.value ? '#FFFFFF' : appStyle.colors.text}
                          />
                          <Text style={[
                            styles.goalButtonText,
                            userData.goal === goal.value && styles.goalButtonTextActive
                          ]}>
                            {goal.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.fieldValue}>
                      {userData.goal === 'lose_weight' ? 'Lose Weight' :
                       userData.goal === 'gain_muscle' ? 'Gain Muscle' : 'Maintain'}
                    </Text>
                  )}
                </View>
              </View>
            </View>

          </View>
        )}

        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Measurements</Text>
              <ProfileField field="bodyFat" />
              <ProfileField field="chest" />
              <ProfileField field="waist" />
              <ProfileField field="hips" />
              <ProfileField field="biceps" />
              <ProfileField field="thighs" />
              
              {isEditing && (
                <TouchableOpacity
                  style={styles.saveMeasurementButton}
                  onPress={handleSaveBodyMeasurement}
                >
                  <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveMeasurementButtonText}>Save Measurement</Text>
                </TouchableOpacity>
              )}
            </View>

            {bodyMeasurements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Measurement History</Text>
                {(bodyMeasurements || []).slice(0, 5).map((measurement, index) => (
                  <View key={measurement.id || index} style={styles.measurementHistoryItem}>
                    <Text style={styles.measurementDate}>{measurement.date}</Text>
                    <View style={styles.measurementValues}>
                      {measurement.bodyFat && <Text style={styles.measurementValue}>BF: {measurement.bodyFat}%</Text>}
                      {measurement.chest && <Text style={styles.measurementValue}>Chest: {measurement.chest}cm</Text>}
                      {measurement.waist && <Text style={styles.measurementValue}>Waist: {measurement.waist}cm</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF3333', '#FF6B35', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  loadUserProfile();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF3333', '#FF6B35', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal for editing fields */}
      <Modal
        visible={!!activeField}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveField(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveField(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Edit {activeField ? fieldData[activeField]?.label : ''}
                </Text>

                <TextInput
                  style={styles.modalInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  placeholder={`Enter ${activeField ? fieldData[activeField]?.label.toLowerCase() : ''}`}
                  placeholderTextColor="#888"
                  keyboardType={activeField && fieldData[activeField]?.type === 'numeric' ? 'numeric' : 'default'}
                  autoFocus={true}
                  autoCapitalize={activeField === 'email' ? 'none' : 'sentences'}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setActiveField(null)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={saveFieldValue}
                  >
                    <Text style={styles.modalSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ProfilePage;
