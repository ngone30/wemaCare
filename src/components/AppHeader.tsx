import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useHealthcareStore } from '../state/healthcareStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUPPORTED_LANGUAGES } from '../services/language-service';
import LanguageSelector from './LanguageSelector';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export default function AppHeader({ 
  title = "WemaCARE", 
  showBackButton = false, 
  onBack,
  rightComponent 
}: AppHeaderProps) {
  const { user } = useAuthStore();
  const { currentLanguage } = useHealthcareStore();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const insets = useSafeAreaInsets();
  
  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <View 
      style={{ 
        paddingTop: insets.top,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        minHeight: 56
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showBackButton && (
            <Pressable
              onPress={onBack}
              style={{
                padding: 8,
                marginRight: 12,
                marginLeft: -8
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#111827'
            }}>
              {title}
            </Text>
            {user && !showBackButton && (
              <Text style={{
                fontSize: 14,
                color: '#6B7280',
                marginTop: 2
              }}>
                Welcome back, {user.fullName?.split(' ')[0] || user.email.split('@')[0]}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Language Selector */}
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 16,
              paddingHorizontal: 8,
              paddingVertical: 4
            }}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Text style={{ fontSize: 14, marginRight: 4 }}>
              {currentLang.flag}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#374151'
            }}>
              {currentLang.code.toUpperCase()}
            </Text>
          </Pressable>

          {rightComponent && (
            <View>
              {rightComponent}
            </View>
          )}
        </View>

        <LanguageSelector
          visible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onLanguageSelect={(language) => {
            // Language change handled in LanguageSelector
          }}
        />
      </View>
    </View>
  );
}