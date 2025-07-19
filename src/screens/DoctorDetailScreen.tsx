import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RecommendedDoctor, Appointment, AppointmentSlot, Message } from '../types/healthcare';
import { useHealthcareStore } from '../state/healthcareStore';
import { useAuthStore } from '../state/authStore';
import { cn } from '../utils/cn';

interface DoctorDetailScreenProps {
  doctor: RecommendedDoctor;
  onBack: () => void;
  onStartChat: (doctorId: string) => void;
}

export default function DoctorDetailScreen({ doctor, onBack, onStartChat }: DoctorDetailScreenProps) {
  const { user } = useAuthStore();
  const { bookAppointment, sendMessage, symptoms, currentAnalysis } = useHealthcareStore();
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const handleBookAppointment = () => {
    if (!selectedSlot || !user) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      doctorId: doctor.id,
      patientId: user.id,
      date: selectedSlot.date,
      time: selectedSlot.time,
      status: 'pending',
      notes: appointmentNotes,
      symptoms: symptoms.map(s => s.content).join('; ')
    };

    bookAppointment(appointment);
    
    // Send initial message to doctor
    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: doctor.id,
      content: `Hi Dr. ${doctor.name}, I've booked an appointment for ${selectedSlot.date} at ${selectedSlot.time}. Looking forward to discussing my health concerns.`,
      timestamp: new Date().toISOString(),
      type: 'appointment',
      appointmentId: appointment.id
    };

    sendMessage(message);
    
    setShowBookingModal(false);
    Alert.alert(
      'Appointment Booked!',
      `Your appointment with Dr. ${doctor.name} has been scheduled for ${selectedSlot.date} at ${selectedSlot.time}.`,
      [
        {
          text: 'Start Chat',
          onPress: () => onStartChat(doctor.id)
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              className="mr-4 p-2 -ml-2"
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">{doctor.name}</Text>
              <Text className="text-blue-600 font-semibold">{doctor.specialty}</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Match Score */}
          <View className="px-6 py-4 bg-green-50 border-b border-green-100">
            <View className="flex-row items-center justify-center">
              <View className="bg-green-500 rounded-full p-3 mr-3">
                <Ionicons name="checkmark" size={24} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-green-900">
                  {doctor.matchScore}% Match
                </Text>
                <Text className="text-green-700">
                  Highly recommended for your symptoms
                </Text>
              </View>
            </View>
          </View>

          {/* Doctor Info */}
          <View className="px-6 py-6">
            <View className="space-y-4">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-gray-900 ml-2 font-medium">
                  {doctor.rating}/5.0 Rating
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="school-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-2">
                  {doctor.experience} years of experience
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="business-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-2 flex-1">
                  {doctor.hospital}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-2 flex-1">
                  {doctor.address}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="language-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-2">
                  Languages: {doctor.languages.join(', ')}
                </Text>
              </View>
            </View>

            {/* Match Reason */}
            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
              <Text className="text-blue-900 font-semibold mb-2">
                Why Dr. {doctor.name}?
              </Text>
              <Text className="text-blue-800 leading-relaxed">
                {doctor.matchReason}
              </Text>
            </View>
          </View>

          {/* Available Appointments */}
          {doctor.availableSlots.length > 0 && (
            <View className="px-6 py-6 border-t border-gray-200">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Available Appointments
              </Text>
              
              <View className="space-y-3">
                {doctor.availableSlots.map((slot) => (
                  <Pressable
                    key={slot.id}
                    className={cn(
                      "border rounded-xl p-4 flex-row justify-between items-center",
                      selectedSlot?.id === slot.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    )}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <View>
                      <Text className="text-gray-900 font-semibold">
                        {formatDate(slot.date)}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        {slot.time}
                      </Text>
                    </View>
                    
                    {selectedSlot?.id === slot.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="px-6 py-6 space-y-3">
            <Pressable
              className={cn(
                "rounded-xl py-4 items-center",
                selectedSlot ? "bg-blue-500" : "bg-gray-300"
              )}
              onPress={() => {
                if (selectedSlot) {
                  setShowBookingModal(true);
                } else {
                  Alert.alert('Select Time', 'Please select an appointment time first');
                }
              }}
              disabled={!selectedSlot}
            >
              <Text className="text-white font-semibold text-lg">
                Book Appointment
              </Text>
            </Pressable>

            <Pressable
              className="border border-blue-500 rounded-xl py-4 items-center"
              onPress={() => onStartChat(doctor.id)}
            >
              <Text className="text-blue-500 font-semibold text-lg">
                Send Message
              </Text>
            </Pressable>

            <Pressable
              className="border border-gray-300 rounded-xl py-4 items-center"
              onPress={() => {
                const phone = doctor.phone.replace(/\D/g, '');
                Alert.alert(
                  'Call Doctor',
                  `Call ${doctor.name} at ${doctor.phone}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => {
                      // In a real app, this would open the phone dialer
                      Alert.alert('Calling', `Calling ${doctor.phone}...`);
                    }}
                  ]
                );
              }}
            >
              <Text className="text-gray-700 font-semibold text-lg">
                Call Doctor
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Booking Confirmation Modal */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">
                    Confirm Appointment
                  </Text>
                  <Pressable onPress={() => setShowBookingModal(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              <ScrollView className="flex-1 px-6 py-6">
                <View className="space-y-6">
                  {/* Appointment Details */}
                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="font-semibold text-gray-900 mb-2">
                      Appointment Details
                    </Text>
                    <Text className="text-gray-700">
                      Doctor: {doctor.name}
                    </Text>
                    <Text className="text-gray-700">
                      Date: {selectedSlot ? formatDate(selectedSlot.date) : ''}
                    </Text>
                    <Text className="text-gray-700">
                      Time: {selectedSlot?.time}
                    </Text>
                    <Text className="text-gray-700">
                      Location: {doctor.hospital}
                    </Text>
                  </View>

                  {/* Symptoms Summary */}
                  <View className="bg-blue-50 rounded-xl p-4">
                    <Text className="font-semibold text-blue-900 mb-2">
                      Your Symptoms (will be shared with doctor)
                    </Text>
                    <Text className="text-blue-800">
                      {symptoms.map(s => s.content).join('; ')}
                    </Text>
                  </View>

                  {/* Additional Notes */}
                  <View>
                    <Text className="font-semibold text-gray-900 mb-2">
                      Additional Notes (Optional)
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 h-24"
                      placeholder="Any additional information for the doctor..."
                      value={appointmentNotes}
                      onChangeText={setAppointmentNotes}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </ScrollView>

              <View className="px-6 py-4 border-t border-gray-200">
                <Pressable
                  className="bg-blue-500 rounded-xl py-4 items-center"
                  onPress={handleBookAppointment}
                >
                  <Text className="text-white font-semibold text-lg">
                    Confirm Booking
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}