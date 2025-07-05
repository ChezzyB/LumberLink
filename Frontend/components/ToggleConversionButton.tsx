// components/ToggleConversionButton.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useConversion } from '@/context/ConversionContext';
import { useStyleTheme } from '../context/ThemeContext';

export default function ToggleConversionButton() {
  const { theme: unitTheme, toggleConversion } = useConversion();
  const { theme } = useStyleTheme(); // <-- Correct usage
  const isDark = theme === 'dark';

  return (
    <View style={{ alignItems: 'center', marginVertical: 5 }}>
      <TouchableOpacity
        onPress={toggleConversion}
        style={{
          marginTop: 10,
          padding: 10,
          backgroundColor: isDark ? '#333' : '#ddd',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: isDark ? '#fff' : '#000' }}>
          {unitTheme === 'Celcius' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
