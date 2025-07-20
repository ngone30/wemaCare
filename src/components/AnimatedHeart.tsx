import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedHeartProps {
  size?: number;
  color?: string;
  animate?: boolean;
}

export default function AnimatedHeart({ 
  size = 32, 
  color = 'white',
  animate = true 
}: AnimatedHeartProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animate) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { 
            duration: 800, 
            easing: Easing.out(Easing.cubic) 
          }),
          withTiming(1, { 
            duration: 800, 
            easing: Easing.in(Easing.cubic) 
          })
        ),
        -1,
        false
      );
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
}