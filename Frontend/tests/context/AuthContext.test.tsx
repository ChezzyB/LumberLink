import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import { Text } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiBaseUrl: 'http://localhost:3000/api'
    }
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('provides initial context values', () => {
    let contextValue: any;

    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return <Text>Test</Text>;
        }}
      </AuthContext.Consumer>
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
    expect(contextValue.ownedMills).toEqual([]);
    expect(typeof contextValue.login).toBe('function');
    expect(typeof contextValue.logout).toBe('function');
    expect(typeof contextValue.register).toBe('function');
  });

  it('handles successful login', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        token: 'mock-token',
        user: { _id: '1', email: 'test@example.com', username: 'testuser' }
      })
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse) // For login
      .mockResolvedValueOnce({ // For fetchOwnedMills
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

    let contextValue: any;

    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return <Text>Test</Text>;
        }}
      </AuthContext.Consumer>
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await contextValue.login('test@example.com', 'password');
    });

    expect(contextValue.user).toEqual({ 
      _id: '1', 
      email: 'test@example.com', 
      username: 'testuser' 
    });
    expect(contextValue.token).toBe('mock-token');
  });

  it('handles login failure', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' })
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    let contextValue: any;
    let thrownError: any;

    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return <Text>Test</Text>;
        }}
      </AuthContext.Consumer>
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    try {
      await act(async () => {
        await contextValue.login('test@example.com', 'wrongpassword');
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toBe('Invalid credentials');
    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
  });

  it('handles logout', async () => {
    // First login
    const mockLoginResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        token: 'mock-token',
        user: { _id: '1', email: 'test@example.com', username: 'testuser' }
      })
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockLoginResponse) // For login
      .mockResolvedValueOnce({ // For fetchOwnedMills
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

    let contextValue: any;

    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return <Text>Test</Text>;
        }}
      </AuthContext.Consumer>
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    await act(async () => {
      await contextValue.login('test@example.com', 'password');
    });

    expect(contextValue.user).toBeTruthy();
    expect(contextValue.token).toBeTruthy();

    // Then logout
    await act(async () => {
      await contextValue.logout();
    });

    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
    expect(contextValue.ownedMills).toEqual([]);
  });
});