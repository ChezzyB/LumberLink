import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function HelloSun() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 10000, // Slow rotation: 10 seconds per full circle
      }),
      -1, // Infinite loop
      false // Don't reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.sunContainer, animatedStyle]}>
      <Animated.Text style={styles.sun}>☀️</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sunContainer: {
    marginLeft: 8,
  },
  sun: {
    fontSize: 32,
  },
});
