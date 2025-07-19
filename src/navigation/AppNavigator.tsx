import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();
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
    !user.medicalProfile.dateOfBirth || 
    !user.medicalProfile.height || 
    !user.medicalProfile.weight
  );

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (needsMedicalProfile || showMedicalProfile) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MedicalProfile">
            {() => (
              <MedicalProfileScreen 
                onComplete={() => {
                  setShowMedicalProfile(false);
                  setCurrentScreen('home');
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
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
            onViewProfile={() => setShowMedicalProfile(true)}
            onViewAppointments={() => setCurrentScreen('home')}
            onViewMessages={() => setCurrentScreen('home')}
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
            onViewProfile={() => setShowMedicalProfile(true)}
            onViewAppointments={() => setCurrentScreen('home')}
            onViewMessages={() => setCurrentScreen('home')}
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
            onViewProfile={() => setShowMedicalProfile(true)}
            onViewAppointments={() => setCurrentScreen('home')}
            onViewMessages={() => setCurrentScreen('home')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );

      default:
        return (
          <HomeScreen
            onStartSymptomInput={() => setCurrentScreen('symptom-input')}
            onViewProfile={() => setShowMedicalProfile(true)}
            onViewAppointments={() => setCurrentScreen('home')}
            onViewMessages={() => setCurrentScreen('home')}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentScreen('doctor-detail');
            }}
          />
        );
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => renderCurrentScreen()}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}