import { getOpenAITextResponse } from './chat-service';
import { AIMessage } from '../types/ai';
import { User } from '../state/authStore';
import { SymptomInput, RecommendedDoctor, RecommendedHospital } from '../types/healthcare';

export interface MentalHealthAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  recommendations: string[];
  requiresImmediateAttention: boolean;
  suggestedSpecialists: ('therapist' | 'psychiatrist' | 'counselor' | 'psychologist')[];
}

export interface EnhancedHealthcareRecommendation {
  analysis: string;
  doctors: RecommendedDoctor[];
  hospitals: RecommendedHospital[];
  mentalHealthAssessment?: MentalHealthAssessment;
  urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency';
  reasoning: string;
  followUpRecommendations: string[];
}

export const analyzeHealthcareNeeds = async (
  symptoms: SymptomInput[],
  user: User
): Promise<EnhancedHealthcareRecommendation> => {
  const medicalHistory = user.medicalProfile;
  
  const analysisPrompt = `
You are a medical AI assistant helping to recommend healthcare providers in Africa. Analyze the following patient information and symptoms to provide comprehensive recommendations.

PATIENT MEDICAL HISTORY:
- Age: ${medicalHistory.dateOfBirth ? calculateAge(medicalHistory.dateOfBirth) : 'Not provided'}
- Blood Type: ${medicalHistory.bloodType || 'Not provided'}
- Current Medications: ${medicalHistory.medications.join(', ') || 'None'}
- Known Allergies: ${medicalHistory.allergies.join(', ') || 'None'}
- Medical Conditions: ${medicalHistory.medicalConditions.join(', ') || 'None'}
- Previous Surgeries: ${medicalHistory.surgeries?.join(', ') || 'None'}
- Family History: ${medicalHistory.familyHistory || 'Not provided'}

CURRENT SYMPTOMS:
${symptoms.map((symptom, index) => `${index + 1}. ${symptom.content} (${symptom.type})`).join('\n')}

Please provide a comprehensive analysis that includes:

1. MEDICAL ANALYSIS: Detailed assessment considering both current symptoms and medical history
2. MENTAL HEALTH SCREENING: Assess if symptoms indicate mental health concerns (depression, anxiety, stress, trauma, etc.)
3. URGENCY LEVEL: Rate as low/moderate/high/emergency
4. SPECIALIST RECOMMENDATIONS: Specific types of doctors needed
5. HOSPITAL RECOMMENDATIONS: Type of facilities required
6. CULTURAL CONSIDERATIONS: Consider African healthcare context and traditional medicine integration
7. FOLLOW-UP CARE: Recommended monitoring and care plan

Respond in JSON format:
{
  "analysis": "detailed medical analysis",
  "mentalHealthAssessment": {
    "riskLevel": "low|moderate|high|critical", 
    "indicators": ["symptom1", "symptom2"],
    "recommendations": ["rec1", "rec2"],
    "requiresImmediateAttention": boolean,
    "suggestedSpecialists": ["therapist", "psychiatrist", "counselor", "psychologist"]
  },
  "urgencyLevel": "low|moderate|high|emergency",
  "reasoning": "explanation of recommendations based on medical history",
  "specialistsNeeded": ["specialist1", "specialist2"],
  "hospitalType": "general|specialist|mental_health|emergency",
  "followUpRecommendations": ["rec1", "rec2"],
  "culturalConsiderations": "African healthcare context notes"
}
`;

  try {
    const messages: AIMessage[] = [
      { role: "user", content: analysisPrompt }
    ];

    const response = await getOpenAITextResponse(messages, {
      temperature: 0.3, // Lower temperature for medical accuracy
      maxTokens: 3000
    });

    const analysis = JSON.parse(response.content);
    
    // Generate doctor recommendations based on analysis
    const doctors = generateDoctorRecommendations(analysis, user, symptoms);
    
    // Generate hospital recommendations
    const hospitals = generateHospitalRecommendations(analysis, user);

    return {
      analysis: analysis.analysis,
      doctors,
      hospitals,
      mentalHealthAssessment: analysis.mentalHealthAssessment,
      urgencyLevel: analysis.urgencyLevel,
      reasoning: analysis.reasoning,
      followUpRecommendations: analysis.followUpRecommendations
    };

  } catch (error) {
    console.error('Healthcare analysis error:', error);
    
    // Fallback analysis
    return {
      analysis: "Based on your symptoms and medical history, I recommend consulting with a healthcare professional for proper evaluation.",
      doctors: generateBasicDoctorRecommendations(symptoms),
      hospitals: generateBasicHospitalRecommendations(),
      urgencyLevel: 'moderate',
      reasoning: "Unable to perform detailed analysis, providing general recommendations.",
      followUpRecommendations: ["Schedule appointment with primary care physician", "Monitor symptoms", "Seek immediate care if symptoms worsen"]
    };
  }
};

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const generateDoctorRecommendations = (
  analysis: any, 
  user: User, 
  symptoms: SymptomInput[]
): RecommendedDoctor[] => {
  const specialists = analysis.specialistsNeeded || ['General Practitioner'];
  const isMentalHealth = analysis.mentalHealthAssessment?.riskLevel !== 'low';
  
  const doctors: RecommendedDoctor[] = [
    {
      id: '1',
      name: 'Dr. Amara Kone',
      specialty: specialists[0] || 'General Medicine',
      hospital: 'Lagos University Teaching Hospital',
      rating: 4.8,
      experience: '15 years',
      languages: ['English', 'Yoruba', 'French'],
      phone: '+234-123-456-789',
      email: 'dr.kone@luth.edu.ng',
      matchScore: calculateMatchScore(analysis, user, 'general'),
      availability: 'Available today',
      consultationFee: '$50-80 USD',
      image: 'https://example.com/doctor1.jpg'
    },
    {
      id: '2', 
      name: 'Dr. Fatima Al-Rashid',
      specialty: specialists[1] || 'Internal Medicine',
      hospital: 'Aga Khan University Hospital, Nairobi',
      rating: 4.9,
      experience: '12 years',
      languages: ['English', 'Swahili', 'Arabic'],
      phone: '+254-700-123-456',
      email: 'dr.alrashid@aku.edu',
      matchScore: calculateMatchScore(analysis, user, 'specialist'),
      availability: 'Available tomorrow',
      consultationFee: '$60-90 USD',
      image: 'https://example.com/doctor2.jpg'
    }
  ];

  // Add mental health specialists if needed
  if (isMentalHealth) {
    const mentalHealthDoctors: RecommendedDoctor[] = [
      {
        id: '3',
        name: 'Dr. Kwame Asante',
        specialty: 'Psychiatrist',
        hospital: 'Accra Psychiatric Hospital',
        rating: 4.7,
        experience: '18 years',
        languages: ['English', 'Twi', 'Ga'],
        phone: '+233-244-567-890',
        email: 'dr.asante@aph.gov.gh',
        matchScore: calculateMatchScore(analysis, user, 'mental_health'),
        availability: 'Available this week',
        consultationFee: '$40-70 USD',
        image: 'https://example.com/doctor3.jpg'
      },
      {
        id: '4',
        name: 'Dr. Aisha Mbeki',
        specialty: 'Clinical Psychologist',
        hospital: 'Johannesburg Mental Health Centre',
        rating: 4.6,
        experience: '10 years',
        languages: ['English', 'Zulu', 'Afrikaans'],
        phone: '+27-11-123-4567',
        email: 'dr.mbeki@jmhc.co.za',
        matchScore: calculateMatchScore(analysis, user, 'mental_health'),
        availability: 'Available next week',
        consultationFee: '$45-75 USD',
        image: 'https://example.com/doctor4.jpg'
      }
    ];
    
    doctors.push(...mentalHealthDoctors);
  }

  return doctors.sort((a, b) => b.matchScore - a.matchScore);
};

const generateHospitalRecommendations = (
  analysis: any,
  user: User
): RecommendedHospital[] => {
  const hospitalType = analysis.hospitalType || 'general';
  const isMentalHealth = analysis.mentalHealthAssessment?.riskLevel !== 'low';
  
  const hospitals: RecommendedHospital[] = [
    {
      id: '1',
      name: 'Lagos University Teaching Hospital',
      type: 'University Hospital',
      location: 'Lagos, Nigeria',
      rating: 4.5,
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'General Medicine'],
      languages: ['English', 'Yoruba', 'Igbo'],
      services: ['Emergency Care', '24/7 Service', 'Specialist Consultations'],
      phone: '+234-1-234-5678',
      website: 'www.luth.edu.ng',
      matchScore: 92,
      distance: '5.2 km',
      estimatedCost: '$100-300 USD'
    },
    {
      id: '2',
      name: 'Aga Khan University Hospital',
      type: 'Private Hospital',
      location: 'Nairobi, Kenya',
      rating: 4.8,
      specialties: ['Internal Medicine', 'Surgery', 'Pediatrics', 'Orthopedics'],
      languages: ['English', 'Swahili'],
      services: ['International Standards', 'Advanced Diagnostics', 'Telemedicine'],
      phone: '+254-20-366-2000',
      website: 'www.aku.edu',
      matchScore: 89,
      distance: '12.1 km',
      estimatedCost: '$200-500 USD'
    }
  ];

  // Add mental health facilities if needed
  if (isMentalHealth) {
    const mentalHealthFacilities: RecommendedHospital[] = [
      {
        id: '3',
        name: 'Accra Psychiatric Hospital',
        type: 'Mental Health Facility',
        location: 'Accra, Ghana',
        rating: 4.3,
        specialties: ['Psychiatry', 'Psychology', 'Addiction Treatment', 'Counseling'],
        languages: ['English', 'Twi', 'Ga'],
        services: ['Inpatient Care', 'Outpatient Services', 'Crisis Intervention'],
        phone: '+233-30-222-1234',
        website: 'www.aph.gov.gh',
        matchScore: 87,
        distance: '8.5 km',
        estimatedCost: '$50-150 USD'
      },
      {
        id: '4',
        name: 'Johannesburg Mental Health Centre',
        type: 'Mental Health Clinic',
        location: 'Johannesburg, South Africa',
        rating: 4.4,
        specialties: ['Mental Health', 'Therapy', 'Psychiatric Services', 'Rehabilitation'],
        languages: ['English', 'Zulu', 'Afrikaans', 'Sotho'],
        services: ['Individual Therapy', 'Group Sessions', 'Family Counseling'],
        phone: '+27-11-123-4567',
        website: 'www.jmhc.co.za',
        matchScore: 85,
        distance: '15.3 km',
        estimatedCost: '$80-200 USD'
      }
    ];
    
    hospitals.push(...mentalHealthFacilities);
  }

  return hospitals.sort((a, b) => b.matchScore - a.matchScore);
};

const calculateMatchScore = (
  analysis: any,
  user: User,
  specialistType: 'general' | 'specialist' | 'mental_health'
): number => {
  let score = 70; // Base score
  
  // Adjust based on medical history relevance
  if (user.medicalProfile.medicalConditions.length > 0) {
    score += 10;
  }
  
  // Adjust based on urgency
  switch (analysis.urgencyLevel) {
    case 'emergency':
      score += 20;
      break;
    case 'high':
      score += 15;
      break;
    case 'moderate':
      score += 10;
      break;
    default:
      score += 5;
  }
  
  // Adjust based on specialist type match
  if (specialistType === 'mental_health' && analysis.mentalHealthAssessment?.riskLevel !== 'low') {
    score += 15;
  }
  
  // Random variation for realism
  score += Math.floor(Math.random() * 10);
  
  return Math.min(100, Math.max(60, score));
};

const generateBasicDoctorRecommendations = (symptoms: SymptomInput[]): RecommendedDoctor[] => {
  return [
    {
      id: '1',
      name: 'Dr. Samuel Okafor',
      specialty: 'General Medicine',
      hospital: 'General Hospital Lagos',
      rating: 4.2,
      experience: '8 years',
      languages: ['English', 'Igbo'],
      phone: '+234-123-456-789',
      email: 'dr.okafor@ghl.gov.ng',
      matchScore: 75,
      availability: 'Available',
      consultationFee: '$30-50 USD',
      image: 'https://example.com/doctor-basic.jpg'
    }
  ];
};

const generateBasicHospitalRecommendations = (): RecommendedHospital[] => {
  return [
    {
      id: '1',
      name: 'General Hospital Lagos',
      type: 'Public Hospital',
      location: 'Lagos, Nigeria',
      rating: 4.0,
      specialties: ['General Medicine', 'Emergency Care'],
      languages: ['English', 'Yoruba'],
      services: ['Emergency Care', 'Outpatient Services'],
      phone: '+234-1-234-5678',
      website: 'www.ghl.gov.ng',
      matchScore: 70,
      distance: '10 km',
      estimatedCost: '$20-100 USD'
    }
  ];
};