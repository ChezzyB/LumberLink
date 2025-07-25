import React, { useEffect, useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useStyleTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { user, ownedMills } = useContext(AuthContext);
  const { theme } = useStyleTheme();
  const router = useRouter();

  // Handle automatic redirection based on auth state
  useEffect(() => {
    if (user) {
      // If user is authenticated and we're on login/register, redirect to mills
      const currentPath = router.pathname;
      if (currentPath === '/login' || currentPath === '/register') {
        router.replace('/mills');
      }
    }
  }, [user, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size || 24} color={color} />
          ),
          href: user ? null : '/login',
        }}
      />
      
      <Tabs.Screen
        name="register"
        options={{
          title: 'Register',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size || 24} color={color} />
          ),
          href: user ? null : '/register',
        }}
      />
      
      <Tabs.Screen
        name="mills"
        options={{
          title: 'Mills',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size || 24} color={color} />
          ),
          href: !user ? null : '/mills',
        }}
      />
      
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size || 24} color={color} />
          ),
          href: !user ? null : '/inventory',
        }}
      />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size || 24} color={color} />
          ),
          href: !user ? null : '/orders',
        }}
      />

      <Tabs.Screen
        name="owned-mills"
        options={{
          title: 'My Mills',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size || 24} color={color} />
          ),
          //href: (!user || ownedMills.length === 0) ? null : '/owned-mills',
          href: !user ? null : '/owned-mills',
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size || 24} color={color} />
          ),
          href: !user ? null : '/account',
        }}
      />      
    </Tabs>
  );
}
