import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useHealthcareStore } from '../state/healthcareStore';
import { RecommendedDoctor, SymptomInput } from '../types/healthcare';

interface HomeScreenProps {
  onStartSymptomInput: () => void;
  onViewProfile: () => void;
  onViewAppointments: () => void;
  onViewMessages: () => void;
  onSelectDoctor: (doctor: RecommendedDoctor) => void;
}

export default function HomeScreen({ 
  onStartSymptomInput, 
  onViewProfile, 
  onViewAppointments, 
  onViewMessages,
  onSelectDoctor 
}: HomeScreenProps) {
  const { user, logout } = useAuthStore();
  const { recommendations, appointments, conversations } = useHealthcareStore();
  const [showQR, setShowQR] = useState(false);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .slice(0, 2);

  const recentConversations = conversations
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const generateMedicalCardData = () => {
    if (!user) return '';
    
    // Include past diagnoses from completed appointments
    const pastDiagnoses = appointments
      .filter(apt => apt.status === 'completed')
      .map(apt => ({
        date: apt.date,
        symptoms: apt.symptoms,
        notes: apt.notes,
        doctorId: apt.doctorId
      }));

    return JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.medicalProfile.dateOfBirth,
      bloodType: user.medicalProfile.bloodType,
      allergies: user.medicalProfile.allergies,
      medications: user.medicalProfile.medications,
      medicalConditions: user.medicalProfile.medicalConditions,
      emergencyContact: user.medicalProfile.emergencyContact,
      insurance: user.medicalProfile.insurance,
      pastDiagnoses,
      recentAppointments: appointments.slice(0, 3),
      timestamp: new Date().toISOString(),
      type: 'healthai_medical_card',
      version: '1.0'
    });
  };

  const shareMedicalCard = async () => {
    if (!user) return;
    
    try {
      const pastDiagnoses = appointments
        .filter(apt => apt.status === 'completed')
        .map(apt => `${apt.date}: ${apt.symptoms}`)
        .slice(0, 3);

      const profileData = `
🏥 HealthAI Medical Card
👤 Name: ${user.name}
📧 Email: ${user.email}
🎂 DOB: ${user.medicalProfile.dateOfBirth || 'Not provided'}
🩸 Blood Type: ${user.medicalProfile.bloodType || 'Not provided'}
⚠️ Allergies: ${user.medicalProfile.allergies.join(', ') || 'None listed'}
💊 Medications: ${user.medicalProfile.medications.join(', ') || 'None listed'}
🏥 Conditions: ${user.medicalProfile.medicalConditions.join(', ') || 'None listed'}
📞 Emergency Contact: ${user.medicalProfile.emergencyContact.name} (${user.medicalProfile.emergencyContact.phone})
🏥 Insurance: ${user.medicalProfile.insurance.provider || 'Not provided'}

📋 Recent Diagnoses:
${pastDiagnoses.length > 0 ? pastDiagnoses.join('\n') : 'No past diagnoses recorded'}

🔒 QR Code Data: ${generateMedicalCardData().substring(0, 50)}...

Generated: ${new Date().toLocaleString()}
      `.trim();

      await Share.share({
        message: profileData,
        title: 'Medical Card - HealthAI'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share medical card');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Hello, {user?.name?.split(' ')[0] || 'User'}!
              </Text>
              <Text className="text-gray-600 mt-1">
                How are you feeling today?
              </Text>
            </View>
            
            <Pressable
              className="bg-gray-100 rounded-full p-3"
              onPress={onViewProfile}
            >
              <Ionicons name="person-outline" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Medical QR Code */}
          <View className="px-6 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Medical QR Code
            </Text>
            
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <View className="items-center">
                {showQR ? (
                  <View className="bg-white p-6 rounded-xl shadow-lg mb-4 border border-gray-200">
                    <View className="w-48 h-48 bg-gray-900 rounded-lg items-center justify-center mb-3">
                      <Ionicons name="qr-code" size={120} color="white" />
                    </View>
                    <Text className="text-sm text-gray-700 text-center font-medium">
                      Medical Card QR Code
                    </Text>
                    <Text className="text-xs text-gray-500 text-center mt-1">
                      Scan to access medical information
                    </Text>
                  </View>
                ) : (
                  <View className="bg-white p-6 rounded-xl shadow-sm mb-4 items-center justify-center" style={{ width: 180, height: 180 }}>
                    <Ionicons name="qr-code-outline" size={64} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-2 text-center">
                      Tap to show QR code
                    </Text>
                  </View>
                )}

                <View className="flex-row space-x-3">
                  <Pressable
                    className="bg-blue-500 rounded-xl px-4 py-2"
                    onPress={() => setShowQR(!showQR)}
                  >
                    <Text className="text-white font-medium">
                      {showQR ? 'Hide QR' : 'Show QR'}
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    className="bg-green-500 rounded-xl px-4 py-2"
                    onPress={shareMedicalCard}
                  >
                    <Text className="text-white font-medium">Share Card</Text>
                  </Pressable>
                </View>
                
                <Text className="text-blue-700 text-sm text-center mt-3 px-2">
                  Let doctors scan this QR code for instant access to your medical information
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 py-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </Text>
            
            <View className="flex-row space-x-4">
              <Pressable
                className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
                onPress={onStartSymptomInput}
              >
                <View className="bg-white/20 rounded-full p-3 mb-2">
                  <Ionicons name="medical-outline" size={32} color="white" />
                </View>
                <Text className="text-white font-semibold text-center">
                  Check Symptoms
                </Text>
                <Text className="text-blue-100 text-sm text-center mt-1">
                  Get AI recommendations
                </Text>
              </Pressable>
              
              <View className="flex-1 space-y-4">
                <Pressable
                  className="bg-green-500 rounded-xl p-3 items-center"
                  onPress={onViewAppointments}
                >
                  <Ionicons name="calendar-outline" size={24} color="white" />
                  <Text className="text-white font-medium text-sm mt-1">
                    Appointments
                  </Text>
                </Pressable>
                
                <Pressable
                  className="bg-purple-500 rounded-xl p-3 items-center"
                  onPress={onViewMessages}
                >
                  <Ionicons name="chatbubbles-outline" size={24} color="white" />
                  <Text className="text-white font-medium text-sm mt-1">
                    Messages
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <View className="px-6 py-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  Upcoming Appointments
                </Text>
                <Pressable onPress={onViewAppointments}>
                  <Text className="text-blue-500 font-medium">View All</Text>
                </Pressable>
              </View>
              
              <View className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <View key={appointment.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">
                          Dr. Johnson {/* In a real app, you'd lookup the doctor name */}
                        </Text>
                        <Text className="text-gray-600 mt-1">
                          {appointment.date} at {appointment.time}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <View className={`px-2 py-1 rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100' 
                              : 'bg-yellow-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              appointment.status === 'confirmed' 
                                ? 'text-green-800' 
                                : 'text-yellow-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <Pressable className="p-2">
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent Conversations */}
          {recentConversations.length > 0 && (
            <View className="px-6 py-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  Recent Messages
                </Text>
                <Pressable onPress={onViewMessages}>
                  <Text className="text-blue-500 font-medium">View All</Text>
                </Pressable>
              </View>
              
              <View className="space-y-3">
                {recentConversations.map((conversation) => (
                  <View key={conversation.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">
                          Dr. Johnson {/* In a real app, you'd lookup the doctor name */}
                        </Text>
                        <Text className="text-gray-600 mt-1 leading-relaxed" numberOfLines={2}>
                          {conversation.lastMessage.content}
                        </Text>
                      </View>
                      
                      <View className="items-end ml-3">
                        <Text className="text-gray-500 text-sm">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </Text>
                        {conversation.unreadCount > 0 && (
                          <View className="bg-blue-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center mt-1">
                            <Text className="text-white text-xs font-medium">
                              {conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* For Healthcare Providers */}
          <View className="px-6 py-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              For Healthcare Providers
            </Text>
            
            <View className="bg-green-50 border border-green-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <View className="bg-green-500 rounded-full p-2 mr-3">
                  <Ionicons name="medical-outline" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-green-900 font-semibold mb-2">
                    Scan Patient QR Code
                  </Text>
                  <Text className="text-green-800 leading-relaxed">
                    Healthcare providers can scan the patient's QR code above to instantly access their medical history, current medications, allergies, and recent appointments.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Health Tips */}
          <View className="px-6 py-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Health Tips
            </Text>
            
            <View className="bg-blue-500 rounded-xl p-6">
              <View className="flex-row items-start">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons name="bulb-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg mb-2">
                    Stay Hydrated
                  </Text>
                  <Text className="text-blue-100 leading-relaxed">
                    Drinking enough water helps maintain your body temperature, lubricate joints, and transport nutrients.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Recommendations */}
          {recommendations && (
            <View className="px-6 py-4">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Your Recent Recommendations
              </Text>
              
              <View className="space-y-3">
                {recommendations.doctors.slice(0, 2).map((doctor) => (
                  <Pressable
                    key={doctor.id}
                    className="bg-white rounded-xl p-4 shadow-sm"
                    onPress={() => onSelectDoctor(doctor)}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">
                          {doctor.name}
                        </Text>
                        <Text className="text-blue-600 font-medium">
                          {doctor.specialty}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <Ionicons name="star" size={16} color="#F59E0B" />
                          <Text className="text-gray-600 ml-1">
                            {doctor.rating} • {doctor.matchScore}% match
                          </Text>
                        </View>
                      </View>
                      
                      <Pressable className="p-2">
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Logout */}
          <View className="px-6 py-6">
            <Pressable
              className="bg-red-50 border border-red-200 rounded-xl py-4 items-center"
              onPress={logout}
            >
              <Text className="text-red-600 font-semibold">Sign Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}