// components/ToggleThemeButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStyleTheme } from '../context/ThemeContext';



const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useStyleTheme();
  const isDark = theme === 'dark';

  return (
    <View style={{ alignItems: 'center', marginVertical: 5 }}>
      
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginTop: 10,
          padding: 10,
          backgroundColor: isDark ? '#333' : '#ddd',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: isDark ? '#fff' : '#000' }}>
          {theme ==='dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleThemeButton;
