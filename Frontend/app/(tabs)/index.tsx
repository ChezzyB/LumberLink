import { useEffect, useContext } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useStyleTheme } from '@/context/ThemeContext';
import { AuthContext } from '@/context/AuthContext';

export default function IndexRedirect() {
  const { theme } = useStyleTheme();
  const { user, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/mills');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color={theme === 'dark' ? 'white' : 'black'} />
    </ThemedView>
  );
}
