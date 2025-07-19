import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { cn } from '../utils/cn';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, signup } = useAuthStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!name || password !== confirmPassword) {
        Alert.alert('Error', 'Please ensure all fields are filled and passwords match');
        return;
      }
    }

    setLoading(true);
    try {
      const success = isSignUp ? 
        await signup(email, password, name) : 
        await login(email, password);
      
      if (!success) {
        Alert.alert('Error', 'Authentication failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center py-12">
            {/* Header */}
            <View className="items-center mb-12">
              <View style={{
                width: 80,
                height: 80,
                backgroundColor: '#2E7D32',
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="medical" size={40} color="white" />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#2E7D32',
                marginBottom: 8
              }}>WemaCARE</Text>
              <Text className="text-gray-600 text-center">
                {isSignUp ? 'Create your account to get started' : 'Welcome back'}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {isSignUp && (
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View>
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <View className="relative">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-gray-900"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </Pressable>
                </View>
              </View>

              {isSignUp && (
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              )}
            </View>

            {/* Auth Button */}
            <Pressable
              style={{
                backgroundColor: '#2E7D32',
                borderRadius: 12,
                paddingVertical: 16,
                marginTop: 32,
                opacity: loading ? 0.5 : 1
              }}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Text>
            </Pressable>

            {/* Toggle Auth Mode */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={{
                  color: '#2E7D32',
                  fontWeight: '600'
                }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}