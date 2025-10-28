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
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { getCurrentUser, loadUsers, saveUsers } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    height: '',
    age: '',
    goalWeight: '75',
    goal: 'lose_weight'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const fieldData = {
    username: { label: 'Username', icon: 'account', type: 'text' },
    email: { label: 'Email', icon: 'email', type: 'email' },
    height: { label: 'Height (cm)', icon: 'ruler', type: 'numeric' },
    age: { label: 'Age', icon: 'cake', type: 'numeric' },
    goalWeight: { label: 'Goal Weight (kg)', icon: 'flag', type: 'numeric' }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const username = await getCurrentUser();
    setCurrentUser(username);

    if (username) {
      const users = await loadUsers();
      const user = users.find(u => u.username === username);
      if (user) {
        setUserData(prev => ({
          ...prev,
          username: user.username,
          email: user.email || '',
          height: user.height || '',
          age: user.age || '',
          goalWeight: user.goalWeight || '75',
          goal: user.goal || 'lose_weight'
        }));
      }
    }
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
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
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

  const ProfileField = ({ field }) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={() => isEditing && openFieldEditor(field)}
      activeOpacity={isEditing ? 0.7 : 1}
    >
      <MaterialCommunityIcons name={fieldData[field].icon} size={20} color={appStyle.colors.accent} />
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{fieldData[field].label}</Text>
        <Text style={styles.fieldValue}>{userData[field] || 'Not set'}</Text>
      </View>
      {isEditing && (
        <MaterialCommunityIcons name="pencil" size={16} color="#888" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['#2C2C2C', '#1C1C1C']}
            style={styles.headerGradient}
          >
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.username}>{userData.username}</Text>
            <Text style={styles.memberSince}>Fitness Member</Text>
          </LinearGradient>
        </View>

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
        </View>

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
                  Edit {activeField ? fieldData[activeField].label : ''}
                </Text>

                <TextInput
                  style={styles.modalInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  placeholder={`Enter ${activeField ? fieldData[activeField].label.toLowerCase() : ''}`}
                  placeholderTextColor="#888"
                  keyboardType={activeField && fieldData[activeField].type === 'numeric' ? 'numeric' : 'default'}
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
    height: 200,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
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
    backgroundColor: '#363636',
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
  actionButtons: {
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
    borderColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#F44336',
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
    backgroundColor: '#363636',
    borderRadius: 12,
    padding: 16,
    color: appStyle.colors.text,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appStyle.colors.accent,
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