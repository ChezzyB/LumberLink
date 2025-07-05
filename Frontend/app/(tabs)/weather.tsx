import React, { useState } from 'react';
import {
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import Constants from 'expo-constants';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStyleTheme } from '../../context/ThemeContext';
import { useConversion } from '../../context/ConversionContext';

const API_KEY = Constants.expoConfig?.extra?.weatherApiKey;

const ThemedWeatherScreen = () => {
  const { theme } = useStyleTheme();
  const { theme: themeConversion } = useConversion();

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');

  const getWeather = async () => {
    if (!city) {
      Alert.alert('Please enter a city');
      return;
    }

    if (!API_KEY) {
      Alert.alert('API Key Missing', 'Please check your API key configuration.');
      return;
    }

    try {
      const currentWeatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );
      const currentWeatherData = await currentWeatherRes.json();

      if (currentWeatherData.cod === '404') {
        setError(currentWeatherData.message);
        setWeather(null);
        return;
      }

      setWeather(currentWeatherData);
      setError('');

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      if (!forecastData.list || !Array.isArray(forecastData.list)) {
        setForecast([]);
      } else {
        setForecast(forecastData.list.slice(0, 8));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Failed to fetch weather data.');
    }
  };

  const kelvinToTemp = (k: number) => {
    if (themeConversion === 'Celcius') {
      return `${Math.round(k - 273.15)}°C`;
    } else {
      return `${Math.round((k - 273.15) * 9 / 5 + 32)}°F`;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Please enter a city name:
        </ThemedText>

        <TextInput
          style={[styles.input, theme === 'dark' && styles.inputDark]}
          placeholder="Enter a city"
          value={city}
          onChangeText={setCity}
          placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
        />

        <TouchableOpacity style={styles.button} onPress={getWeather}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Get Weather</ThemedText>
        </TouchableOpacity>

        {error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : (
          <>
            {weather && (
              <ThemedView style={styles.weatherBox}>
                <ThemedText type="subtitle">{weather.name}</ThemedText>
                <ThemedText>{weather.weather[0].description}</ThemedText>
                <ThemedText>{kelvinToTemp(weather.main.temp)}</ThemedText>
                <ThemedText>Humidity: {weather.main.humidity}%</ThemedText>
                <ThemedText>Wind Speed: {weather.wind.speed} m/s</ThemedText>
                <Image
                  style={styles.weatherIcon}
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
                  }}
                />
              </ThemedView>
            )}

            {forecast.length > 0 && (
              <ThemedView style={styles.forecastContainer}>
                {forecast.map((item: any, index: number) => {
                  const date = new Date(item.dt * 1000);
                  const hour = date.getHours();
                  return (
                    <ThemedView key={index} style={styles.forecastItem}>
                      <ThemedText>{hour}:00</ThemedText>
                      <Image
                        style={styles.forecastIcon}
                        source={{
                          uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                        }}
                      />
                      <ThemedText>{kelvinToTemp(item.main.temp)}</ThemedText>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#aaa',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  weatherBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  forecastContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  forecastItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 20,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
});

export default ThemedWeatherScreen;
