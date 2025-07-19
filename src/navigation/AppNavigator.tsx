import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/authStore';
import { RecommendedDoctor, SymptomInput } from '../types/healthcare';

// Screens
import AuthScreen from '../screens/AuthScreen';
import MedicalProfileScreen from '../screens/MedicalProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import SymptomInputScreen from '../screens/SymptomInputScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import DoctorDetailScreen from '../screens/DoctorDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';

export default function AppNavigator() {
  const { isAuthenticated, user, ensureMedicalProfile } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ensure medical profile exists for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      ensureMedicalProfile();
    }
    setIsInitialized(true);
  }, [isAuthenticated, user, ensureMedicalProfile]);

  const [showMedicalProfile, setShowMedicalProfile] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDoctor, setSelectedDoctor] = useState<RecommendedDoctor | null>(null);
  const [chatDoctorId, setChatDoctorId] = useState<string | null>(null);
  const [symptomsData, setSymptomsData] = useState<{
    symptoms: SymptomInput[];
    analysis: string;
  } | null>(null);

  // Check if user needs to complete medical profile
  const needsMedicalProfile = user && (
    !user.medicalProfile || 
    !user.medicalProfile.dateOfBirth || 
    !user.medicalProfile.height || 
    !user.medicalProfile.weight
  );

  if (!isInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (needsMedicalProfile || showMedicalProfile) {
    return (
      <MedicalProfileScreen 
        onComplete={() => {
          setShowMedicalProfile(false);
          setCurrentScreen('home');
        }}
      />
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'symptom-input':
        return (
          <SymptomInputScreen
            onAnalysisComplete={(symptoms, analysis) => {
              setSymptomsData({ symptoms, analysis });
              setCurrentScreen('recommendations');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'recommendations':
        return symptomsData ? (
          <RecommendationsScreen
            symptoms={symptomsData.symptoms}
            analysis={symptomsData.analysis}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
            onBackToInput={() => {
              setCurrentScreen('symptom-input');
            }}
          />
        ) : (
          <HomeScreen
            onStartSymptomInput={() => setCurrentScreen('symptom-input')}
            onViewProfile={() => setCurrentScreen('profile')}
            onViewAppointments={() => setCurrentScreen('appointments')}
            onViewMessages={() => setCurrentScreen('messages')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );

      case 'doctor-detail':
        return selectedDoctor ? (
          <DoctorDetailScreen
            doctor={selectedDoctor}
            onBack={() => {
              if (symptomsData) {
                setCurrentScreen('recommendations');
              } else {
                setCurrentScreen('home');
              }
            }}
            onStartChat={(doctorId) => {
              setChatDoctorId(doctorId);
              setCurrentScreen('chat');
            }}
          />
        ) : (
          <HomeScreen
            onStartSymptomInput={() => setCurrentScreen('symptom-input')}
            onViewProfile={() => setCurrentScreen('profile')}
            onViewAppointments={() => setCurrentScreen('appointments')}
            onViewMessages={() => setCurrentScreen('messages')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );

      case 'chat':
        return chatDoctorId ? (
          <ChatScreen
            doctorId={chatDoctorId}
            onBack={() => {
              if (selectedDoctor) {
                setCurrentScreen('doctor-detail');
              } else {
                setCurrentScreen('home');
              }
            }}
          />
        ) : (
          <HomeScreen
            onStartSymptomInput={() => setCurrentScreen('symptom-input')}
            onViewProfile={() => setCurrentScreen('profile')}
            onViewAppointments={() => setCurrentScreen('appointments')}
            onViewMessages={() => setCurrentScreen('messages')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen('home')}
            onEditProfile={() => setShowMedicalProfile(true)}
          />
        );

      case 'messages':
        return (
          <MessagesScreen
            onBack={() => setCurrentScreen('home')}
            onSelectConversation={(doctorId) => {
              setChatDoctorId(doctorId);
              setCurrentScreen('chat');
            }}
          />
        );

      case 'appointments':
        console.log('Rendering appointments screen');
        return (
          <AppointmentsScreen
            onBack={() => {
              console.log('Appointments back button - going to home');
              setCurrentScreen('home');
            }}
            onStartChat={(doctorId) => {
              setChatDoctorId(doctorId);
              setCurrentScreen('chat');
            }}
          />
        );

      default:
        return (
          <HomeScreen
            onStartSymptomInput={() => setCurrentScreen('symptom-input')}
            onViewProfile={() => setCurrentScreen('profile')}
            onViewAppointments={() => setCurrentScreen('appointments')}
            onViewMessages={() => setCurrentScreen('messages')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );
    }
  };

  return renderCurrentScreen();
}