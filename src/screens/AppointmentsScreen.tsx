import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthcareStore, getDoctorById } from '../state/healthcareStore';
import { Appointment } from '../types/healthcare';
import AppHeader from '../components/AppHeader';

interface AppointmentsScreenProps {
  onBack: () => void;
  onStartChat: (doctorId: string) => void;
}

export default function AppointmentsScreen({ onBack, onStartChat }: AppointmentsScreenProps) {
  const { appointments, bookAppointment } = useHealthcareStore();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(false);

  console.log('AppointmentsScreen rendered');

  // Initialize sample appointments if none exist
  useEffect(() => {
    if (appointments.length === 0) {
      console.log('Adding sample appointments');
      const sampleAppointments = [
        {
          id: 'sample1',
          doctorId: '1',
          patientId: 'current-user',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'completed' as const,
          symptoms: 'Regular checkup and health screening',
          notes: 'Patient is in good health'
        },
        {
          id: 'sample2',
          doctorId: '2',
          patientId: 'current-user',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '02:30 PM',
          status: 'confirmed' as const,
          symptoms: 'Follow-up consultation',
          notes: 'Bring lab results'
        }
      ];
      
      sampleAppointments.forEach(apt => bookAppointment(apt));
    }
  }, []);

  const now = new Date();
  
  const filterAppointments = (appointments: Appointment[]) => {
    switch (selectedTab) {
      case 'upcoming':
        return appointments.filter(apt => {
          const aptDate = new Date(`${apt.date} ${apt.time}`);
          return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending');
        });
      case 'past':
        return appointments.filter(apt => {
          const aptDate = new Date(`${apt.date} ${apt.time}`);
          return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
        });
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments(appointments);

  const getDoctorName = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? doctor.name : 'Dr. Johnson';
  };

  const getUpcomingCount = () => {
    return appointments.filter(apt => {
      const aptDate = new Date(`${apt.date} ${apt.time}`);
      return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending');
    }).length;
  };

  const getPastCount = () => {
    return appointments.filter(apt => {
      const aptDate = new Date(`${apt.date} ${apt.time}`);
      return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
    }).length;
  };

  const handleBackPress = () => {
    console.log('Back button pressed - navigating to home');
    onBack();
  };

  const handleCalendarPress = () => {
    console.log('Calendar button pressed');
    setShowCalendar(true);
  };

  const handleTabPress = (tab: 'upcoming' | 'past' | 'all') => {
    console.log(`Switching to ${tab} tab`);
    setSelectedTab(tab);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <AppHeader 
        title="Appointments"
        showBackButton
        onBack={handleBackPress}
        rightComponent={
          <Pressable
            style={{ padding: 8, backgroundColor: '#EBF8FF', borderRadius: 8 }}
            onPress={handleCalendarPress}
          >
            <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
          </Pressable>
        }
      />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Appointment count */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
          <Text style={{ color: '#6B7280' }}>
            {appointments.length} total appointments
          </Text>
        </View>
        
        {/* Simplified placeholder for removed header code */}
        <View style={{ padding: 8, backgroundColor: '#EBF8FF', borderRadius: 8, opacity: 0 }}>
          <Pressable
            style={{ padding: 8, backgroundColor: '#EBF8FF', borderRadius: 8 }}
            onPress={handleCalendarPress}
          >
            <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
          </Pressable>
        </View>

        {/* Debug Test Button */}
        <View style={{ padding: 16, backgroundColor: '#FEF3C7' }}>
          <Pressable
            style={{ backgroundColor: '#F59E0B', padding: 12, borderRadius: 8 }}
            onPress={() => {
              console.log('TEST BUTTON PRESSED!');
              Alert.alert('Success', 'Touch events are working!');
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              🧪 Test Touch Events - Tap Me!
            </Text>
          </Pressable>
        </View>

        {/* Tab Navigation */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
          <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 12 }}>
            Current tab: {selectedTab} | Showing: {filteredAppointments.length} appointments
          </Text>
          
          <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 }}>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: selectedTab === 'upcoming' ? 'white' : 'transparent'
              }}
              onPress={() => handleTabPress('upcoming')}
            >
              <Text style={{
                fontWeight: 'bold',
                color: selectedTab === 'upcoming' ? '#2563EB' : '#6B7280'
              }}>
                Upcoming ({getUpcomingCount()})
              </Text>
            </Pressable>
            
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: selectedTab === 'past' ? 'white' : 'transparent'
              }}
              onPress={() => handleTabPress('past')}
            >
              <Text style={{
                fontWeight: 'bold',
                color: selectedTab === 'past' ? '#2563EB' : '#6B7280'
              }}>
                Past ({getPastCount()})
              </Text>
            </Pressable>
            
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: selectedTab === 'all' ? 'white' : 'transparent'
              }}
              onPress={() => handleTabPress('all')}
            >
              <Text style={{
                fontWeight: 'bold',
                color: selectedTab === 'all' ? '#2563EB' : '#6B7280'
              }}>
                All ({appointments.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }}>
          {filteredAppointments.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 16 }}>
                {selectedTab === 'upcoming' ? 'No Upcoming Appointments' : 
                 selectedTab === 'past' ? 'No Past Appointments' : 'No Appointments'}
              </Text>
              <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
                Book an appointment with a healthcare provider to get started.
              </Text>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {filteredAppointments.map((appointment) => (
                <View
                  key={appointment.id}
                  style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                        {getDoctorName(appointment.doctorId)}
                      </Text>
                      <Text style={{ color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
                        Internal Medicine
                      </Text>
                    </View>
                    
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 16,
                      backgroundColor: appointment.status === 'confirmed' ? '#DCFCE7' : 
                                      appointment.status === 'completed' ? '#DBEAFE' : '#FEF3C7'
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: appointment.status === 'confirmed' ? '#166534' : 
                               appointment.status === 'completed' ? '#1E40AF' : '#92400E'
                      }}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: '#374151', marginBottom: 8 }}>
                    📅 {appointment.date} at {appointment.time}
                  </Text>
                  
                  <Text style={{ color: '#6B7280', marginBottom: 12 }}>
                    {appointment.symptoms}
                  </Text>
                  
                  <Pressable
                    style={{ backgroundColor: '#3B82F6', borderRadius: 8, padding: 10 }}
                    onPress={() => onStartChat(appointment.doctorId)}
                  >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                      Message Doctor
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Simple Calendar Modal */}
        {showCalendar && (
          <Modal
            visible={showCalendar}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Calendar</Text>
                  <Pressable
                    style={{ padding: 8 }}
                    onPress={() => setShowCalendar(false)}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </Pressable>
                </View>
              </View>
              
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <Ionicons name="calendar" size={100} color="#3B82F6" />
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
                  Calendar View
                </Text>
                <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
                  Full calendar functionality coming soon!
                </Text>
                
                <Pressable
                  style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, marginTop: 24 }}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Close Calendar</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}