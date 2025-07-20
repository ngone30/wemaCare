import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Address fields
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  
  // Emergency contacts
  const [emergencyContact1Name, setEmergencyContact1Name] = useState('');
  const [emergencyContact1Phone, setEmergencyContact1Phone] = useState('');
  const [emergencyContact1Relationship, setEmergencyContact1Relationship] = useState('');
  const [emergencyContact2Name, setEmergencyContact2Name] = useState('');
  const [emergencyContact2Phone, setEmergencyContact2Phone] = useState('');
  const [emergencyContact2Relationship, setEmergencyContact2Relationship] = useState('');
  
  // UI state
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const { login, signup } = useAuthStore();
  const { t } = useLanguage();

  // African countries list
  const africanCountries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
    'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire',
    'Democratic Republic of Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
    'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
    'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
    'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
    'Zambia', 'Zimbabwe'
  ];

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!name || password !== confirmPassword || !country || !city || !emergencyContact1Name || !emergencyContact1Phone) {
        Alert.alert('Error', 'Please ensure all required fields are filled and passwords match');
        return;
      }
    }

    setLoading(true);
    try {
      const success = isSignUp ? 
        await signup(email, password, name, {
          fullName: name,
          address: {
            country,
            city
          },
          emergencyContacts: [
            {
              name: emergencyContact1Name,
              phone: emergencyContact1Phone,
              relationship: emergencyContact1Relationship || 'Family'
            },
            ...(emergencyContact2Name && emergencyContact2Phone ? [{
              name: emergencyContact2Name,
              phone: emergencyContact2Phone,
              relationship: emergencyContact2Relationship || 'Friend'
            }] : [])
          ]
        }) : 
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
                backgroundColor: '#FF7043',
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name="heart" size={40} color="white" />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#2E7D32',
                marginBottom: 8
              }}>{t('app.name')}</Text>
              <Text className="text-gray-600 text-center">
                {isSignUp ? t('auth.createAccountPrompt') : t('auth.welcomeBack')}
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

              {/* Address Section - Only for signup */}
              {isSignUp && (
                <>
                  <View style={{ marginTop: 24 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#2E7D32',
                      marginBottom: 16
                    }}>Address Information</Text>
                    
                    <View style={{ marginBottom: 16 }}>
                      <Text className="text-gray-700 font-medium mb-2">Country *</Text>
                      <Pressable
                        style={{
                          backgroundColor: '#F9FAFB',
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onPress={() => setShowCountryPicker(true)}
                      >
                        <Text style={{
                          color: country ? '#111827' : '#9CA3AF',
                          fontSize: 16
                        }}>
                          {country || 'Select your country'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                      </Pressable>
                    </View>

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">City *</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                        placeholder="Enter your city"
                        value={city}
                        onChangeText={setCity}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Emergency Contacts Section */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#2E7D32',
                      marginBottom: 16
                    }}>Emergency Contacts</Text>
                    
                    {/* Primary Emergency Contact */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 12
                      }}>Primary Contact *</Text>
                      
                      <View style={{ gap: 12 }}>
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Full name"
                          value={emergencyContact1Name}
                          onChangeText={setEmergencyContact1Name}
                          autoCapitalize="words"
                        />
                        
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Phone number"
                          value={emergencyContact1Phone}
                          onChangeText={setEmergencyContact1Phone}
                          keyboardType="phone-pad"
                        />
                        
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Relationship (e.g., Mother, Brother)"
                          value={emergencyContact1Relationship}
                          onChangeText={setEmergencyContact1Relationship}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    {/* Secondary Emergency Contact */}
                    <View>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 12
                      }}>Secondary Contact (Optional)</Text>
                      
                      <View style={{ gap: 12 }}>
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Full name"
                          value={emergencyContact2Name}
                          onChangeText={setEmergencyContact2Name}
                          autoCapitalize="words"
                        />
                        
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Phone number"
                          value={emergencyContact2Phone}
                          onChangeText={setEmergencyContact2Phone}
                          keyboardType="phone-pad"
                        />
                        
                        <TextInput
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                          placeholder="Relationship (e.g., Friend, Doctor)"
                          value={emergencyContact2Relationship}
                          onChangeText={setEmergencyContact2Relationship}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  </View>
                </>
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

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB'
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827'
            }}>Select Country</Text>
            <Pressable onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>
          
          <ScrollView style={{ flex: 1 }}>
            {africanCountries.map((countryName) => (
              <Pressable
                key={countryName}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F3F4F6',
                  backgroundColor: country === countryName ? '#E8F5E8' : 'transparent'
                }}
                onPress={() => {
                  setCountry(countryName);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: country === countryName ? '#2E7D32' : '#111827',
                  fontWeight: country === countryName ? '500' : '400'
                }}>
                  {countryName}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}