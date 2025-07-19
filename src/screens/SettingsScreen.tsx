import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useHealthcareStore } from '../state/healthcareStore';
import { SUPPORTED_LANGUAGES } from '../services/language-service';
import AppHeader from '../components/AppHeader';
import LanguageSelector from '../components/LanguageSelector';

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onViewProfile: () => void;
}

export default function SettingsScreen({ onBack, onEditProfile, onViewProfile }: SettingsScreenProps) {
  const { user, logout } = useAuthStore();
  const { currentLanguage, setCurrentLanguage } = useHealthcareStore();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your medical data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion feature would be implemented here with proper security measures.');
          }
        }
      ]
    );
  };

  const getCurrentLanguageName = () => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    return language ? `${language.nativeName} (${language.name})` : 'English';
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your medical data will be prepared for download in a secure format.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export',
          onPress: () => {
            Alert.alert('Data Export', 'Data export feature initiated. You will receive an email when ready.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
      }}
      onPress={onPress}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons name={icon as any} size={20} color="#2E7D32" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: '#111827',
          marginBottom: subtitle ? 4 : 0
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize: 14,
            color: '#6B7280'
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightComponent}
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <AppHeader 
        title="Settings"
        showBackButton
        onBack={onBack}
      />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* App Preferences */}
        <View style={{ marginTop: 16 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            App Preferences
          </Text>
          
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle={`Current: ${getCurrentLanguageName()}`}
            onPress={() => setShowLanguageSelector(true)}
          />
        </View>

        {/* Account Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Account
          </Text>
          
          <SettingItem
            icon="person-outline"
            title="View Profile"
            subtitle="See your medical information"
            onPress={onViewProfile}
          />
          
          <SettingItem
            icon="create-outline"
            title="Edit Profile"
            subtitle="Update your medical information"
            onPress={onEditProfile}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Manage your data and security settings"
            onPress={() => Alert.alert('Privacy & Security', 'Privacy settings would be configured here')}
          />
        </View>

        {/* Notifications Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Notifications
          </Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive appointment reminders"
            showArrow={false}
            rightComponent={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E7EB', true: '#2E7D32' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive updates via email"
            showArrow={false}
            rightComponent={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E5E7EB', true: '#2E7D32' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Security Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Security
          </Text>
          
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            showArrow={false}
            rightComponent={
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                trackColor={{ false: '#E5E7EB', true: '#2E7D32' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingItem
            icon="key-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => Alert.alert('Change Password', 'Password change form would be shown here')}
          />
        </View>

        {/* Data & Privacy Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Data & Privacy
          </Text>
          
          <SettingItem
            icon="download-outline"
            title="Export My Data"
            subtitle="Download your medical information"
            onPress={handleExportData}
          />
          
          <SettingItem
            icon="analytics-outline"
            title="Data Sharing"
            subtitle="Share anonymized data for research"
            showArrow={false}
            rightComponent={
              <Switch
                value={dataSharing}
                onValueChange={setDataSharing}
                trackColor={{ false: '#E5E7EB', true: '#2E7D32' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Support
          </Text>
          
          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => Alert.alert('Help & FAQ', 'Help documentation would open here')}
          />
          
          <SettingItem
            icon="chatbubble-outline"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => Alert.alert('Contact Support', 'Support chat would be initiated here')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="About WemaCARE"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About WemaCARE', 'App information and legal notices would be shown here')}
          />
        </View>

        {/* Danger Zone */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Account Actions
          </Text>
          
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6'
            }}
            onPress={handleLogout}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FEF2F2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Ionicons name="log-out-outline" size={20} color="#FF7043" />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#FF7043'
              }}>
                Sign Out
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: '#FFFFFF'
            }}
            onPress={handleDeleteAccount}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FEF2F2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#EF4444'
              }}>
                Delete Account
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6B7280',
                marginTop: 2
              }}>
                Permanently delete your account and data
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onLanguageSelect={(languageCode) => {
          setCurrentLanguage(languageCode);
        }}
      />
    </View>
  );
}