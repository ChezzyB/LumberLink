// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React from 'react';
import { SafeAreaView } from 'react-native';

import { ThemeProvider, useStyleTheme } from '../context/ThemeContext';
import { ConversionProvider } from '../context/ConversionContext';
import { AuthProvider } from '../context/AuthContext';
import { MillProvider } from '../context/MillContext';

function InnerLayout() {
  const { theme } = useStyleTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <ConversionProvider>
          <MillProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          </MillProvider>
        </ConversionProvider>
      </NavigationThemeProvider>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}
