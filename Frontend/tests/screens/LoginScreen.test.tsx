import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/(tabs)/login';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn()
  }
}));

jest.mock('../../context/AuthContext', () => ({
  AuthContext: {
    Consumer: ({ children }: any) => children({
      login: jest.fn(),
      user: null
    })
  }
}));

jest.mock('../../context/ThemeContext', () => ({
  useStyleTheme: () => ({ theme: 'light' })
}));

describe('LoginScreen', () => {
  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles email input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('handles password input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('shows loading state when submitting', async () => {
    const mockLogin = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    // Override the mock to return our custom login function
    jest.doMock('../../context/AuthContext', () => ({
      AuthContext: {
        Consumer: ({ children }: any) => children({
          login: mockLogin,
          user: null
        })
      }
    }));

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    expect(getByText('Logging in...')).toBeTruthy();
  });
});