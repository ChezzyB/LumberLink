import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { AuthContext } from '@/context/AuthContext';
import { useMill } from '@/context/MillContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

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
  distance?: number;
}

export default function MillsScreen() {
  const [mills, setMills] = useState<Mill[]>([]);
  const [filteredMills, setFilteredMills] = useState<Mill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const { token, user } = useContext(AuthContext);
  const { selectedMill, setSelectedMill } = useMill();
  const { theme } = useStyleTheme();

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for distance filtering');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, []);

  const fetchMills = useCallback(async () => {
    if (!user || !token) {
      setMills([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const millsData = await response.json();
        setMills(millsData);
      } else {
        Alert.alert('Error', 'Failed to fetch mills');
      }
    } catch (error) {
      console.error('Error fetching mills:', error);
      Alert.alert('Error', 'Failed to fetch mills');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }, []);

  const filterMills = useCallback(() => {
    let filtered = [...mills];

    // Filter by city if search term is provided
    if (searchCity.trim()) {
      filtered = filtered.filter(mill => 
        mill.location.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    // Calculate distances and filter by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(mill => ({
        ...mill,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          mill.location.latitude,
          mill.location.longitude
        )
      }));

      // Filter by max distance
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist)) {
        filtered = filtered.filter(mill => (mill.distance || 0) <= maxDist);
      }

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredMills(filtered);
  }, [mills, searchCity, maxDistance, userLocation, calculateDistance]);

  // This runs every time the user changes (login/logout/switch users)
  useEffect(() => {
    fetchMills();
    getCurrentLocation();
  }, [fetchMills, getCurrentLocation]);

  // This runs every time the Mills tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMills();
    }, [fetchMills])
  );

  // Clear mills when user logs out
  useEffect(() => {
    if (!user) {
      setMills([]);
      setFilteredMills([]);
      setSelectedMill(null);
    }
  }, [user, setSelectedMill]);

  // Immediately clear mills when user changes
  useEffect(() => {
    if (user) {
      setMills([]);
      setFilteredMills([]);
      setLoading(true);
    }
  }, [user?._id]);

  useEffect(() => {
    filterMills();
  }, [filterMills]);

  const selectMill = useCallback((mill: Mill) => {
    setSelectedMill(mill);
    Alert.alert('Mill Selected', `Selected: ${mill.name}`);
  }, [setSelectedMill]);

  const renderMillItem = ({ item }: { item: Mill }) => (
    <TouchableOpacity
      style={[
        styles.millCard,
        {
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          borderColor: theme === 'dark' ? '#555' : '#ddd',
          borderWidth: selectedMill?._id === item._id ? 2 : 1,
          borderLeftColor: selectedMill?._id === item._id ? '#007AFF' : (theme === 'dark' ? '#555' : '#ddd'),
          borderLeftWidth: selectedMill?._id === item._id ? 4 : 1,
        },
      ]}
      onPress={() => selectMill(item)}
    >
      <View style={styles.millHeader}>
        <ThemedText type="subtitle" style={styles.millName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.millNumber}>#{item.millNumber}</ThemedText>
      </View>

      <ThemedText style={styles.location}>
        {item.location.city}, {item.location.province}
      </ThemedText>

      {item.distance !== undefined && (
        <ThemedText style={styles.distance}>
          {item.distance.toFixed(1)} km away
        </ThemedText>
      )}

      {item.contact?.phone && (
        <ThemedText style={styles.contact}>📞 {item.contact.phone}</ThemedText>
      )}

      {item.contact?.email && (
        <ThemedText style={styles.contact}>📧 {item.contact.email}</ThemedText>
      )}

      {selectedMill?._id === item._id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓ Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
        <ThemedText>Loading mills...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Select a Mill</ThemedText>
      
      {selectedMill && (
        <View style={[styles.selectedMill, { backgroundColor: theme === 'dark' ? '#444' : '#e3f2fd' }]}>
          <ThemedText type="defaultSemiBold">Selected: {selectedMill.name}</ThemedText>
        </View>
      )}

      <View style={styles.filters}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
            color: theme === 'dark' ? '#fff' : '#000',
            borderColor: theme === 'dark' ? '#555' : '#ddd'
          }]}
          placeholder="Search by city..."
          placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
          value={searchCity}
          onChangeText={setSearchCity}
        />
        
        <TextInput
          style={[styles.input, styles.distanceInput, { 
            backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
            color: theme === 'dark' ? '#fff' : '#000',
            borderColor: theme === 'dark' ? '#555' : '#ddd'
          }]}
          placeholder="Distance km"
          placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
          value={maxDistance}
          onChangeText={setMaxDistance}
          keyboardType="numeric"
        />
      </View>

      <FlatList
        data={filteredMills}
        renderItem={renderMillItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  selectedMill: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  distanceInput: {
    flex: 0.4,
    marginRight: 0,
  },
  list: {
    paddingBottom: 20,
  },
  millCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
  },
  millHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  millName: {
    fontSize: 16,
    marginBottom: 5,
  },
  millNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  location: {
    fontSize: 14,
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  contact: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});