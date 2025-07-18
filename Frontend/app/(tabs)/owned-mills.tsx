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
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

interface InventoryFormData {
  length: string;
  dimensions: string;
  species: string;
  grade: string;
  dryingLevel: string;
  quantity: string;
  unit: string;
  priceAmount: string;
  priceType: string;
  notes: string;
}

export default function OwnedMillsScreen() {
  const { theme } = useStyleTheme();
  const insets = useSafeAreaInsets();
  const { user, token, ownedMills, fetchOwnedMills } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [editingMill, setEditingMill] = useState<Mill | null>(null);
  const [selectedMillForInventory, setSelectedMillForInventory] = useState<Mill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    millNumber: '',
    name: '',
    city: '',
    province: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
  });
  const [inventoryFormData, setInventoryFormData] = useState<InventoryFormData>({
    length: '',
    dimensions: '',
    species: '',
    grade: '',
    dryingLevel: '',
    quantity: '',
    unit: 'pieces',
    priceAmount: '',
    priceType: 'per piece',
    notes: '',
  });

  const loadOwnedMills = useCallback(async () => {
    if (!user || !token) {
      return;
    }

    if (isLoading || modalVisible) return;

    setIsLoading(true);
    try {
      await fetchOwnedMills();
    } catch (error) {
      console.error('Error loading owned mills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, token, fetchOwnedMills, isLoading, modalVisible]);

  // This runs every time the user changes (login/logout/switch users)
  useEffect(() => {
    if (user && !modalVisible) {
      loadOwnedMills();
    }
  }, [user]); 

  // This runs every time the Owned Mills tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && !modalVisible) {
        loadOwnedMills();
      }
    }, [user, modalVisible])
  );

  // Clear data when user logs out
  useEffect(() => {
    if (!user) {
      setModalVisible(false);
      setInventoryModalVisible(false);
      setEditingMill(null);
      setSelectedMillForInventory(null);
      setFormData({
        millNumber: '',
        name: '',
        city: '',
        province: '',
        latitude: '',
        longitude: '',
        phone: '',
        email: '',
      });
      resetInventoryForm();
    }
  }, [user]);

  // useEffect to immediately clear data when user changes
  useEffect(() => {
    if (user) {
      setModalVisible(false);
      setInventoryModalVisible(false);
      setEditingMill(null);
      setSelectedMillForInventory(null);
      setIsLoading(true);
    }
  }, [user?._id]);

  const resetInventoryForm = () => {
    setInventoryFormData({
      length: '',
      dimensions: '',
      species: '',
      grade: '',
      dryingLevel: '',
      quantity: '',
      unit: 'pieces',
      priceAmount: '',
      priceType: 'per piece',
      notes: '',
    });
  };

  const openCreateModal = () => {
    setEditingMill(null);
    setFormData({
      millNumber: '',
      name: '',
      city: '',
      province: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (mill: Mill) => {
    setEditingMill(mill);
    setFormData({
      millNumber: mill.millNumber,
      name: mill.name,
      city: mill.location.city,
      province: mill.location.province,
      latitude: mill.location.latitude.toString(),
      longitude: mill.location.longitude.toString(),
      phone: mill.contact.phone || '',
      email: mill.contact.email || '',
    });
    setModalVisible(true);
  };

  const openInventoryModal = (mill: Mill) => {
    setSelectedMillForInventory(mill);
    resetInventoryForm();
    setInventoryModalVisible(true);
  };

  const handleSaveMill = async () => {
    if (!formData.millNumber || !formData.name || !formData.city || !formData.province) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Error', 'Please enter valid latitude and longitude');
      return;
    }

    setIsLoading(true);
    try {
      const millData = {
        millNumber: formData.millNumber,
        name: formData.name,
        location: {
          city: formData.city,
          province: formData.province,
          latitude,
          longitude,
        },
        contact: {
          phone: formData.phone || undefined,
          email: formData.email || undefined,
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

      Alert.alert(
        'Success',
        `Mill ${editingMill ? 'updated' : 'created'} successfully`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );

      await loadOwnedMills();
    } catch (error) {
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to save mill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInventory = async () => {
    if (!selectedMillForInventory || !inventoryFormData.length || !inventoryFormData.dimensions || 
        !inventoryFormData.species || !inventoryFormData.grade || !inventoryFormData.dryingLevel || 
        !inventoryFormData.quantity || !inventoryFormData.priceAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const quantity = parseInt(inventoryFormData.quantity);
    const priceAmount = parseFloat(inventoryFormData.priceAmount);

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (isNaN(priceAmount) || priceAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsFormLoading(true);
    try {
      const inventoryData = {
        millId: selectedMillForInventory._id,
        length: inventoryFormData.length,
        dimensions: inventoryFormData.dimensions,
        species: inventoryFormData.species,
        grade: inventoryFormData.grade,
        dryingLevel: inventoryFormData.dryingLevel,
        manufactureDate: new Date(),
        quantity,
        unit: inventoryFormData.unit,
        price: {
          amount: priceAmount,
          type: inventoryFormData.priceType,
        },
        notes: inventoryFormData.notes || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add inventory');
      }

      Alert.alert(
        'Success',
        'Inventory added successfully',
        [{ text: 'OK', onPress: () => setInventoryModalVisible(false) }]
      );

      resetInventoryForm();
    } catch (error) {
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to add inventory');
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

  const renderMillItem = ({ item }: { item: Mill }) => (
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
      
      {item.contact.phone && (
        <ThemedText style={styles.contact}>Phone: {item.contact.phone}</ThemedText>
      )}
      
      {item.contact.email && (
        <ThemedText style={styles.contact}>Email: {item.contact.email}</ThemedText>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.inventoryButton]}
          onPress={() => openInventoryModal(item)}
        >
          <Text style={styles.buttonText}>Add Inventory</Text>
        </TouchableOpacity>
        
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
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please log in to view your mills.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Mills</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Add Mill</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
        </View>
      )}

      {ownedMills.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            You don't own any mills yet.
          </ThemedText>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Text style={styles.addButtonText}>Add Your First Mill</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ownedMills}
          renderItem={renderMillItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={loadOwnedMills}
        />
      )}

      {/* Create/Edit Mill Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
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
            <TouchableOpacity onPress={handleSaveMill} disabled={isLoading}>
              <Text style={[styles.saveButton, { 
                color: isLoading ? '#999' : '#007AFF',
                opacity: isLoading ? 0.6 : 1 
              }]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Mill Number *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.millNumber}
              onChangeText={(text) => setFormData({ ...formData, millNumber: text })}
              placeholder="Enter mill number"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Mill Name *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter mill name"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              City *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Enter city"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Province *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.province}
              onChangeText={(text) => setFormData({ ...formData, province: text })}
              placeholder="Enter province"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Latitude *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.latitude}
              onChangeText={(text) => setFormData({ ...formData, latitude: text })}
              placeholder="Enter latitude"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Longitude *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.longitude}
              onChangeText={(text) => setFormData({ ...formData, longitude: text })}
              placeholder="Enter longitude"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Phone
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Add Inventory Modal */}
      <Modal
        visible={inventoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setInventoryModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <ThemedText type="subtitle">
              Add Inventory
            </ThemedText>
            <TouchableOpacity onPress={handleSaveInventory} disabled={isFormLoading}>
              <Text style={[styles.saveButton, { 
                color: isFormLoading ? '#999' : '#007AFF',
                opacity: isFormLoading ? 0.6 : 1 
              }]}>
                {isFormLoading ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Length *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.length}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, length: text })}
              placeholder="e.g., 8', 10', 12'"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Dimensions *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.dimensions}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, dimensions: text })}
              placeholder="e.g., 2x4, 2x6, 2x8"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Species *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.species}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, species: text })}
              placeholder="e.g., SPF, Douglas Fir"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Grade *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.grade}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, grade: text })}
              placeholder="e.g., #2 and better, #3"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Drying Level *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.dryingLevel}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, dryingLevel: text })}
              placeholder="e.g., KDHT, HT, GR"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Quantity *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.quantity}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, quantity: text })}
              placeholder="Enter quantity"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Unit
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.unit}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, unit: text })}
              placeholder="e.g., pieces, bundles, mbf"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Price Amount *
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.priceAmount}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, priceAmount: text })}
              placeholder="Enter price amount"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Price Type
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.priceType}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, priceType: text })}
              placeholder="e.g., per piece, per board foot"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            />

            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              Notes
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#555' : '#ddd'
              }]}
              value={inventoryFormData.notes}
              onChangeText={(text) => setInventoryFormData({ ...inventoryFormData, notes: text })}
              placeholder="Optional notes about this inventory"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
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
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
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
  },
  contact: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  inventoryButton: {
    backgroundColor: '#28a745',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
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
    borderBottomColor: '#eee',
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
});