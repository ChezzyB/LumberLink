import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API base URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  ownedMills: any[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchOwnedMills: () => Promise<void>;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  ownedMills: [],
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  changePassword: async () => {},
  fetchOwnedMills: async () => {},
  token: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownedMills, setOwnedMills] = useState<any[]>([]);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching user data
          await verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Clear invalid auth data
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Token verification failed:', error);
      await clearAuthData();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store auth data
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      // Fetch owned mills after successful login
      await fetchOwnedMills();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      // DON'T auto-login after registration
      // Just return success - user needs to login manually
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Optional: Call logout endpoint if you implement one
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthData();
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  const fetchOwnedMills = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/mills?owner=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const mills = await response.json();
        console.log('Owned mills:', mills); // Debug log
        setOwnedMills(mills);
      } else {
        console.error('Failed to fetch owned mills');
      }
    } catch (error) {
      console.error('Error fetching owned mills:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!token || !user) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token || !user) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password change failed');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // Fetch owned mills when user or token changes
  useEffect(() => {
    if (user && token) {
      fetchOwnedMills();
    }
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      ownedMills,
      login, 
      register, 
      logout, 
      updateUser,
      changePassword,
      fetchOwnedMills,
      token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
