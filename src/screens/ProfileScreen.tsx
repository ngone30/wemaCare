import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import QRCode from 'react-native-qrcode-svg'; // Package not available
import { useAuthStore } from '../state/authStore';
import { cn } from '../utils/cn';
import AppHeader from '../components/AppHeader';

interface ProfileScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
}

export default function ProfileScreen({ onBack, onEditProfile }: ProfileScreenProps) {
  const { user, logout } = useAuthStore();
  const [showQR, setShowQR] = useState(false);

  if (!user) {
    return null;
  }

  const generateMedicalCardData = () => {
    return JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      medicalProfile: user.medicalProfile,
      timestamp: new Date().toISOString()
    });
  };

  const shareProfile = async () => {
    try {
      const profileData = `
WemaCARE Medical Card
Name: ${user.fullName || user.name}
DOB: ${user.medicalProfile.dateOfBirth || 'Not provided'}
Blood Type: ${user.medicalProfile.bloodType || 'Not provided'}
Address: ${user.address ? `${user.address.city}, ${user.address.country}` : 'Not provided'}
Allergies: ${user.medicalProfile.allergies.join(', ') || 'None listed'}
Medications: ${user.medicalProfile.medications.join(', ') || 'None listed'}
Emergency Contact 1: ${user.medicalProfile.emergencyContact.name} (${user.medicalProfile.emergencyContact.phone}) - ${user.medicalProfile.emergencyContact.relationship}
${user.medicalProfile.emergencyContact2 ? `Emergency Contact 2: ${user.medicalProfile.emergencyContact2.name} (${user.medicalProfile.emergencyContact2.phone}) - ${user.medicalProfile.emergencyContact2.relationship}` : ''}
      `.trim();

      await Share.share({
        message: profileData,
        title: 'Medical Profile'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader 
        title="Medical Profile"
        showBackButton
        onBack={onBack}
        rightComponent={
          <Pressable
            style={{ padding: 8 }}
            onPress={onEditProfile}
          >
            <Ionicons name="create-outline" size={24} color="#3B82F6" />
          </Pressable>
        }
      />
      <View className="flex-1">
        {/* Subtitle */}
        <View className="px-6 py-2 border-b border-gray-200">
          <Text className="text-gray-600">Your health information</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* QR Code Section */}
          <View style={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            backgroundColor: '#E8F5E8',
            borderBottomWidth: 1,
            borderBottomColor: '#C8E6C9'
          }}>
            <View className="items-center">
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#2E7D32',
                marginBottom: 16
              }}>
                Medical Card QR Code
              </Text>
              
              {showQR ? (
                <View className="bg-white p-6 rounded-xl shadow-sm mb-4 items-center justify-center" style={{ width: 212, height: 212 }}>
                  <View className="w-48 h-48 bg-gray-900 rounded-lg items-center justify-center">
                    <Ionicons name="qr-code" size={120} color="white" />
                  </View>
                  <Text className="text-xs text-gray-500 mt-2 text-center">
                    QR Code Generated
                  </Text>
                </View>
              ) : (
                <View className="bg-white p-8 rounded-xl shadow-sm mb-4 items-center justify-center" style={{ width: 212, height: 212 }}>
                  <Ionicons name="qr-code-outline" size={64} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2 text-center">
                    Tap to generate QR code
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  style={{
                    backgroundColor: '#2E7D32',
                    borderRadius: 12,
                    paddingHorizontal: 24,
                    paddingVertical: 12
                  }}
                  onPress={() => setShowQR(!showQR)}
                >
                  <Text className="text-white font-semibold">
                    {showQR ? 'Hide QR' : 'Show QR'}
                  </Text>
                </Pressable>
                
                <Pressable
                  style={{
                    backgroundColor: '#FBC02D',
                    borderRadius: 12,
                    paddingHorizontal: 24,
                    paddingVertical: 12
                  }}
                  onPress={shareProfile}
                >
                  <Text className="text-white font-semibold">Share Profile</Text>
                </Pressable>
              </View>
              
              <Text style={{
                color: '#2E7D32',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 12
              }}>
                Share this QR code with healthcare providers for instant access to your medical information
              </Text>
            </View>
          </View>

          {/* Basic Information */}
          <View className="px-6 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Basic Information
            </Text>
            
            <View className="space-y-4">
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600 text-sm">Full Name</Text>
                <Text className="text-gray-900 font-medium text-lg">{user.name}</Text>
              </View>
              
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600 text-sm">Email</Text>
                <Text className="text-gray-900 font-medium">{user.email}</Text>
              </View>
              
              <View className="flex-row space-x-3">
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">Date of Birth</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.medicalProfile.dateOfBirth || 'Not provided'}
                  </Text>
                </View>
                
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">Gender</Text>
                  <Text className="text-gray-900 font-medium capitalize">
                    {user.medicalProfile.gender}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row space-x-3">
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">Height</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.medicalProfile.height || 'Not provided'}
                  </Text>
                </View>
                
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">Weight</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.medicalProfile.weight ? `${user.medicalProfile.weight} lbs` : 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600 text-sm">Blood Type</Text>
                <Text className="text-gray-900 font-medium">
                  {user.medicalProfile.bloodType || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>

          {/* Address Information */}
          {user.address && (
            <View className="px-6 py-6 border-t border-gray-200">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Address Information
              </Text>
              
              <View className="space-y-4">
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">Country</Text>
                  <Text className="text-gray-900 font-medium text-lg">{user.address.country}</Text>
                </View>
                
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-600 text-sm">City</Text>
                  <Text className="text-gray-900 font-medium text-lg">{user.address.city}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Medical History */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Medical History
            </Text>
            
            <View className="space-y-4">
              <View className="bg-red-50 rounded-xl p-4">
                <Text className="text-red-800 font-medium mb-2">Allergies</Text>
                {user.medicalProfile.allergies.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {user.medicalProfile.allergies.map((allergy, index) => (
                      <View key={index} className="bg-red-200 rounded-lg px-3 py-1 mr-2 mb-2">
                        <Text className="text-red-800">{allergy}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-red-600">No allergies listed</Text>
                )}
              </View>
              
              <View style={{
                backgroundColor: '#E8F5E8',
                borderRadius: 12,
                padding: 16
              }}>
                <Text style={{
                  color: '#2E7D32',
                  fontWeight: '500',
                  marginBottom: 8
                }}>Current Medications</Text>
                {user.medicalProfile.medications.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {user.medicalProfile.medications.map((medication, index) => (
                      <View key={index} style={{
                        backgroundColor: '#C8E6C9',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        marginRight: 8,
                        marginBottom: 8
                      }}>
                        <Text style={{ color: '#2E7D32' }}>{medication}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: '#2E7D32' }}>No medications listed</Text>
                )}
              </View>
              
              <View className="bg-orange-50 rounded-xl p-4">
                <Text className="text-orange-800 font-medium mb-2">Medical Conditions</Text>
                {user.medicalProfile.medicalConditions.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {user.medicalProfile.medicalConditions.map((condition, index) => (
                      <View key={index} className="bg-orange-200 rounded-lg px-3 py-1 mr-2 mb-2">
                        <Text className="text-orange-800">{condition}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-orange-600">No conditions listed</Text>
                )}
              </View>
            </View>
          </View>

          {/* Emergency Contacts */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Emergency Contacts
            </Text>
            
            {/* Primary Emergency Contact */}
            <View className="mb-4">
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#2E7D32',
                marginBottom: 12
              }}>Primary Contact</Text>
              
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="space-y-2">
                  <View>
                    <Text className="text-gray-600 text-sm">Name</Text>
                    <Text className="text-gray-900 font-medium">
                      {user.medicalProfile.emergencyContact.name || 'Not provided'}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-600 text-sm">Phone</Text>
                    <Text className="text-gray-900 font-medium">
                      {user.medicalProfile.emergencyContact.phone || 'Not provided'}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-600 text-sm">Relationship</Text>
                    <Text className="text-gray-900 font-medium">
                      {user.medicalProfile.emergencyContact.relationship || 'Not provided'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Secondary Emergency Contact */}
            {user.medicalProfile.emergencyContact2 && (
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FBC02D',
                  marginBottom: 12
                }}>Secondary Contact</Text>
                
                <View className="bg-gray-50 rounded-xl p-4">
                  <View className="space-y-2">
                    <View>
                      <Text className="text-gray-600 text-sm">Name</Text>
                      <Text className="text-gray-900 font-medium">
                        {user.medicalProfile.emergencyContact2.name}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-gray-600 text-sm">Phone</Text>
                      <Text className="text-gray-900 font-medium">
                        {user.medicalProfile.emergencyContact2.phone}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-gray-600 text-sm">Relationship</Text>
                      <Text className="text-gray-900 font-medium">
                        {user.medicalProfile.emergencyContact2.relationship}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Insurance Information */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Insurance Information
            </Text>
            
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="space-y-2">
                <View>
                  <Text className="text-gray-600 text-sm">Provider</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.medicalProfile.insurance.provider || 'Not provided'}
                  </Text>
                </View>
                
                <View>
                  <Text className="text-gray-600 text-sm">Policy Number</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.medicalProfile.insurance.policyNumber || 'Not provided'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lifestyle Factors */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Lifestyle Factors
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600">Smoking Status</Text>
                <Text className="text-gray-900 font-medium capitalize">
                  {user.medicalProfile.smokingStatus}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600">Exercise Frequency</Text>
                <Text className="text-gray-900 font-medium capitalize">
                  {user.medicalProfile.exerciseFrequency}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-600">Alcohol Consumption</Text>
                <Text className="text-gray-900 font-medium capitalize">
                  {user.medicalProfile.alcoholConsumption}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="px-6 py-6 space-y-3">
            <Pressable
              style={{
                backgroundColor: '#2E7D32',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center'
              }}
              onPress={onEditProfile}
            >
              <Text className="text-white font-semibold text-lg">
                Edit Profile
              </Text>
            </Pressable>
            
            <Pressable
              className="bg-red-50 border border-red-200 rounded-xl py-4 items-center"
              onPress={logout}
            >
              <Text className="text-red-600 font-semibold">Sign Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}