import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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

        {rightComponent && (
          <View style={{ marginLeft: 12 }}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
}