import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';

interface AppFooterProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function AppFooter({ currentScreen, onNavigate }: AppFooterProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    { id: 'symptom-input', icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Symptoms' },
    { id: 'appointments', icon: 'calendar-outline', activeIcon: 'calendar', label: 'Appointments' },
    { id: 'messages', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages' },
    { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
  ];

  return (
    <View 
      style={{ 
        paddingBottom: insets.bottom,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8
      }}
    >
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 4
      }}>
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          
          return (
            <Pressable
              key={tab.id}
              onPress={() => onNavigate(tab.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 4
              }}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 32
              }}>
                <Ionicons 
                  name={isActive ? tab.activeIcon as any : tab.icon as any} 
                  size={24} 
                  color={isActive ? '#2E7D32' : '#6B7280'} 
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#2E7D32' : '#6B7280',
                  marginTop: 2
                }}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}