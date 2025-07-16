// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiBaseUrl: 'http://localhost:3000/api'
    }
  }
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 49.2827,
        longitude: -123.1207
      }
    })
  )
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((fn) => fn()),
  useNavigation: () => ({
    navigate: jest.fn()
  })
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    pathname: '/mills'
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Global fetch mock
global.fetch = jest.fn();

// Set longer timeout for async operations
jest.setTimeout(10000);

// Suppress console warnings for tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Setup for clean tests
beforeEach(() => {
  jest.clearAllMocks();
});