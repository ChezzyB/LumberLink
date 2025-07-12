import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { theme } = useStyleTheme();


  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      Alert.alert('Success', 'Account created successfully! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          color: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#555' : '#ddd'
        }]}
        placeholder="Username"
        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
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
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          color: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#555' : '#ddd'
        }]}
        placeholder="Confirm Password"
        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={navigateToLogin} style={styles.linkButton}>
        <ThemedText style={styles.linkText}>
          Already have an account? Login here
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