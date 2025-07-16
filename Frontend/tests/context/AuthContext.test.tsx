import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import { Text } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      json: () => Promise.resolve({
        token: 'mock-token',
        user: { id: '1', email: 'test@example.com' }
      })
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

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

    expect(contextValue.user).toEqual({ id: '1', email: 'test@example.com' });
    expect(contextValue.token).toBe('mock-token');
  });

  it('handles login failure', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

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
    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
  });
});