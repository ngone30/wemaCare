import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import AppHeader from '../components/AppHeader';
import { useLanguage, availableLanguages } from '../contexts/LanguageContext';

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onViewProfile: () => void;
}

export default function SettingsScreen({ onBack, onEditProfile, onViewProfile }: SettingsScreenProps) {
  const { user, logout } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    await setLanguage(languageCode as any);
    setShowLanguageModal(false);
  };

  const getCurrentLanguageName = () => {
    const lang = availableLanguages.find(lang => lang.code === currentLanguage);
    return lang ? `${lang.flag} ${lang.nativeName}` : 'English';
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.confirmSignOut'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.signOut'), 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.confirmDeleteAccount'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('settings.deleteAccount'), t('settings.accountDeletionInfo'));
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      t('settings.exportData'),
      'Your medical data will be prepared for download in a secure format.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.export'),
          onPress: () => {
            Alert.alert(t('settings.exportData'), t('settings.dataExportInitiated'));
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
        title={t('settings.title')}
        showBackButton
        onBack={onBack}
      />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
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
            {t('settings.language')}
          </Text>
          
          <SettingItem
            icon="language-outline"
            title={t('settings.language')}
            subtitle={getCurrentLanguageName()}
            onPress={() => setShowLanguageModal(true)}
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
            {t('settings.account')}
          </Text>
          
          <SettingItem
            icon="person-outline"
            title={t('settings.viewProfile')}
            subtitle={t('settings.viewProfileDescription')}
            onPress={onViewProfile}
          />
          
          <SettingItem
            icon="create-outline"
            title={t('settings.editProfile')}
            subtitle={t('settings.editProfileDescription')}
            onPress={onEditProfile}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title={t('settings.privacySecurity')}
            subtitle={t('settings.privacySecurityDescription')}
            onPress={() => Alert.alert(t('settings.privacySecurity'), 'Privacy settings would be configured here')}
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
            title={t('settings.pushNotifications')}
            subtitle={t('settings.pushNotificationsDescription')}
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
            title={t('settings.emailNotifications')}
            subtitle={t('settings.emailNotificationsDescription')}
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

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: '70%'
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6'
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#111827'
              }}>
                {t('settings.language')}
              </Text>
              <Pressable
                onPress={() => setShowLanguageModal(false)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6'
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            {/* Language List */}
            <ScrollView style={{ flex: 1 }}>
              {availableLanguages.map((language) => (
                <Pressable
                  key={language.code}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    backgroundColor: currentLanguage === language.code ? '#E8F5E8' : 'transparent'
                  }}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <Text style={{
                    fontSize: 24,
                    marginRight: 16
                  }}>
                    {language.flag}
                  </Text>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#111827',
                      marginBottom: 2
                    }}>
                      {language.nativeName}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#6B7280'
                    }}>
                      {language.name}
                    </Text>
                  </View>
                  
                  {currentLanguage === language.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}