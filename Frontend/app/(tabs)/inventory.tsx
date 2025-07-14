import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { AuthContext } from '@/context/AuthContext';
import { useMill } from '@/context/MillContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface InventoryItem {
  _id: string;
  millId: string;
  length: string;
  dimensions: string;
  species: string;
  grade: string;
  dryingLevel: string;
  manufactureDate: string;
  quantity: number;
  unit: string;
  price: {
    amount: number;
    type: string;
  };
  notes?: string;
}

interface OrderItem {
  inventoryId: string;
  quantity: number;
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentMill, setCurrentMill] = useState<any>(null); // Add local mill state

  const { user, token } = useContext(AuthContext);
  const { selectedMill } = useMill();
  const { theme } = useStyleTheme();

  // Function to refresh mill data
  const refreshMillData = useCallback(() => {
    if (selectedMill) {
      console.log('Refreshing mill data for:', selectedMill.name);
      setCurrentMill({ ...selectedMill }); // Create a fresh copy
    } else {
      console.log('No mill selected, clearing current mill');
      setCurrentMill(null);
    }
  }, [selectedMill]);

  const fetchInventory = useCallback(async () => {
    if (!selectedMill || !user || !token) {
      console.log('Missing requirements for inventory fetch:', { 
        selectedMill: !!selectedMill, 
        user: !!user, 
        token: !!token 
      });
      setInventory([]);
      setLoading(false);
      return;
    }

    console.log('=== INVENTORY DEBUG ===');
    console.log('Current user:', user.email);
    console.log('Selected mill:', selectedMill.name);
    console.log('Fetching inventory for mill:', selectedMill._id);

    try {
      setLoading(true);
      // Try mill-specific endpoint first
      let response = await fetch(`${API_BASE_URL}/inventory/mill/${selectedMill._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let inventory;
      
      if (response.ok) {
        inventory = await response.json();
        console.log('Mill inventory received:', inventory.length, 'items');
      } else {
        // Fallback to all inventory and filter
        console.log('Mill-specific endpoint failed, trying general endpoint');
        response = await fetch(`${API_BASE_URL}/inventory`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const allInventory = await response.json();
          inventory = allInventory.filter(
            (item: InventoryItem) => item.millId === selectedMill._id
          );
          console.log('Filtered inventory:', inventory.length, 'items');
        } else {
          throw new Error('Both endpoints failed');
        }
      }

      setInventory(inventory);
      
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [selectedMill, user, token]);

  // This runs every time the user or mill changes
  useEffect(() => {
    console.log('User or mill changed, refreshing data...');
    refreshMillData(); // Refresh mill data
    fetchInventory();
  }, [refreshMillData, fetchInventory]);

  // This runs every time the Inventory tab comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Inventory tab focused, refreshing data...');
      refreshMillData(); // Refresh mill data when tab is focused
      fetchInventory();
    }, [refreshMillData, fetchInventory])
  );

  // Clear inventory when user logs out or mill is deselected
  useEffect(() => {
    if (!user || !selectedMill) {
      console.log('User logged out or mill deselected, clearing inventory');
      setInventory([]);
      setCart([]);
      setShowOrderModal(false);
      setSelectedItem(null);
      setCurrentMill(null); // Clear current mill
    }
  }, [user, selectedMill]);

  // Add this useEffect to immediately clear inventory when user changes
  useEffect(() => {
    if (user) {
      console.log('User changed to:', user.email);
      setInventory([]); // Clear old inventory immediately
      setCart([]);
      setShowOrderModal(false);
      setSelectedItem(null);
      setCurrentMill(null); // Clear current mill immediately
      setLoading(true); // Show loading state
    }
  }, [user?._id]); // Only trigger when user ID actually changes

  const addToCart = (item: InventoryItem, quantity: number) => {
    if (quantity > item.quantity) {
      Alert.alert('Error', 'Not enough quantity available');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.inventoryId === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.inventoryId === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { inventoryId: item._id, quantity }]);
    }

    Alert.alert('Success', `Added ${quantity} ${item.unit} to cart`);
    setShowOrderModal(false);
    setOrderQuantity('1');
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const item = inventory.find(inv => inv._id === cartItem.inventoryId);
      if (item) {
        return total + (item.price.amount * cartItem.quantity);
      }
      return total;
    }, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      const orderData = {
        userId: user?._id,
        items: cart,
        totalAmount: calculateCartTotal()
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Order placed successfully!');
        setCart([]);
        fetchInventory(); // Refresh inventory to show updated quantities
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <View style={[styles.inventoryCard, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
      <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
        {item.dimensions} x {item.length} {item.species}
      </ThemedText>
      <ThemedText style={styles.itemDetail}>Grade: {item.grade}</ThemedText>
      <ThemedText style={styles.itemDetail}>Drying: {item.dryingLevel}</ThemedText>
      <ThemedText style={styles.itemDetail}>
        Quantity: {item.quantity} {item.unit}
      </ThemedText>
      <ThemedText style={styles.price}>
        ${item.price.amount.toFixed(2)} {item.price.type}
      </ThemedText>
      {item.notes && (
        <ThemedText style={styles.notes}>Notes: {item.notes}</ThemedText>
      )}
      
      <TouchableOpacity
        style={[styles.orderButton, { opacity: item.quantity > 0 ? 1 : 0.5 }]}
        onPress={() => {
          setSelectedItem(item);
          setShowOrderModal(true);
        }}
        disabled={item.quantity === 0}
      >
        <ThemedText style={styles.orderButtonText}>
          {item.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Update the early returns to use currentMill instead of selectedMill
  if (!currentMill && !selectedMill) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Please select a mill first</ThemedText>
        <ThemedText>Go to the Mills tab to select a mill</ThemedText>
        <ThemedText style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Debug: selectedMill is {selectedMill ? 'set' : 'null'}, currentMill is {currentMill ? 'set' : 'null'}
        </ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
        <ThemedText>Loading inventory...</ThemedText>
        {currentMill && (
          <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 5 }}>
            For: {currentMill.name}
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  // Use currentMill for display, fallback to selectedMill
  const displayMill = currentMill || selectedMill;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Inventory for: {displayMill?.name || 'Unknown Mill'}
      </ThemedText>

      {/* Debug info - remove this after testing */}
      <ThemedText style={{ fontSize: 10, opacity: 0.5, textAlign: 'center', marginBottom: 10 }}>
        Debug: Mill refreshed at {new Date().toLocaleTimeString()}
      </ThemedText>

      {cart.length > 0 && (
        <View style={[styles.cartSummary, { backgroundColor: theme === 'dark' ? '#444' : '#e8f5e8' }]}>
          <ThemedText type="defaultSemiBold">
            Cart: {cart.length} items - Total: ${calculateCartTotal().toFixed(2)}
          </ThemedText>
          <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder}>
            <ThemedText style={styles.checkoutButtonText}>Place Order</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={inventory}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        // Add refresh control
        refreshing={loading}
        onRefresh={() => {
          refreshMillData();
          fetchInventory();
        }}
      />

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Add to Cart
            </ThemedText>
            
            {selectedItem && (
              <>
                <ThemedText style={styles.modalItemName}>
                  {selectedItem.dimensions} x {selectedItem.length} {selectedItem.species}
                </ThemedText>
                <ThemedText style={styles.modalPrice}>
                  ${selectedItem.price.amount.toFixed(2)} {selectedItem.price.type}
                </ThemedText>
                <ThemedText style={styles.modalAvailable}>
                  Available: {selectedItem.quantity} {selectedItem.unit}
                </ThemedText>

                <TextInput
                  style={[styles.quantityInput, { 
                    backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5',
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#555' : '#ddd'
                  }]}
                  placeholder="Quantity"
                  placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
                  value={orderQuantity}
                  onChangeText={setOrderQuantity}
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowOrderModal(false)}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.addButton]}
                    onPress={() => addToCart(selectedItem, parseInt(orderQuantity) || 1)}
                  >
                    <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  cartSummary: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  inventoryCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  orderButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  orderButtonText: {
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
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 15,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  modalAvailable: {
    fontSize: 12,
    marginBottom: 15,
  },
  quantityInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});