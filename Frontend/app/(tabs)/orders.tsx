import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Add this import
import Constants from 'expo-constants';
import { AuthContext } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface OrderItem {
  inventoryId: {
    _id: string;
    dimensions: string;
    length: string;
    species: string;
    grade: string;
    price: {
      amount: number;
      type: string;
    };
  };
  quantity: number;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'fulfilled' | 'cancelled';
  totalAmount: number;
  orderedAt: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, token } = useContext(AuthContext);
  const { theme } = useStyleTheme();

  // Remove the old useEffect and replace with this:
  const fetchOrders = useCallback(async () => {
    if (!user) {
      console.log('No user found, clearing orders');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('=== ORDERS DEBUG ===');
    console.log('Current logged in user:', user);
    console.log('Current user ID:', user._id);
    console.log('Current user email:', user.email);
    console.log('Expected user ID for Kristen:', '68745d5f2f0b8be487c35d06');
    console.log('Chesney user ID (should NOT match):', '6872e6dc3057f00c9a3a23d8');
    console.log('API call URL:', `${API_BASE_URL}/orders/user/${user._id}`);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const ordersData = await response.json();
        console.log('Raw orders response:', ordersData);
        console.log('Number of orders returned:', ordersData.length);
        
        // Log each order's userId
        ordersData.forEach((order: Order, index: number) => {
          console.log(`Order ${index + 1}:`, {
            orderId: order._id,
            userId: order.userId,
            isCurrentUser: order.userId === user._id
          });
        });
        
        setOrders(ordersData.sort((a: Order, b: Order) => 
          new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
        ));
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token]); // Dependencies ensure it re-runs when user changes

  // This runs every time the user changes (login/logout/switch users)
  useEffect(() => {
    console.log('User changed, fetching orders...');
    fetchOrders();
  }, [fetchOrders]);

  // This runs every time the Orders tab comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Orders tab focused, refreshing data...');
      fetchOrders();
    }, [fetchOrders])
  );

  // Clear orders when user logs out
  useEffect(() => {
    if (!user) {
      console.log('User logged out, clearing orders');
      setOrders([]);
    }
  }, [user]);

  // Add this useEffect to immediately clear orders when user changes
  useEffect(() => {
    if (user) {
      console.log('User changed to:', user.email);
      setOrders([]); // Clear old orders immediately
      setLoading(true); // Show loading state
    }
  }, [user?._id]); // Only trigger when user ID actually changes

  const cancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? The items will be returned to inventory.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the cancel endpoint instead of delete
              const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: 'PUT',  // Changed from DELETE to PUT
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                const result = await response.json();
                Alert.alert(
                  'Success', 
                  `Order cancelled successfully! ${result.message || 'Items returned to inventory.'}`
                );
                fetchOrders(); // Refresh orders to show updated status
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to cancel order');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'fulfilled':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'fulfilled':
        return 'Fulfilled';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item: orderItem }: { item: OrderItem }) => (
    <View style={styles.orderItemCard}>
      <ThemedText style={styles.orderItemName}>
        {orderItem.inventoryId.dimensions} x {orderItem.inventoryId.length} {orderItem.inventoryId.species}
      </ThemedText>
      <ThemedText style={styles.orderItemDetails}>
        Grade: {orderItem.inventoryId.grade}
      </ThemedText>
      <ThemedText style={styles.orderItemDetails}>
        Quantity: {orderItem.quantity}
      </ThemedText>
      <ThemedText style={styles.orderItemPrice}>
        ${(orderItem.inventoryId.price.amount * orderItem.quantity).toFixed(2)}
      </ThemedText>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, { backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5' }]}>
      <View style={styles.orderHeader}>
        <ThemedText type="defaultSemiBold" style={styles.orderId}>
          Order #{item._id.slice(-6)}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.orderDate}>
        Ordered: {new Date(item.orderedAt).toLocaleDateString()} at {new Date(item.orderedAt).toLocaleTimeString()}
      </ThemedText>

      <View style={styles.orderItems}>
        <FlatList
          data={item.items}
          renderItem={renderOrderItem}
          keyExtractor={(orderItem, index) => `${item._id}_${index}`}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.orderFooter}>
        <ThemedText type="defaultSemiBold" style={styles.totalAmount}>
          Total: ${item.totalAmount.toFixed(2)}
        </ThemedText>
        
        {/* Only show cancel button for pending orders */}
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelOrder(item._id)}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
        <ThemedText>Loading orders...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>My Orders</ThemedText>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <ThemedText type="subtitle">No orders yet</ThemedText>
          <ThemedText>Your orders will appear here once you place them</ThemedText>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
        />
      )}
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
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  orderCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    marginBottom: 10,
    opacity: 0.7,
  },
  orderItems: {
    marginVertical: 10,
  },
  orderItemCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderItemDetails: {
    fontSize: 12,
    marginBottom: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  totalAmount: {
    fontSize: 16,
    color: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});