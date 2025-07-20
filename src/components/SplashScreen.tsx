import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  // Animation values
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const raysRotation = useSharedValue(0);
  const raysOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(50);

  useEffect(() => {
    // Sequential animation
    const animationSequence = async () => {
      // 1. Logo slides up and fades in
      logoTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      
      // 2. Heart appears and pulses
      await new Promise(resolve => setTimeout(resolve, 300));
      heartOpacity.value = withTiming(1, { duration: 600 });
      heartScale.value = withSequence(
        withTiming(1.2, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          3,
          false
        )
      );
      
      // 3. Sun rays fade in and rotate
      await new Promise(resolve => setTimeout(resolve, 200));
      raysOpacity.value = withTiming(1, { duration: 800 });
      raysRotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
      
      // 4. Text appears
      await new Promise(resolve => setTimeout(resolve, 400));
      textOpacity.value = withTiming(1, { duration: 600 });
      
      // 5. Complete after animation
      setTimeout(() => {
        onComplete();
      }, 2500);
    };

    animationSequence();
  }, []);

  // Animated styles
  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const raysStyle = useAnimatedStyle(() => ({
    opacity: raysOpacity.value,
    transform: [{ rotate: `${raysRotation.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Create sun rays
  const sunRays = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30) * (Math.PI / 180);
    const rayLength = 40;
    const rayWidth = 3;
    
    return (
      <View
        key={index}
        style={{
          position: 'absolute',
          width: rayWidth,
          height: rayLength,
          backgroundColor: '#FBC02D',
          borderRadius: rayWidth / 2,
          left: -rayWidth / 2,
          top: -rayLength,
          transformOrigin: `${rayWidth / 2}px ${rayLength}px`,
          transform: [{ rotate: `${index * 30}deg` }],
        }}
      />
    );
  });

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#2E7D32',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Animated.View 
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
          logoContainerStyle
        ]}
      >
        {/* Sun Rays Container */}
        <View style={{
          position: 'relative',
          width: 120,
          height: 120,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          {/* Animated Sun Rays */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                width: 120,
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
              },
              raysStyle
            ]}
          >
            {sunRays}
          </Animated.View>
          
          {/* Heart Icon */}
          <Animated.View style={[heartStyle]}>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: '#FF7043',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name="heart" size={32} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>
        
        {/* App Name */}
        <Animated.View style={[textStyle]}>
          <Text style={{
            fontSize: 36,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            WemaCare
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#E8F5E8',
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            HEALTHTECH
          </Text>
        </Animated.View>
      </Animated.View>
      
      {/* Loading indicator */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            bottom: 80,
            alignItems: 'center',
          },
          textStyle
        ]}
      >
        <View style={{
          width: 40,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <View style={{
            width: '70%',
            height: '100%',
            backgroundColor: '#FBC02D',
            borderRadius: 2,
          }} />
        </View>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 14,
          marginTop: 12,
        }}>
          Loading your health companion...
        </Text>
      </Animated.View>
    </View>
  );
}