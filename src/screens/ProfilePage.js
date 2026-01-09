import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Dimensions
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

const { width } = Dimensions.get('window');

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
    bio: '',
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
    bio: { label: 'Bio', icon: 'text', type: 'text' },
    bodyFat: { label: 'Body Fat %', icon: 'percent', type: 'numeric' },
    chest: { label: 'Chest (cm)', icon: 'human-male', type: 'numeric' },
    waist: { label: 'Waist (cm)', icon: 'human-male', type: 'numeric' },
    hips: { label: 'Hips (cm)', icon: 'human-male', type: 'numeric' },
    biceps: { label: 'Biceps (cm)', icon: 'human-hand', type: 'numeric' },
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
        bio: profile.bio || '',
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
          bio: user.bio || '',
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
          const updatedUsers = users.map(u => 
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
      const updatedUsers = users.map(user =>
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

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ProfileField = ({ field, showEdit = true }) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={() => isEditing && showEdit && openFieldEditor(field)}
      activeOpacity={isEditing && showEdit ? 0.7 : 1}
    >
      <MaterialCommunityIcons name={fieldData[field]?.icon || 'circle'} size={20} color={appStyle.colors.accent} />
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{fieldData[field]?.label || field}</Text>
        <Text style={styles.fieldValue} numberOfLines={field === 'bio' ? 3 : 1}>
          {userData[field] || 'Not set'}
        </Text>
      </View>
      {isEditing && showEdit && (
        <MaterialCommunityIcons name="pencil" size={16} color="#888" />
      )}
    </TouchableOpacity>
  );

  const CalendarView = () => {
    const days = getDaysInMonth(currentMonth);
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
          {weekDays.map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
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
            <Text style={styles.legendText}>Workout Done</Text>
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
          {userData.bio && (
            <Text style={styles.bio} numberOfLines={2}>{userData.bio}</Text>
          )}
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
          {['overview', 'measurements'].map((tab) => (
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
              <Text style={styles.sectionTitle}>About</Text>
              <ProfileField field="bio" />
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workout Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Volume Lifted</Text>
                <Text style={styles.summaryValue}>{stats.totalVolume.toLocaleString()} kg</Text>
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
                {bodyMeasurements.slice(0, 5).map((measurement, index) => (
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
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
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

                {activeField === 'bio' ? (
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    value={tempValue}
                    onChangeText={setTempValue}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoFocus={true}
                  />
                ) : (
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
                )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStyle.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: appStyle.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  memberSince: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 10,
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: appStyle.colors.cardBackground,
    padding: 15,
    borderRadius: 16,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.small,
  },
  statValue: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.medium,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNavButton: {
    padding: 8,
  },
  calendarMonth: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    color: appStyle.colors.textSecondary,
    fontSize: 12,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },
  calendarDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: appStyle.colors.surface,
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: appStyle.colors.primary,
    borderWidth: 2,
    borderColor: appStyle.colors.accent,
  },
  calendarDayActive: {
    backgroundColor: appStyle.colors.surfaceElevated,
  },
  calendarDayEmpty: {
    flex: 1,
  },
  calendarDayText: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  calendarDayTextActive: {
    color: appStyle.colors.text,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  calendarDayIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  weightIndicator: {
    backgroundColor: '#4CAF50',
  },
  workoutIndicator: {
    backgroundColor: appStyle.colors.accentLight,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: appStyle.colors.accent,
  },
  tabText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    color: appStyle.colors.text,
    fontSize: 18,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 15,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  fieldContent: {
    flex: 1,
    marginLeft: 15,
  },
  fieldLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 4,
  },
  fieldValue: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  goalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  goalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  goalButtonActive: {
    backgroundColor: appStyle.colors.primary,
  },
  goalButtonText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  goalButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  summaryValue: {
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveMeasurementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  saveMeasurementButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  measurementHistoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#363636',
  },
  measurementDate: {
    color: appStyle.colors.text,
    fontSize: 14,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 5,
  },
  measurementValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measurementValue: {
    color: '#888',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: appStyle.colors.primary,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  bottomSpacer: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: appStyle.colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalTitle: {
    color: appStyle.colors.text,
    fontSize: 20,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: appStyle.colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: appStyle.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
});

export default ProfilePage;
