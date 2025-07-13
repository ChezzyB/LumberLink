import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView, // Add this import
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface Mill {
  _id: string;
  millNumber: string;
  name: string;
  location: {
    city: string;
    province: string;
    latitude: number;
    longitude: number;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  owner?: string;
  createdAt: string;
}

export default function OwnedMillsScreen() {
  const { theme } = useStyleTheme();
  const insets = useSafeAreaInsets();
  const { user, token, ownedMills, fetchOwnedMills } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMill, setEditingMill] = useState<Mill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [millNumber, setMillNumber] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Memoized functions to prevent unnecessary re-renders
  const loadOwnedMills = useCallback(async () => {
    if (isLoading || modalVisible) return;
    
    setIsLoading(true);
    try {
      await fetchOwnedMills();
    } finally {
      setIsLoading(false);
    }
  }, [fetchOwnedMills, isLoading, modalVisible]);

  const openCreateModal = useCallback(() => {
    setEditingMill(null);
    setMillNumber('');
    setName('');
    setCity('');
    setProvince('');
    setLatitude('');
    setLongitude('');
    setPhone('');
    setEmail('');
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((mill: Mill) => {
    setEditingMill(mill);
    setMillNumber(mill.millNumber);
    setName(mill.name);
    setCity(mill.location.city);
    setProvince(mill.location.province);
    setLatitude(mill.location.latitude.toString());
    setLongitude(mill.location.longitude.toString());
    setPhone(mill.contact?.phone || '');
    setEmail(mill.contact?.email || '');
    setModalVisible(true);
  }, []);

  // Only load data on mount, not on every render
  useEffect(() => {
    if (user && !modalVisible) { // Only load when modal is closed
      loadOwnedMills();
    }
  }, [user]); // Remove any other dependencies that might trigger during typing

  const handleSaveMill = async () => {
    if (isFormLoading) return; // Prevent multiple saves
    
    // Validation
    if (!millNumber || !name || !city || !province || !latitude || !longitude) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Error', 'Please enter valid latitude and longitude');
      return;
    }

    setIsFormLoading(true);
    try {
      const millData = {
        millNumber,
        name,
        location: {
          city,
          province,
          latitude: lat,
          longitude: lon,
        },
        contact: {
          phone: phone || undefined,
          email: email || undefined,
        },
        owner: user?._id,
      };

      const url = editingMill 
        ? `${API_BASE_URL}/mills/${editingMill._id}`
        : `${API_BASE_URL}/mills`;
      
      const method = editingMill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(millData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingMill ? 'update' : 'create'} mill`);
      }

      setModalVisible(false);
      await loadOwnedMills(); // Only reload after successful save
      Alert.alert('Success', `Mill ${editingMill ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving mill:', error);
      Alert.alert('Error', `Failed to ${editingMill ? 'update' : 'create'} mill`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteMill = (mill: Mill) => {
    Alert.alert(
      'Delete Mill',
      `Are you sure you want to delete "${mill.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMill(mill._id) },
      ]
    );
  };

  const deleteMill = async (millId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mills/${millId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete mill');
      }

      Alert.alert('Success', 'Mill deleted successfully');
      await loadOwnedMills();
    } catch (error) {
      console.error('Error deleting mill:', error);
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to delete mill');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMillItem = useCallback(({ item }: { item: Mill }) => (
    <View style={[styles.millCard, { 
      backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
      borderColor: theme === 'dark' ? '#555' : '#ddd'
    }]}>
      <View style={styles.millHeader}>
        <ThemedText type="subtitle" style={styles.millName}>{item.name}</ThemedText>
        <ThemedText style={styles.millNumber}>#{item.millNumber}</ThemedText>
      </View>
      
      <ThemedText style={styles.location}>
        {item.location.city}, {item.location.province}
      </ThemedText>
      
      {/* Fix: Add null checks for contact object */}
      {item.contact?.phone && (
        <ThemedText style={styles.contact}>Phone: {item.contact.phone}</ThemedText>
      )}
      
      {item.contact?.email && (
        <ThemedText style={styles.contact}>Email: {item.contact.email}</ThemedText>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteMill(item)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [theme, openEditModal, handleDeleteMill]);

  // Calculate safe area padding with fallbacks
  const getSafeAreaStyle = () => {
    if (Platform.OS === 'ios') {
      // On iOS, SafeAreaView handles everything, but we can still use insets for fine control
      return {
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
      };
    } else {
      // On Android, use insets with fallbacks
      return {
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
        paddingTop: insets.top || StatusBar.currentHeight || 24, // Fallback chain
        paddingBottom: insets.bottom || 0,
        paddingLeft: insets.left || 0,
        paddingRight: insets.right || 0,
      };
    }
  };

  const SafeContainer = ({ children, style }: { children: React.ReactNode; style?: any }) => {
    if (Platform.OS === 'ios') {
      return (
        <SafeAreaView style={[styles.safeContainer, getSafeAreaStyle(), style]}>
          {children}
        </SafeAreaView>
      );
    } else {
      return (
        <View style={[styles.safeContainer, getSafeAreaStyle(), style]}>
          {children}
        </View>
      );
    }
  };

  // Replace the entire useMemo section with direct JSX:
  const modalContent = (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeContainer>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelButton, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <ThemedText type="subtitle">
                {editingMill ? 'Edit Mill' : 'Add New Mill'}
              </ThemedText>
              <TouchableOpacity onPress={handleSaveMill} disabled={isFormLoading}>
                <Text style={[styles.saveButton, { 
                  color: isFormLoading ? '#999' : '#007AFF',
                  opacity: isFormLoading ? 0.6 : 1 
                }]}>
                  {isFormLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Form fields with individual memoization */}
              <FormField
                label="Mill Number *"
                value={millNumber}
                onChangeText={setMillNumber} // Direct setter - no object spread
                placeholder="Enter mill number"
                theme={theme}
              />

              <FormField
                label="Mill Name *"
                value={name}
                onChangeText={setName} // Direct setter - no object spread
                placeholder="Enter mill name"
                theme={theme}
              />

              <FormField
                label="City *"
                value={city}
                onChangeText={setCity} // Direct setter - no object spread
                placeholder="Enter city"
                theme={theme}
              />

              <FormField
                label="Province *"
                value={province}
                onChangeText={setProvince} // Direct setter - no object spread
                placeholder="Enter province"
                theme={theme}
              />

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  <FormField
                    label="Latitude *"
                    value={latitude}
                    onChangeText={setLatitude} // Direct setter - no object spread
                    placeholder="50.6761"
                    keyboardType="numeric"
                    theme={theme}
                  />
                </View>
                <View style={styles.formColumn}>
                  <FormField
                    label="Longitude *"
                    value={longitude}
                    onChangeText={setLongitude} // Direct setter - no object spread
                    placeholder="-120.3408"
                    keyboardType="numeric"
                    theme={theme}
                  />
                </View>
              </View>

              <FormField
                label="Phone"
                value={phone}
                onChangeText={setPhone} // Direct setter - no object spread
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                theme={theme}
              />

              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail} // Direct setter - no object spread
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                theme={theme}
              />

              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeContainer>
    </Modal>
  );

  const { container, safeContainer, header, addButton, addButtonText, loadingContainer, emptyContainer, emptyText, listContainer, millCard, millHeader, millName, millNumber: millNumberStyle, location, contact, buttonContainer, actionButton, editButton, deleteButton, buttonText, modalContainer, modalHeader, cancelButton, saveButton, formContainer, formGroup, formRow, formColumn, label, input } = styles;

  if (!user) {
    return (
      <SafeContainer>
        <ThemedView style={container}>
          <ThemedText>Please log in to view your mills.</ThemedText>
        </ThemedView>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ThemedView style={container}>
        <View style={header}>
          <ThemedText type="title">My Mills</ThemedText>
          <TouchableOpacity style={addButton} onPress={openCreateModal}>
            <Text style={addButtonText}>+ Add Mill</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
          </View>
        )}

        {ownedMills.length === 0 && !isLoading ? (
          <View style={emptyContainer}>
            <ThemedText style={emptyText}>
              You don't own any mills yet.
            </ThemedText>
            <TouchableOpacity style={addButton} onPress={openCreateModal}>
              <Text style={addButtonText}>Add Your First Mill</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={ownedMills}
            renderItem={renderMillItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={listContainer}
            refreshing={isLoading}
            onRefresh={modalVisible ? undefined : loadOwnedMills} // Don't refresh when modal is open
          />
        )}

        {modalContent}
      </ThemedView>
    </SafeContainer>
  );
}

// Create a memoized FormField component
const FormField = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default', 
  autoCapitalize = 'sentences',
  theme 
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  theme: string;
}) => (
  <View style={styles.formGroup}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <TextInput
      style={[styles.input, { 
        backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
        color: theme === 'dark' ? '#fff' : '#000',
        borderColor: theme === 'dark' ? '#555' : '#ddd'
      }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
    />
  </View>
));

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 20,
  },
  millCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  millHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  millName: {
    flex: 1,
  },
  millNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  location: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  contact: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});