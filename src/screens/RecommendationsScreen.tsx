import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getOpenAITextResponse, getEnhancedHealthcareRecommendations } from '../api/chat-service';
import { useHealthcareStore, getMockDoctors, getMockHospitals } from '../state/healthcareStore';
import { useAuthStore } from '../state/authStore';
import { SymptomInput, RecommendedDoctor, RecommendedHospital, Recommendation } from '../types/healthcare';
import { 
  assessMentalHealth, 
  recommendMentalHealthProviders, 
  recommendMentalHealthFacilities,
  getMentalHealthCrisisResources 
} from '../services/mentalHealthService';
import { cn } from '../utils/cn';

interface RecommendationsScreenProps {
  symptoms: SymptomInput[];
  analysis: string;
  onSelectDoctor: (doctor: RecommendedDoctor) => void;
  onBackToInput: () => void;
}

export default function RecommendationsScreen({ 
  symptoms, 
  analysis, 
  onSelectDoctor, 
  onBackToInput 
}: RecommendationsScreenProps) {
  const { setRecommendations, recommendations, setMentalHealthAssessment, setMentalHealthProviders, setMentalHealthFacilities, currentLanguage } = useHealthcareStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showMentalHealthSupport, setShowMentalHealthSupport] = useState(false);
  const [mentalHealthAssessment, setMentalHealthAssessmentLocal] = useState<any>(null);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const symptomsText = symptoms.map(s => `${s.type.toUpperCase()}: ${s.content}`).join('\n');
      
      // Assess mental health first
      if (user?.medicalProfile) {
        const assessment = await assessMentalHealth(symptoms, user.medicalProfile);
        setMentalHealthAssessmentLocal(assessment);
        setMentalHealthAssessment(assessment);
        
        if (assessment.riskLevel !== 'low' || assessment.professionalHelp) {
          setShowMentalHealthSupport(true);
          
          // Get mental health provider recommendations
          const providers = recommendMentalHealthProviders(assessment, '', currentLanguage);
          const facilities = recommendMentalHealthFacilities(assessment, '', currentLanguage);
          
          setMentalHealthProviders(providers);
          setMentalHealthFacilities(facilities);
        }
      }
      
      const prompt = `Based on these symptoms, analysis, and medical history, recommend the most suitable doctors and hospitals:

SYMPTOMS:
${symptomsText}

ANALYSIS:
${analysis}

MEDICAL HISTORY:
- Previous conditions: ${user?.medicalProfile?.medicalConditions?.join(', ') || 'None listed'}
- Current medications: ${user?.medicalProfile?.medications?.join(', ') || 'None listed'}
- Allergies: ${user?.medicalProfile?.allergies?.join(', ') || 'None listed'}
- Age: ${user?.medicalProfile?.dateOfBirth ? new Date().getFullYear() - new Date(user.medicalProfile.dateOfBirth).getFullYear() : 'Not provided'}
- Blood type: ${user?.medicalProfile?.bloodType || 'Not provided'}

MENTAL HEALTH ASSESSMENT: ${mentalHealthAssessment ? `Risk level: ${mentalHealthAssessment.riskLevel}, Professional help needed: ${mentalHealthAssessment.professionalHelp}` : 'Not assessed'}

AVAILABLE DOCTORS:
${getMockDoctors().map(doc => 
  `- Dr. ${doc.name} (${doc.specialty}) - ${doc.experience} years experience, Rating: ${doc.rating}/5, Hospital: ${doc.hospital}`
).join('\n')}

AVAILABLE HOSPITALS:
${getMockHospitals().map(hospital => 
  `- ${hospital.name} - Specialties: ${hospital.specialties.join(', ')}, Rating: ${hospital.rating}/5, Emergency: ${hospital.emergencyServices ? 'Yes' : 'No'}`
).join('\n')}

Please provide:
1. Top 3 recommended doctors with match scores (0-100) and specific reasons
2. Top 3 recommended hospitals with match scores (0-100) and specific reasons
3. Overall reasoning for recommendations

Format your response as JSON with this structure:
{
  "doctors": [
    {
      "doctorId": "1",
      "matchScore": 95,
      "matchReason": "Specific reason for recommendation"
    }
  ],
  "hospitals": [
    {
      "hospitalId": "1", 
      "matchScore": 90,
      "matchReason": "Specific reason for recommendation"
    }
  ],
  "reasoning": "Overall explanation of recommendations"
}`;

      const response = await getOpenAITextResponse([
        { role: 'user', content: prompt }
      ]);

      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      let recommendationData;
      
      if (jsonMatch) {
        try {
          recommendationData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          recommendationData = generateFallbackRecommendations();
        }
      } else {
        recommendationData = generateFallbackRecommendations();
      }

      // Create full recommendation objects
      const recommendedDoctors: RecommendedDoctor[] = recommendationData.doctors
        .map((rec: any) => {
          const doctor = getMockDoctors().find(d => d.id === rec.doctorId);
          if (doctor) {
            return {
              ...doctor,
              matchScore: rec.matchScore,
              matchReason: rec.matchReason
            };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, 3);

      const recommendedHospitals: RecommendedHospital[] = recommendationData.hospitals
        .map((rec: any) => {
          const hospital = getMockHospitals().find(h => h.id === rec.hospitalId);
          if (hospital) {
            return {
              ...hospital,
              matchScore: rec.matchScore,
              matchReason: rec.matchReason
            };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, 3);

      const finalRecommendations: Recommendation = {
        doctors: recommendedDoctors,
        hospitals: recommendedHospitals,
        reasoning: recommendationData.reasoning,
        confidence: 0.85
      };

      setRecommendations(finalRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      setRecommendations(generateFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = (): Recommendation => {
    const doctors = getMockDoctors().slice(0, 3).map(doctor => ({
      ...doctor,
      matchScore: Math.floor(Math.random() * 20) + 80,
      matchReason: 'Recommended based on your symptoms and medical profile'
    }));

    const hospitals = getMockHospitals().slice(0, 3).map(hospital => ({
      ...hospital,
      matchScore: Math.floor(Math.random() * 20) + 75,
      matchReason: 'Well-equipped facility for your healthcare needs'
    }));

    return {
      doctors,
      hospitals,
      reasoning: 'These recommendations are based on your symptoms and available healthcare providers in your area.',
      confidence: 0.75
    };
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="medical-outline" size={64} color="#3B82F6" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            Generating Recommendations
          </Text>
          <Text className="text-gray-600 mt-2 text-center px-8">
            Our AI is finding the best healthcare providers for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recommendations) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Failed to Generate Recommendations
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            Please try again or contact support if the issue persists.
          </Text>
          <Pressable
            className="bg-blue-500 rounded-xl px-6 py-3 mt-6"
            onPress={onBackToInput}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              className="mr-4 p-2 -ml-2"
              onPress={onBackToInput}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">AI Recommendations</Text>
              <Text className="text-gray-600">Personalized healthcare suggestions</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Analysis Summary */}
          <View className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <Text className="text-lg font-semibold text-blue-900 mb-2">
              Symptom Analysis Summary
            </Text>
            <Text className="text-blue-800 leading-relaxed">
              {analysis.substring(0, 200)}...
            </Text>
          </View>

          {/* Recommended Doctors */}
          <View className="px-6 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Recommended Doctors
            </Text>
            
            {recommendations.doctors.map((doctor, index) => (
              <Pressable
                key={doctor.id}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
                onPress={() => onSelectDoctor(doctor)}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {doctor.name}
                    </Text>
                    <Text className="text-blue-600 font-medium">
                      {doctor.specialty}
                    </Text>
                  </View>
                  <View className="bg-green-100 rounded-lg px-3 py-1">
                    <Text className="text-green-800 font-semibold">
                      {doctor.matchScore}% Match
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-1">
                    {doctor.rating} • {doctor.experience} years experience
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-1 flex-1">
                    {doctor.hospital}
                  </Text>
                </View>
                
                <Text className="text-gray-700 mb-3 italic">
                  "{doctor.matchReason}"
                </Text>
                
                <View className="flex-row space-x-3">
                  <Pressable
                    className="flex-1 bg-blue-500 rounded-lg py-2"
                    onPress={() => onSelectDoctor(doctor)}
                  >
                    <Text className="text-white text-center font-semibold">
                      Book Appointment
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    className="bg-gray-100 rounded-lg px-4 py-2"
                    onPress={() => makePhoneCall(doctor.phone)}
                  >
                    <Ionicons name="call-outline" size={20} color="#374151" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Recommended Hospitals */}
          <View className="px-6 py-6 border-t border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Recommended Hospitals
            </Text>
            
            {recommendations.hospitals.map((hospital) => (
              <View
                key={hospital.id}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {hospital.name}
                    </Text>
                    {hospital.emergencyServices && (
                      <View className="bg-red-100 rounded-lg px-2 py-1 self-start mt-1">
                        <Text className="text-red-800 text-sm font-medium">
                          Emergency Services
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="bg-green-100 rounded-lg px-3 py-1">
                    <Text className="text-green-800 font-semibold">
                      {hospital.matchScore}% Match
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-1">
                    {hospital.rating} • {hospital.distance} miles away
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-1 flex-1">
                    {hospital.address}
                  </Text>
                </View>
                
                <Text className="text-gray-700 mb-3">
                  Specialties: {hospital.specialties.join(', ')}
                </Text>
                
                <Text className="text-gray-700 mb-3 italic">
                  "{hospital.matchReason}"
                </Text>
                
                <Pressable
                  className="bg-blue-500 rounded-lg py-2"
                  onPress={() => makePhoneCall(hospital.phone)}
                >
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="call-outline" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Call Hospital
                    </Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>

          {/* AI Reasoning */}
          <View className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Why These Recommendations?
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              {recommendations.reasoning}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}