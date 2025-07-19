import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { MedicalProfile } from '../types/healthcare';
import { cn } from '../utils/cn';

interface MedicalProfileScreenProps {
  onComplete: () => void;
}

export default function MedicalProfileScreen({ onComplete }: MedicalProfileScreenProps) {
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
    'Emergency Contact',
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
          {['male', 'female', 'other'].map((gender) => (
            <Pressable
              key={gender}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border",
                profile.gender === gender 
                  ? "bg-blue-500 border-blue-500" 
                  : "bg-gray-50 border-gray-200"
              )}
              onPress={() => setProfile(prev => ({ ...prev, gender: gender as any }))}
            >
              <Text className={cn(
                "text-center capitalize font-medium",
                profile.gender === gender ? "text-white" : "text-gray-700"
              )}>
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
            className="bg-blue-500 rounded-xl px-4 py-3"
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
            className="bg-blue-500 rounded-xl px-4 py-3"
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
            className="bg-blue-500 rounded-xl px-4 py-3"
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
      <View>
        <Text className="text-gray-700 font-medium mb-2">Contact Name</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="Full name"
          value={profile.emergencyContact.name}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, name: text }
          }))}
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="(555) 123-4567"
          value={profile.emergencyContact.phone}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, phone: text }
          }))}
          keyboardType="phone-pad"
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-2">Relationship</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
          placeholder="e.g., Spouse, Parent, Sibling"
          value={profile.emergencyContact.relationship}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, relationship: text }
          }))}
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Medical Profile</Text>
          <Text className="text-gray-600">Help us provide better recommendations</Text>
          
          {/* Progress Indicator */}
          <View className="flex-row mt-4 space-x-2">
            {steps.map((step, index) => (
              <View
                key={index}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200"
                )}
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
              className="flex-1 bg-gray-100 rounded-xl py-4"
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text className="text-gray-700 text-center font-semibold">Previous</Text>
            </Pressable>
          )}
          
          <Pressable
            className="flex-1 bg-blue-500 rounded-xl py-4"
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
    </SafeAreaView>
  );
}