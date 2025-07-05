import { Image } from 'expo-image';
import { Dimensions, StyleSheet, View } from 'react-native';

import { HelloSun } from '@/components/WelcomeSun';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


const windowHeight = Dimensions.get('window').height;

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerHeight={40}
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/RainbowIcon.svg')}
            style={styles.noLogo}
          />
        </View>
      }
    >
      <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/RainbowIcon.svg')}
            style={styles.smallLogo}
          />
        </View>
      <ThemedView style={styles.titleContainer}>
        <HelloSun />
        <ThemedText type="title" style={styles.titleText}>About this app</ThemedText>
        <HelloSun />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Weather API source:</ThemedText>
        <ThemedText type="defaultSemiBold">https://api.openweathermap.org/data/2.5</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Made by:</ThemedText>
        <ThemedText type="defaultSemiBold">Chesney Brooke</ThemedText>
      </ThemedView>

      <ThemedView style={styles.bottomContainer}>
        <Image
          source={require('@/assets/images/RainbowIcon.svg')}
          style={styles.bigLogo}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  titleText: {
    marginHorizontal: 8,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
  },
  smallLogo: {
    height: 50,
    width: 50,
  },
  noLogo: {
    height: 0,
    width: 0,
  },
  bigLogo: {
    height: 200,
    width: 200,
  },
  stepContainer: {
    gap: 2,
    marginBottom: 16,
  },
});
