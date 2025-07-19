import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_LANGUAGES, languageService } from '../services/language-service';
import { useHealthcareStore } from '../state/healthcareStore';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelect: (languageCode: string) => void;
}

export default function LanguageSelector({ visible, onClose, onLanguageSelect }: LanguageSelectorProps) {
  const { currentLanguage } = useHealthcareStore();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);
      languageService.setCurrentLanguage(languageCode);
      onLanguageSelect(languageCode);
      
      // Show confirmation in the selected language
      const confirmationText = languageCode === 'en' 
        ? 'Language changed successfully'
        : await languageService.translateText('Language changed successfully', languageCode);
      
      Alert.alert('Success', confirmationText);
      onClose();
    } catch (error) {
      console.error('Language selection error:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  const regions = [
    { name: 'Universal', languages: SUPPORTED_LANGUAGES.filter(l => l.region === 'Universal') },
    { name: 'West Africa', languages: SUPPORTED_LANGUAGES.filter(l => l.region.includes('West Africa') || l.region === 'Nigeria' || l.region === 'Ghana' || l.region === 'Senegal') },
    { name: 'East Africa', languages: SUPPORTED_LANGUAGES.filter(l => l.region.includes('East Africa') || l.region === 'Kenya' || l.region === 'Ethiopia' || l.region === 'Rwanda' || l.region === 'Uganda') },
    { name: 'Southern Africa', languages: SUPPORTED_LANGUAGES.filter(l => l.region.includes('Southern Africa') || l.region === 'South Africa' || l.region === 'Botswana') },
    { name: 'North Africa', languages: SUPPORTED_LANGUAGES.filter(l => l.region.includes('North Africa')) },
    { name: 'Francophone Africa', languages: SUPPORTED_LANGUAGES.filter(l => l.region.includes('Francophone')) }
  ].filter(region => region.languages.length > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          backgroundColor: '#FFFFFF'
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#111827'
          }}>
            Select Language
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: '#F3F4F6'
            }}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              marginBottom: 16,
              textAlign: 'center'
            }}>
              WemaCARE supports 15+ African languages powered by AI translation
            </Text>

            {regions.map((region) => (
              <View key={region.name} style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 12,
                  paddingLeft: 4
                }}>
                  {region.name}
                </Text>
                
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}>
                  {region.languages.map((language, index) => {
                    const isSelected = selectedLanguage === language.code;
                    const isLast = index === region.languages.length - 1;
                    
                    return (
                      <Pressable
                        key={language.code}
                        onPress={() => handleLanguageSelect(language.code)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: '#F3F4F6',
                          backgroundColor: isSelected ? '#E8F5E8' : '#FFFFFF'
                        }}
                      >
                        <Text style={{
                          fontSize: 24,
                          marginRight: 12
                        }}>
                          {language.flag}
                        </Text>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: isSelected ? '#2E7D32' : '#111827',
                            marginBottom: 2
                          }}>
                            {language.name}
                          </Text>
                          <Text style={{
                            fontSize: 14,
                            color: isSelected ? '#2E7D32' : '#6B7280'
                          }}>
                            {language.nativeName}
                          </Text>
                        </View>
                        
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* AI Translation Notice */}
            <View style={{
              backgroundColor: '#FFF8E1',
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#FBC02D'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={20} color="#FBC02D" style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#92400E',
                    marginBottom: 4
                  }}>
                    AI-Powered Translation
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#92400E',
                    lineHeight: 18
                  }}>
                    Medical content is accurately translated using advanced AI while preserving medical terminology and cultural context appropriate for African healthcare.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}