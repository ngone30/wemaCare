import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthcareStore, getDoctorById } from '../state/healthcareStore';
import { Appointment } from '../types/healthcare';


interface AppointmentsScreenProps {
  onBack: () => void;
  onStartChat: (doctorId: string) => void;
}

export default function AppointmentsScreen({ onBack, onStartChat }: AppointmentsScreenProps) {
  const { appointments, bookAppointment } = useHealthcareStore();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialize sample appointments if none exist
  React.useEffect(() => {
    if (appointments.length === 0) {
      // Add sample appointments
      const sampleAppointments = [
        {
          id: 'sample1',
          doctorId: '1',
          patientId: 'current-user',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'completed' as const,
          symptoms: 'Regular checkup and health screening',
          notes: 'Patient is in good health, continue current lifestyle'
        },
        {
          id: 'sample2',
          doctorId: '2',
          patientId: 'current-user',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '02:30 PM',
          status: 'confirmed' as const,
          symptoms: 'Follow-up consultation for blood work results',
          notes: 'Bring recent lab results and medication list'
        },
        {
          id: 'sample3',
          doctorId: '3',
          patientId: 'current-user',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '11:00 AM',
          status: 'pending' as const,
          symptoms: 'Dermatology consultation for skin condition',
          notes: 'Initial consultation'
        }
      ];
      
      sampleAppointments.forEach(apt => bookAppointment(apt));
    }
  }, [appointments.length, bookAppointment]);

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

  const filteredAppointments = filterAppointments(appointments)
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  // Debug info
  console.log('Total appointments:', appointments.length);
  console.log('Selected tab:', selectedTab);
  console.log('Filtered appointments:', filteredAppointments.length);

  // Calendar helper functions
  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const renderCalendar = () => {
    const { year, month, monthName } = getCurrentMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = getAppointmentsForDate(dateString);
      const hasAppointments = dayAppointments.length > 0;

      days.push(
        <Pressable
          key={day}
          className={`w-10 h-10 items-center justify-center rounded-lg ${
            hasAppointments ? 'bg-blue-500' : 'bg-gray-100'
          }`}
          onPress={() => {
            if (hasAppointments) {
              Alert.alert(
                `Appointments on ${month + 1}/${day}/${year}`,
                dayAppointments.map(apt => 
                  `• ${apt.time} - ${getDoctorName(apt.doctorId)} (${apt.status})`
                ).join('\n')
              );
            }
          }}
        >
          <Text className={`text-sm font-medium ${
            hasAppointments ? 'text-white' : 'text-gray-700'
          }`}>
            {day}
          </Text>
          {hasAppointments && (
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </Pressable>
      );
    }

    return (
      <View>
        <Text className="text-lg font-semibold text-center mb-4">{monthName}</Text>
        
        {/* Day headers */}
        <View className="flex-row justify-between mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} className="w-10 text-center text-gray-600 font-medium text-sm">
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View className="flex-row flex-wrap">
          {days}
        </View>
        
        <View className="flex-row items-center justify-center mt-4 space-x-4">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-blue-500 rounded mr-2" />
            <Text className="text-sm text-gray-600">Has Appointments</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-sm text-gray-600">Multiple</Text>
          </View>
        </View>
      </View>
    );
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? doctor.name : 'Dr. Johnson';
  };

  const getDoctorInfo = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? { specialty: doctor.specialty, hospital: doctor.hospital } : { specialty: 'Internal Medicine', hospital: 'City General Hospital' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
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
              <Text className="text-2xl font-bold text-gray-900">Appointments</Text>
              <Text className="text-gray-600">
                {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
              </Text>
              {appointments.length === 0 && (
                <Text className="text-orange-600 text-sm mt-1">
                  Sample data loading...
                </Text>
              )}
            </View>
            <Pressable 
              className="p-2 bg-blue-50 rounded-lg"
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            </Pressable>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <Pressable
              className={selectedTab === 'upcoming' ? "flex-1 py-2 px-4 rounded-lg items-center bg-white shadow-sm" : "flex-1 py-2 px-4 rounded-lg items-center"}
              onPress={() => {
                console.log('Switching to upcoming tab');
                setSelectedTab('upcoming');
              }}
            >
              <Text className={selectedTab === 'upcoming' ? "font-medium text-blue-600" : "font-medium text-gray-600"}>
                Upcoming ({getUpcomingCount()})
              </Text>
            </Pressable>
            
            <Pressable
              className={selectedTab === 'past' ? "flex-1 py-2 px-4 rounded-lg items-center bg-white shadow-sm" : "flex-1 py-2 px-4 rounded-lg items-center"}
              onPress={() => {
                console.log('Switching to past tab');
                setSelectedTab('past');
              }}
            >
              <Text className={selectedTab === 'past' ? "font-medium text-blue-600" : "font-medium text-gray-600"}>
                Past ({getPastCount()})
              </Text>
            </Pressable>
            
            <Pressable
              className={selectedTab === 'all' ? "flex-1 py-2 px-4 rounded-lg items-center bg-white shadow-sm" : "flex-1 py-2 px-4 rounded-lg items-center"}
              onPress={() => {
                console.log('Switching to all tab');
                setSelectedTab('all');
              }}
            >
              <Text className={selectedTab === 'all' ? "font-medium text-blue-600" : "font-medium text-gray-600"}>
                All ({appointments.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8 bg-white">
            <View className="bg-gray-100 rounded-full p-6 mb-6">
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
              {selectedTab === 'upcoming' ? 'No Upcoming Appointments' : 
               selectedTab === 'past' ? 'No Past Appointments' : 'No Appointments'}
            </Text>
            <Text className="text-gray-600 text-center leading-relaxed">
              {selectedTab === 'upcoming' 
                ? 'Book an appointment with a healthcare provider to get started.'
                : selectedTab === 'past'
                ? 'Your completed and cancelled appointments will appear here.'
                : 'Your appointments will appear here when you book them.'
              }
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-4 space-y-4 bg-white">
              {filteredAppointments.map((appointment) => {
                const doctorInfo = getDoctorInfo(appointment.doctorId);
                const statusColors = getStatusColor(appointment.status);
                const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
                const isUpcoming = appointmentDate >= now && (appointment.status === 'confirmed' || appointment.status === 'pending');

                return (
                  <View
                    key={appointment.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">
                          {getDoctorName(appointment.doctorId)}
                        </Text>
                        <Text className="text-blue-600 font-medium">
                          {doctorInfo.specialty}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {doctorInfo.hospital}
                        </Text>
                      </View>
                      
                      <View className={`px-3 py-1 rounded-full border ${statusColors.bg} ${statusColors.border}`}>
                        <Text className={`text-sm font-medium ${statusColors.text}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    {/* Date and Time */}
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-700 ml-2 font-medium">
                        {formatDate(appointment.date)}
                      </Text>
                      <Ionicons name="time-outline" size={20} color="#6B7280" className="ml-4" />
                      <Text className="text-gray-700 ml-2 font-medium">
                        {formatTime(appointment.time)}
                      </Text>
                    </View>

                    {/* Symptoms */}
                    {appointment.symptoms && (
                      <View className="mb-3">
                        <Text className="text-gray-600 text-sm mb-1">Symptoms discussed:</Text>
                        <Text className="text-gray-800 text-sm leading-relaxed">
                          {appointment.symptoms}
                        </Text>
                      </View>
                    )}

                    {/* Notes */}
                    {appointment.notes && (
                      <View className="mb-3">
                        <Text className="text-gray-600 text-sm mb-1">Notes:</Text>
                        <Text className="text-gray-800 text-sm leading-relaxed">
                          {appointment.notes}
                        </Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View className="flex-row space-x-3 pt-3 border-t border-gray-100">
                      <Pressable
                        className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                        onPress={() => onStartChat(appointment.doctorId)}
                      >
                        <Text className="text-white font-semibold">Message Doctor</Text>
                      </Pressable>
                      
                      {isUpcoming && (
                        <Pressable className="bg-gray-100 rounded-lg px-4 py-3 items-center">
                          <Ionicons name="calendar-outline" size={20} color="#374151" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Calendar Modal */}
        <Modal
          visible={showCalendar}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              {/* Calendar Header */}
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">
                    Appointment Calendar
                  </Text>
                  <Pressable 
                    className="p-2 -mr-2"
                    onPress={() => setShowCalendar(false)}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </Pressable>
                </View>
                <Text className="text-gray-600 mt-1">
                  Tap on highlighted dates to view appointments
                </Text>
              </View>

              {/* Calendar Content */}
              <ScrollView className="flex-1 px-6 py-6">
                {renderCalendar()}
                
                {/* Upcoming Appointments List */}
                <View className="mt-8">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Next 7 Days
                  </Text>
                  
                  {appointments
                    .filter(apt => {
                      const aptDate = new Date(apt.date);
                      const today = new Date();
                      const nextWeek = new Date();
                      nextWeek.setDate(today.getDate() + 7);
                      return aptDate >= today && aptDate <= nextWeek;
                    })
                    .slice(0, 3)
                    .map((appointment) => (
                      <View key={appointment.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text className="text-gray-900 font-semibold">
                              {getDoctorName(appointment.doctorId)}
                            </Text>
                            <Text className="text-gray-600 mt-1">
                              {new Date(appointment.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {appointment.time}
                            </Text>
                            <Text className="text-gray-700 text-sm mt-1">
                              {appointment.symptoms}
                            </Text>
                          </View>
                          <View className={`px-2 py-1 rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              appointment.status === 'confirmed' ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    const today = new Date();
                    const nextWeek = new Date();
                    nextWeek.setDate(today.getDate() + 7);
                    return aptDate >= today && aptDate <= nextWeek;
                  }).length === 0 && (
                    <Text className="text-gray-500 text-center py-4">
                      No appointments in the next 7 days
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}