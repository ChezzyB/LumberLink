import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme } = useStyleTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/mills');
    } catch (error) {
      Alert.alert('Error', (error instanceof Error && error.message) ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Welcome to LumberLink</ThemedText>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          color: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#555' : '#ddd'
        }]}
        placeholder="Email"
        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          color: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#555' : '#ddd'
        }]}
        placeholder="Password"
        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={navigateToRegister} style={styles.linkButton}>
        <ThemedText style={styles.linkText}>
          Don't have an account? Register here
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});