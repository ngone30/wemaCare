import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import * as ImagePicker from 'expo-image-picker';
import { transcribeAudio } from '../api/transcribe-audio';
import { getOpenAITextResponse } from '../api/chat-service';
import { safeAnalyzeHealthcareNeeds } from '../api/healthcare-analysis-wrapper';
import { MentalHealthAssessment } from '../api/healthcare-analysis';
import { useAuthStore } from '../state/authStore';
import { useHealthcareStore } from '../state/healthcareStore';
import { SymptomInput } from '../types/healthcare';
import { cn } from '../utils/cn';
import AppHeader from '../components/AppHeader';

interface SymptomInputScreenProps {
  onAnalysisComplete: (symptoms: SymptomInput[], analysis: string) => void;
  onBack: () => void;
}

export default function SymptomInputScreen({ onAnalysisComplete, onBack }: SymptomInputScreenProps) {
  const { user } = useAuthStore();
  const { setMentalHealthAssessment } = useHealthcareStore();
  const [symptoms, setSymptoms] = useState<SymptomInput[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const addTextSymptom = () => {
    if (textInput.trim()) {
      const newSymptom: SymptomInput = {
        id: Date.now().toString(),
        type: 'text',
        content: textInput.trim(),
        timestamp: new Date().toISOString()
      };
      setSymptoms(prev => [...prev, newSymptom]);
      setTextInput('');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Audio recording permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Transcribe the audio
        Alert.alert('Processing', 'Transcribing your voice note...');
        const transcription = await transcribeAudio(uri);
        
        const newSymptom: SymptomInput = {
          id: Date.now().toString(),
          type: 'voice',
          content: transcription,
          voiceUri: uri,
          timestamp: new Date().toISOString()
        };
        
        setSymptoms(prev => [...prev, newSymptom]);
      }
      
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice note');
      setRecording(null);
    }
  };

  const takePicture = async () => {
    try {
      
      // For now, simulate taking a picture and use the image picker instead
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        Alert.alert('Processing', 'Analyzing your image...');
        
        try {
          const imageAnalysis = await getOpenAITextResponse([
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this medical/health-related image and describe what you see. Focus on any visible symptoms, conditions, or health concerns that might be relevant for medical consultation.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${asset.base64}`
                  }
                }
              ] as any
            }
          ]);

          const newSymptom: SymptomInput = {
            id: Date.now().toString(),
            type: 'image',
            content: imageAnalysis.content,
            imageUri: asset.uri,
            timestamp: new Date().toISOString()
          };
          
          setSymptoms(prev => [...prev, newSymptom]);
        } catch (error) {
          Alert.alert('Error', 'Failed to analyze image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      Alert.alert('Processing', 'Analyzing your image...');
      
      try {
        const imageAnalysis = await getOpenAITextResponse([
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this medical/health-related image and describe what you see. Focus on any visible symptoms, conditions, or health concerns that might be relevant for medical consultation.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${asset.base64}`
                }
              }
            ] as any
          }
        ]);

        const newSymptom: SymptomInput = {
          id: Date.now().toString(),
          type: 'image',
          content: imageAnalysis.content,
          imageUri: asset.uri,
          timestamp: new Date().toISOString()
        };
        
        setSymptoms(prev => [...prev, newSymptom]);
      } catch (error) {
        Alert.alert('Error', 'Failed to analyze image');
      }
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please add at least one symptom before getting recommendations');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Use enhanced healthcare analysis that considers medical history and mental health
      const analysis = await safeAnalyzeHealthcareNeeds(symptoms, user);
      
      // Store mental health assessment if present
      if (analysis.mentalHealthAssessment) {
        setMentalHealthAssessment(analysis.mentalHealthAssessment);
        
        // Alert user if immediate mental health attention is needed
        if (analysis.mentalHealthAssessment.requiresImmediateAttention) {
          Alert.alert(
            'Mental Health Support Available',
            'Based on your symptoms, we recommend speaking with a mental health professional. We have connected you with qualified therapists and psychiatrists.',
            [
              { text: 'View Recommendations', onPress: () => {} },
              { text: 'Emergency Help', onPress: () => Alert.alert('Emergency', 'If you are in crisis, please call your local emergency number or go to the nearest hospital.') }
            ]
          );
        }
      }

      // Show urgency alert if needed
      if (analysis.urgencyLevel === 'emergency') {
        Alert.alert(
          'Urgent Medical Attention Needed',
          'Based on your symptoms and medical history, please seek immediate medical attention.',
          [
            { text: 'Find Emergency Care', onPress: () => {} },
            { text: 'Continue', onPress: () => {} }
          ]
        );
      } else if (analysis.urgencyLevel === 'high') {
        Alert.alert(
          'Priority Medical Care',
          'Your symptoms suggest you should see a healthcare provider soon.',
          [{ text: 'Continue', onPress: () => {} }]
        );
      }

      onAnalysisComplete(symptoms, analysis.analysis);
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        symptomCount: symptoms.length,
        userPresent: !!user
      });
      
      Alert.alert(
        'Analysis Error', 
        'We encountered an issue while analyzing your symptoms. Please try again or consult with a healthcare provider directly.',
        [
          { text: 'Try Again', onPress: () => analyzeSymptoms() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader 
        title="Describe Your Symptoms"
        showBackButton
        onBack={onBack}
      />
      <View className="flex-1">
        {/* Description */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-gray-600">Add your symptoms using text, voice, or images</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            backgroundColor: '#E8F5E8',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 6
          }}>
            <Ionicons name="globe-outline" size={16} color="#2E7D32" />
            <Text style={{
              fontSize: 12,
              color: '#2E7D32',
              marginLeft: 6,
              fontWeight: '500'
            }}>
              🌍 Available in 15+ African languages
            </Text>
          </View>
        </View>

        {/* Input Methods */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row space-x-3">
            <Pressable
              style={{
                flex: 1,
                backgroundColor: '#E8F5E8',
                borderColor: '#2E7D32',
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center'
              }}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color="#2E7D32" />
              <Text style={{
                color: '#2E7D32',
                fontWeight: '500',
                marginTop: 4
              }}>Gallery</Text>
            </Pressable>
            
            <Pressable
              style={{
                flex: 1,
                backgroundColor: '#FFF8E1',
                borderColor: '#FBC02D',
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center'
              }}
              onPress={takePicture}
            >
              <Ionicons name="camera-outline" size={24} color="#FBC02D" />
              <Text style={{
                color: '#FBC02D',
                fontWeight: '500',
                marginTop: 4
              }}>Camera</Text>
            </Pressable>
            
            <Pressable
              style={{
                flex: 1,
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: isRecording ? '#FFEBEE' : '#FFF8E1',
                borderColor: isRecording ? '#FF7043' : '#FF8E53'
              }}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#FF7043" : "#FF8E53"} 
              />
              <Text style={{
                fontWeight: '500',
                marginTop: 4,
                color: isRecording ? "#FF7043" : "#FF8E53"
              }}>
                {isRecording ? 'Stop' : 'Voice'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Text Input */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row space-x-3">
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Type your symptoms here..."
              value={textInput}
              onChangeText={setTextInput}
              multiline
              maxLength={500}
            />
            <Pressable
              className="bg-blue-500 rounded-xl px-4 py-3 justify-center"
              onPress={addTextSymptom}
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Symptoms List */}
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          {symptoms.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                No symptoms added yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Use the buttons above to describe your symptoms
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {symptoms.map((symptom) => (
                <View key={symptom.id} className="bg-gray-50 rounded-xl p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          symptom.type === 'text' ? 'text-outline' :
                          symptom.type === 'voice' ? 'mic-outline' :
                          'image-outline'
                        }
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="text-gray-600 font-medium ml-2 capitalize">
                        {symptom.type} Input
                      </Text>
                    </View>
                    <Pressable onPress={() => removeSymptom(symptom.id)}>
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </Pressable>
                  </View>
                  
                  {symptom.imageUri && (
                    <Image 
                      source={{ uri: symptom.imageUri }} 
                      className="w-full h-32 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                  )}
                  
                  <Text className="text-gray-900">{symptom.content}</Text>
                  <Text className="text-gray-400 text-sm mt-2">
                    {new Date(symptom.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Analyze Button */}
        {symptoms.length > 0 && (
          <View className="px-6 py-4 border-t border-gray-200">
            <Pressable
              style={{
                backgroundColor: '#2E7D32',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: isAnalyzing ? 0.5 : 1
              }}
              onPress={analyzeSymptoms}
              disabled={isAnalyzing}
            >
              <Text className="text-white font-semibold text-lg">
                {isAnalyzing ? 'Analyzing...' : 'Get AI Recommendations'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}