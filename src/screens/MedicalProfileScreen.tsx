import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { MedicalProfile } from '../types/healthcare';
import { cn } from '../utils/cn';
import AppHeader from '../components/AppHeader';

interface MedicalProfileScreenProps {
  onComplete: () => void;
  onBack?: () => void;
  onSettings?: () => void;
}

export default function MedicalProfileScreen({ onComplete, onBack, onSettings }: MedicalProfileScreenProps) {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<MedicalProfile>(user?.medicalProfile || {
    dateOfBirth: '',
    gender: 'male',
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    insurance: {
      provider: '',
      policyNumber: ''
    },
    preferredLanguage: 'English',
    smokingStatus: 'never',
    alcoholConsumption: 'none',
    exerciseFrequency: 'moderate'
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const addMedication = () => {
    if (medicationInput.trim()) {
      setProfile(prev => ({
        ...prev,
        medications: [...prev.medications, medicationInput.trim()]
      }));
      setMedicationInput('');
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (user) {
      // Validate required fields
      if (!user.name || user.name.trim() === '') {
        Alert.alert('Missing Information', 'Please enter your full name before continuing.');
        return;
      }
      
      if (!profile.dateOfBirth || !profile.height || !profile.weight) {
        Alert.alert('Missing Information', 'Please complete all basic information fields before continuing.');
        return;
      }
      
      updateUser({ medicalProfile: profile });
      onComplete();
    }
  };

  const steps = [
    'Basic Info',
    'Medical History',
    'Emergency Contact Details',
    'Insurance'
  ];

  const renderBasicInfo = () => (
    <View className="space-y-4">
      <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
        <Text className="text-blue-800 text-sm">
          * Required fields for AI health recommendations
        </Text>
      </View>
      <View>
        <Text className="text-gray-700 font-medium mb-2">Full Name *</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="Enter your full name (e.g., John David Smith)"
          value={user?.name || ''}
          onChangeText={(text) => {
            if (user) {
              updateUser({ name: text });
            }
          }}
          autoCapitalize="words"
        />
        <Text className="text-gray-500 text-sm mt-1">
          This will appear on your medical card and be shared with healthcare providers
        </Text>
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Date of Birth *</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="MM/DD/YYYY"
          value={profile.dateOfBirth}
          onChangeText={(text) => setProfile(prev => ({ ...prev, dateOfBirth: text }))}
        />
        <Text className="text-gray-500 text-sm mt-1">
          Required for accurate medical recommendations
        </Text>
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Gender</Text>
        <View className="flex-row space-x-3">
          {['male', 'female'].map((gender) => (
            <Pressable
              key={gender}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                backgroundColor: profile.gender === gender ? '#2E7D32' : '#F9FAFB',
                borderColor: profile.gender === gender ? '#2E7D32' : '#E5E7EB'
              }}
              onPress={() => setProfile(prev => ({ ...prev, gender: gender as any }))}
            >
              <Text style={{
                textAlign: 'center',
                textTransform: 'capitalize',
                fontWeight: '500',
                color: profile.gender === gender ? 'white' : '#374151'
              }}>
                {gender}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-gray-700 font-medium mb-2">Height (ft/in) *</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
            placeholder={'5\'8"'}
            value={profile.height}
            onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 font-medium mb-2">Weight (lbs) *</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
            placeholder="150"
            value={profile.weight}
            onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Blood Type</Text>
        <View className="flex-row flex-wrap space-x-2">
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
            <Pressable
              key={type}
              className={cn(
                "py-2 px-4 rounded-lg border mb-2",
                profile.bloodType === type 
                  ? "bg-red-500 border-red-500" 
                  : "bg-gray-50 border-gray-200"
              )}
              onPress={() => setProfile(prev => ({ ...prev, bloodType: type }))}
            >
              <Text className={cn(
                "font-medium",
                profile.bloodType === type ? "text-white" : "text-gray-700"
              )}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMedicalHistory = () => (
    <View className="space-y-6">
      {/* Allergies */}
      <View>
        <Text className="text-gray-700 font-medium mb-2">Allergies</Text>
        <View className="flex-row space-x-2 mb-2">
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
            placeholder="Add allergy"
            value={allergyInput}
            onChangeText={setAllergyInput}
          />
          <Pressable
            style={{
              backgroundColor: '#2E7D32',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
            onPress={addAllergy}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap">
          {profile.allergies.map((allergy, index) => (
            <View key={index} className="bg-red-100 rounded-lg px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-red-800 mr-2">{allergy}</Text>
              <Pressable onPress={() => removeAllergy(index)}>
                <Ionicons name="close" size={16} color="#991B1B" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Medications */}
      <View>
        <Text className="text-gray-700 font-medium mb-2">Current Medications</Text>
        <View className="flex-row space-x-2 mb-2">
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
            placeholder="Add medication"
            value={medicationInput}
            onChangeText={setMedicationInput}
          />
          <Pressable
            style={{
              backgroundColor: '#2E7D32',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
            onPress={addMedication}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap">
          {profile.medications.map((medication, index) => (
            <View key={index} className="bg-blue-100 rounded-lg px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-blue-800 mr-2">{medication}</Text>
              <Pressable onPress={() => removeMedication(index)}>
                <Ionicons name="close" size={16} color="#1E40AF" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Medical Conditions */}
      <View>
        <Text className="text-gray-700 font-medium mb-2">Medical Conditions</Text>
        <View className="flex-row space-x-2 mb-2">
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
            placeholder="Add condition"
            value={conditionInput}
            onChangeText={setConditionInput}
          />
          <Pressable
            style={{
              backgroundColor: '#2E7D32',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
            onPress={addCondition}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap">
          {profile.medicalConditions.map((condition, index) => (
            <View key={index} className="bg-orange-100 rounded-lg px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-orange-800 mr-2">{condition}</Text>
              <Pressable onPress={() => removeCondition(index)}>
                <Ionicons name="close" size={16} color="#C2410C" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmergencyContact = () => (
    <View className="space-y-4">
      {/* Helper Text */}
      <View style={{
        backgroundColor: '#E8F5E8',
        borderColor: '#2E7D32',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }}>
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={20} color="#2E7D32" />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#2E7D32',
            marginLeft: 8
          }}>Emergency Contact Information</Text>
        </View>
        <Text className="text-sm text-gray-700 leading-relaxed">
          Please provide the details of someone we can contact in case of an emergency. Fill in each field below:
        </Text>
      </View>
      
      <View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="person" size={16} color="#2E7D32" />
          <Text className="text-gray-700 font-semibold ml-2">1. Emergency Contact Full Name *</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-3">
          📝 Enter the complete first and last name of your emergency contact person
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="First and Last Name (e.g., John Smith, Mary Johnson)"
          value={profile.emergencyContact.name}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, name: text }
          }))}
          autoCapitalize="words"
        />
      </View>

      <View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="call" size={16} color="#FBC02D" />
          <Text className="text-gray-700 font-semibold ml-2">2. Emergency Contact Phone Number *</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-3">
          📞 Enter a phone number where this person can be reached 24/7 in emergencies
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="Phone Number (e.g., 555-123-4567, +1-555-123-4567)"
          value={profile.emergencyContact.phone}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, phone: text }
          }))}
          keyboardType="phone-pad"
        />
      </View>

      <View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="heart" size={16} color="#FF7043" />
          <Text className="text-gray-700 font-semibold ml-2">3. Relationship to You *</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-3">
          👥 Specify how this emergency contact person is related to you
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="Relationship (e.g., Spouse, Mother, Father, Sister, Brother, Friend)"
          value={profile.emergencyContact.relationship}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, relationship: text }
          }))}
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderInsurance = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 font-medium mb-2">Insurance Provider</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="e.g., Blue Cross Blue Shield"
          value={profile.insurance.provider}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            insurance: { ...prev.insurance, provider: text }
          }))}
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Policy Number</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="Policy number"
          value={profile.insurance.policyNumber}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            insurance: { ...prev.insurance, policyNumber: text }
          }))}
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Lifestyle Factors</Text>
        
        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Smoking Status</Text>
          <View className="flex-row space-x-2">
            {[
              { key: 'never', label: 'Never' },
              { key: 'former', label: 'Former' },
              { key: 'current', label: 'Current' }
            ].map((option) => (
              <Pressable
                key={option.key}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg border",
                  profile.smokingStatus === option.key 
                    ? "bg-blue-500 border-blue-500" 
                    : "bg-gray-50 border-gray-200"
                )}
                onPress={() => setProfile(prev => ({ ...prev, smokingStatus: option.key as any }))}
              >
                <Text className={cn(
                  "text-center text-sm",
                  profile.smokingStatus === option.key ? "text-white" : "text-gray-700"
                )}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Exercise Frequency</Text>
          <View className="flex-row space-x-2">
            {[
              { key: 'none', label: 'None' },
              { key: 'light', label: 'Light' },
              { key: 'moderate', label: 'Moderate' },
              { key: 'heavy', label: 'Heavy' }
            ].map((option) => (
              <Pressable
                key={option.key}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg border",
                  profile.exerciseFrequency === option.key 
                    ? "bg-green-500 border-green-500" 
                    : "bg-gray-50 border-gray-200"
                )}
                onPress={() => setProfile(prev => ({ ...prev, exerciseFrequency: option.key as any }))}
              >
                <Text className={cn(
                  "text-center text-sm",
                  profile.exerciseFrequency === option.key ? "text-white" : "text-gray-700"
                )}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderMedicalHistory();
      case 2: return renderEmergencyContact();
      case 3: return renderInsurance();
      default: return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader 
        title="Medical Profile"
        showBackButton={!!onBack}
        onBack={onBack}
        rightComponent={onSettings && (
          <Pressable
            style={{
              padding: 8,
              backgroundColor: '#F3F4F6',
              borderRadius: 20
            }}
            onPress={onSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#2E7D32" />
          </Pressable>
        )}
      />
      <View className="flex-1">
        {/* Subtitle and Progress */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-gray-600 mb-4">Help us provide better recommendations</Text>
          
          {/* Progress Indicator */}
          <View className="flex-row space-x-2">
            {steps.map((step, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index <= currentStep ? '#2E7D32' : '#E5E7EB'
                }}
              />
            ))}
          </View>
          <Text className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Navigation */}
        <View className="px-6 py-4 border-t border-gray-200 flex-row space-x-3">
          {currentStep > 0 && (
            <Pressable
              style={{
                flex: 1,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingVertical: 16
              }}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={{
                color: '#374151',
                textAlign: 'center',
                fontWeight: '600'
              }}>Previous</Text>
            </Pressable>
          )}
          
          <Pressable
            style={{
              flex: 1,
              backgroundColor: '#2E7D32',
              borderRadius: 12,
              paddingVertical: 16
            }}
            onPress={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSave();
              }
            }}
          >
            <Text className="text-white text-center font-semibold">
              {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}