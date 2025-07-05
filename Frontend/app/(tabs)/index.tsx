import { Image } from 'expo-image';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { HelloSun } from '@/components/WelcomeSun';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ToggleThemeButton from '@/components/ToggleThemeButton';
import ToggleConversionButton from '@/components/ToggleConversionButton';

const windowHeight = Dimensions.get('window').height;

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerHeight={200}
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          <Image
            source={require('@/assets/images/RainbowIcon.svg')}
            style={styles.reactLogo}
          />
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the Mobile Weather App!</ThemedText>
      
      </ThemedView>
      <ThemedView style={styles.sunContainer}>
        <HelloSun />  
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1:</ThemedText>
        <ThemedText type="defaultSemiBold">Select your theme (dark/light)</ThemedText>
        <ToggleThemeButton />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2:</ThemedText>
        <ThemedText type="defaultSemiBold">Select your temperature units (Celcius/Fahrenheit)</ThemedText>
        <ToggleConversionButton />
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: windowHeight * 0.3, // 30% of screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactLogo: {
    height: 150,
    width: 150,
  },
  titleContainer: {
    
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sunContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 2,
    marginBottom: 2,
  },
});
