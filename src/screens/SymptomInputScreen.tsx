import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import * as ImagePicker from 'expo-image-picker';
import { transcribeAudio } from '../api/transcribe-audio';
import { getOpenAITextResponse } from '../api/chat-service';
import { useAuthStore } from '../state/authStore';
import { SymptomInput } from '../types/healthcare';
import { cn } from '../utils/cn';

interface SymptomInputScreenProps {
  onAnalysisComplete: (symptoms: SymptomInput[], analysis: string) => void;
  onBack: () => void;
}

export default function SymptomInputScreen({ onAnalysisComplete, onBack }: SymptomInputScreenProps) {
  const { user } = useAuthStore();
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

    setIsAnalyzing(true);
    
    try {
      const symptomsText = symptoms.map(s => `${s.type.toUpperCase()}: ${s.content}`).join('\n\n');
      const medicalProfile = user?.medicalProfile;
      
      const prompt = `As a medical AI assistant, analyze the following patient symptoms and medical profile to provide healthcare recommendations.

PATIENT MEDICAL PROFILE:
- Age: ${medicalProfile?.dateOfBirth || 'Not provided'}
- Gender: ${medicalProfile?.gender || 'Not provided'}
- Allergies: ${medicalProfile?.allergies?.join(', ') || 'None listed'}
- Current Medications: ${medicalProfile?.medications?.join(', ') || 'None listed'}
- Medical Conditions: ${medicalProfile?.medicalConditions?.join(', ') || 'None listed'}
- Smoking Status: ${medicalProfile?.smokingStatus || 'Not provided'}
- Exercise: ${medicalProfile?.exerciseFrequency || 'Not provided'}

PATIENT SYMPTOMS:
${symptomsText}

Please provide:
1. A summary of the patient's symptoms
2. Possible conditions or concerns (educational purposes only)
3. Recommended medical specialties to consult
4. Urgency level (routine, urgent, emergency)
5. General health advice

Remember: This is for educational purposes only and not a replacement for professional medical diagnosis.`;

      const analysis = await getOpenAITextResponse([
        { role: 'user', content: prompt }
      ]);

      onAnalysisComplete(symptoms, analysis.content);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center mb-2">
            <Pressable
              className="mr-4 p-2 -ml-2"
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">Describe Your Symptoms</Text>
            </View>
          </View>
          <Text className="text-gray-600">Add your symptoms using text, voice, or images</Text>
        </View>

        {/* Input Methods */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row space-x-3">
            <Pressable
              className="flex-1 bg-blue-50 border border-blue-200 rounded-xl py-3 items-center"
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color="#3B82F6" />
              <Text className="text-blue-600 font-medium mt-1">Gallery</Text>
            </Pressable>
            
            <Pressable
              className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center"
              onPress={takePicture}
            >
              <Ionicons name="camera-outline" size={24} color="#10B981" />
              <Text className="text-green-600 font-medium mt-1">Camera</Text>
            </Pressable>
            
            <Pressable
              className={cn(
                "flex-1 border rounded-xl py-3 items-center",
                isRecording 
                  ? "bg-red-50 border-red-200" 
                  : "bg-purple-50 border-purple-200"
              )}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#EF4444" : "#8B5CF6"} 
              />
              <Text className={cn(
                "font-medium mt-1",
                isRecording ? "text-red-600" : "text-purple-600"
              )}>
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
              className={cn(
                "bg-blue-500 rounded-xl py-4 items-center",
                isAnalyzing && "opacity-50"
              )}
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
    </SafeAreaView>
  );
}