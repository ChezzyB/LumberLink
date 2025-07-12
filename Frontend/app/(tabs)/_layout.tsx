import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AuthContext } from '@/context/AuthContext';

export default function TabsLayout() {
  const { user, ownedMills } = useContext(AuthContext);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Always define all screens, but conditionally hide them */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Always hidden since it's just a redirect
        }}
      />
      
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" size={28} color={color} />,
          href: user ? null : '/login', // Hide when authenticated
        }}
      />
      
      <Tabs.Screen
        name="register"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => <IconSymbol name="person.badge.plus.fill" size={28} color={color} />,
          href: user ? null : '/register', // Hide when authenticated
        }}
      />
      
      <Tabs.Screen
        name="mills"
        options={{
          title: 'Mills',
          tabBarIcon: ({ color }) => <IconSymbol name="building.2.fill" size={28} color={color} />,
          href: !user ? null : '/mills', // Hide when not authenticated
        }}
      />
      
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <IconSymbol name="list.bullet" size={28} color={color} />,
          href: !user ? null : '/inventory', // Hide when not authenticated
        }}
      />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <IconSymbol name="cart.fill" size={28} color={color} />,
          href: !user ? null : '/orders', // Hide when not authenticated
        }}
      />
      
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconSymbol name="person.crop.circle.fill" size={28} color={color} />,
          href: !user ? null : '/account', // Hide when not authenticated
        }}
      />
      
      <Tabs.Screen
        name="+not-found"
        options={{
          title: 'Not Found',
          tabBarIcon: ({ color }) => <IconSymbol name="exclamationmark.triangle.fill" size={28} color={color} />,
          href: !user ? null : '/not-found', // Hide when not authenticated
        }}
      />

      <Tabs.Screen
        name="owned-mills"
        options={{
          title: 'My Mills',
          tabBarIcon: ({ color }) => <IconSymbol name="building.2.crop.circle.fill" size={28} color={color} />,
          href: (!user || ownedMills.length === 0) ? null : '/owned-mills', // Hide when not authenticated or no owned mills
        }}
      />
    </Tabs>
  );
}
