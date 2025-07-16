import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Modal 
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

export default function AccountScreen() {
  const { user, logout, updateUser, changePassword, ownedMills } = useContext(AuthContext);
  const { theme } = useStyleTheme();

  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Refresh user data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        setEditedUser({
          username: user.username || '',
          email: user.email || ''
        });
      }
    }, [user])
  );

  // Also update when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateUser(editedUser);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to change password');
    }
  };

  const handleLogout = async () => {
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
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No user data available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Account Settings</ThemedText>

        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Profile Information</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme === 'dark' ? '#444' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={editMode ? editedUser.username : user.username}
              onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
              editable={editMode}
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme === 'dark' ? '#444' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={editMode ? editedUser.email : user.email}
              onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
              editable={editMode}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Member Since</ThemedText>
            <ThemedText style={styles.readOnlyText}>
              {new Date(user.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>

          <View style={styles.buttonRow}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditMode(false);
                    setEditedUser({ username: user.username, email: user.email });
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditMode(true)}
              >
                <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Security</ThemedText>
          
          <TouchableOpacity
            style={[styles.button, styles.passwordButton]}
            onPress={() => setShowPasswordModal(true)}
          >
            <ThemedText style={styles.passwordButtonText}>Change Password</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Owned Mills Section */}
        {ownedMills.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Owned Mills</ThemedText>
            <ThemedText style={styles.millCount}>
              You own {ownedMills.length} mill{ownedMills.length !== 1 ? 's' : ''}
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, styles.manageButton]}
              onPress={() => router.push('/owned-mills')}
            >
              <ThemedText style={styles.manageButtonText}>Manage Mills</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Password Change Modal */}
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Change Password
              </ThemedText>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }]}
                placeholder="Current Password"
                placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }]}
                placeholder="New Password"
                placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }]}
                placeholder="Confirm New Password"
                placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleChangePassword}
                >
                  <ThemedText style={styles.saveButtonText}>Change Password</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  readOnlyText: {
    fontSize: 16,
    paddingVertical: 15,
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  editButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  passwordButton: {
    backgroundColor: '#ff9800',
  },
  passwordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  millCount: {
    marginBottom: 10,
    fontSize: 14,
  },
  manageButton: {
    backgroundColor: '#4caf50',
  },
  manageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});