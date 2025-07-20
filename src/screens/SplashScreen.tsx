import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#2E7D32',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        alignItems: 'center'
      }}>
        {/* Logo Container */}
        <View style={{
          width: 120,
          height: 120,
          backgroundColor: '#FFFFFF',
          borderRadius: 60,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}>
          <Ionicons name="medical" size={60} color="#2E7D32" />
        </View>

        {/* App Name */}
        <Text style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: 8,
          letterSpacing: 1
        }}>
          WemaCARE
        </Text>

        {/* Tagline */}
        <Text style={{
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          marginBottom: 32,
          paddingHorizontal: 40
        }}>
          Your AI-powered healthcare companion
        </Text>

        {/* Loading indicator */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: 8,
            height: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            marginHorizontal: 4,
            opacity: 0.7
          }} />
          <View style={{
            width: 8,
            height: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            marginHorizontal: 4,
            opacity: 0.5
          }} />
          <View style={{
            width: 8,
            height: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            marginHorizontal: 4,
            opacity: 0.3
          }} />
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        alignItems: 'center'
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <Ionicons name="shield-checkmark" size={16} color="#FBC02D" />
          <Text style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            marginLeft: 4
          }}>
            Secure & Private
          </Text>
        </View>
        
        <Text style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 12
        }}>
          © 2024 WemaCARE. All rights reserved.
        </Text>
      </View>
    </View>
  );
}