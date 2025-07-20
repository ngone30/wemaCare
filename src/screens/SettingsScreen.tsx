import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import AppHeader from '../components/AppHeader';

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile?: () => void;
  onViewProfile?: () => void;
  isSignupFlow?: boolean;
}

export default function SettingsScreen({ onBack, onEditProfile, onViewProfile, isSignupFlow = false }: SettingsScreenProps) {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

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
    rightComponent,
    iconBgColor = '#F3F4F6',
    iconColor = '#2E7D32'
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
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
        backgroundColor: iconBgColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
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
        title={isSignupFlow ? "Setup & Settings" : "Settings"}
        showBackButton
        onBack={onBack}
      />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Welcome Message for Signup Flow */}
        {isSignupFlow && (
          <View style={{ 
            margin: 16, 
            padding: 16, 
            backgroundColor: '#E8F5E8', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2E7D32'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: '#2E7D32',
                marginLeft: 8
              }}>
                Welcome to WemaCARE!
              </Text>
            </View>
            <Text style={{ color: '#1F6A24', lineHeight: 20 }}>
              Configure your preferences and privacy settings. You can change these anytime from your profile.
            </Text>
          </View>
        )}

        {/* Account Section */}
        <View style={{ marginTop: isSignupFlow ? 8 : 16 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#6B7280',
            paddingHorizontal: 20,
            paddingVertical: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            {isSignupFlow ? 'Profile Setup' : 'Account'}
          </Text>
          
          {onViewProfile && (
            <SettingItem
              icon="person-outline"
              title="View Profile"
              subtitle="See your medical information"
              onPress={onViewProfile}
            />
          )}
          
          {onEditProfile && (
            <SettingItem
              icon="create-outline"
              title={isSignupFlow ? "Complete Medical Profile" : "Edit Profile"}
              subtitle={isSignupFlow ? "Finish setting up your medical information" : "Update your medical information"}
              onPress={onEditProfile}
              iconBgColor={isSignupFlow ? "#FFF8E1" : "#F3F4F6"}
              iconColor={isSignupFlow ? "#FBC02D" : "#2E7D32"}
            />
          )}
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Manage your data and security settings"
            onPress={() => Alert.alert('Privacy & Security', 'Privacy settings would be configured here')}
          />

          {isSignupFlow && (
            <SettingItem
              icon="information-circle-outline"
              title="App Tutorial"
              subtitle="Learn how to use WemaCARE effectively"
              onPress={() => Alert.alert('Tutorial', 'Interactive app tutorial would start here')}
              iconBgColor="#FFF8E1"
              iconColor="#FBC02D"
            />
          )}
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
            subtitle={isSignupFlow ? "Get reminders for appointments and health tips" : "Receive appointment reminders"}
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

          {isSignupFlow && (
            <SettingItem
              icon="calendar-outline"
              title="Health Reminders"
              subtitle="Daily health tips and medication reminders"
              showArrow={false}
              rightComponent={
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: '#E5E7EB', true: '#FBC02D' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconBgColor="#FFF8E1"
              iconColor="#FBC02D"
            />
          )}
        </View>

        {/* Privacy & Data Section */}
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
            Privacy & Data
          </Text>
          
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle={isSignupFlow ? "Use fingerprint or face ID for secure access" : "Use fingerprint or face ID"}
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
            icon="analytics-outline"
            title="Anonymous Data Sharing"
            subtitle="Help improve healthcare research"
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

          {!isSignupFlow && (
            <SettingItem
              icon="download-outline"
              title="Export My Data"
              subtitle="Download your medical information"
              onPress={handleExportData}
            />
          )}
        </View>

        {/* App Preferences (Signup Flow) */}
        {isSignupFlow && (
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
              App Preferences
            </Text>
            
            <SettingItem
              icon="color-palette-outline"
              title="Theme"
              subtitle="Light theme (Dark theme coming soon)"
              showArrow={false}
              iconBgColor="#FFEBEE"
              iconColor="#FF7043"
            />
            
            <SettingItem
              icon="globe-outline"
              title="Language"
              subtitle="English (More languages coming soon)"
              showArrow={false}
              iconBgColor="#E8F5E8"
              iconColor="#2E7D32"
            />
          </View>
        )}

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

        {/* Account Actions */}
        {!isSignupFlow && (
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
        )}

        {/* Signup Flow Completion Message */}
        {isSignupFlow && (
          <View style={{ 
            margin: 16, 
            marginTop: 24,
            marginBottom: 32,
            padding: 16, 
            backgroundColor: '#FFF8E1', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FBC02D'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="bulb" size={24} color="#FBC02D" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: '#8B6914',
                marginLeft: 8
              }}>
                You're All Set!
              </Text>
            </View>
            <Text style={{ color: '#8B6914', lineHeight: 20 }}>
              Your settings have been configured. You can always return here to update your preferences from the main menu.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}