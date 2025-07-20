import { SymptomInput } from '../types/healthcare';
import { getOpenAITextResponse } from '../api/chat-service';

export interface MentalHealthAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  conditions: string[];
  recommendations: string[];
  urgency: boolean;
  professionalHelp: boolean;
}

export interface MentalHealthProvider {
  id: string;
  name: string;
  type: 'psychiatrist' | 'psychologist' | 'therapist' | 'counselor' | 'social_worker';
  specialty: string[];
  location: string;
  hospital?: string;
  rating: number;
  experience: number;
  languages: string[];
  availability: {
    online: boolean;
    inPerson: boolean;
    emergency: boolean;
  };
  cost: {
    session: number;
    currency: string;
    insurance: boolean;
  };
}

export interface MentalHealthFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'center' | 'rehabilitation' | 'crisis_center';
  services: string[];
  location: string;
  phone: string;
  emergency: boolean;
  rating: number;
  languages: string[];
}

// Sample mental health providers
export const MENTAL_HEALTH_PROVIDERS: MentalHealthProvider[] = [
  {
    id: 'mh1',
    name: 'Dr. Amara Okafor',
    type: 'psychiatrist',
    specialty: ['Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder'],
    location: 'Lagos, Nigeria',
    hospital: 'Lagos University Teaching Hospital',
    rating: 4.8,
    experience: 12,
    languages: ['en', 'yo', 'ig', 'ha'],
    availability: { online: true, inPerson: true, emergency: true },
    cost: { session: 15000, currency: 'NGN', insurance: true }
  },
  {
    id: 'mh2',
    name: 'Dr. Fatima Al-Rashid',
    type: 'psychologist',
    specialty: ['Trauma Therapy', 'Family Counseling', 'Addiction'],
    location: 'Cairo, Egypt',
    hospital: 'Ain Shams University Hospital',
    rating: 4.9,
    experience: 15,
    languages: ['ar', 'en', 'fr'],
    availability: { online: true, inPerson: true, emergency: false },
    cost: { session: 200, currency: 'EGP', insurance: true }
  },
  {
    id: 'mh3',
    name: 'Dr. Kwame Asante',
    type: 'therapist',
    specialty: ['Cognitive Behavioral Therapy', 'Mindfulness', 'Grief Counseling'],
    location: 'Accra, Ghana',
    hospital: 'Korle-Bu Teaching Hospital',
    rating: 4.7,
    experience: 8,
    languages: ['en', 'tw', 'ak'],
    availability: { online: true, inPerson: true, emergency: false },
    cost: { session: 120, currency: 'GHS', insurance: false }
  },
  {
    id: 'mh4',
    name: 'Dr. Zara Mwangi',
    type: 'psychiatrist',
    specialty: ['Child Psychiatry', 'ADHD', 'Autism Spectrum'],
    location: 'Nairobi, Kenya',
    hospital: 'Kenyatta National Hospital',
    rating: 4.6,
    experience: 10,
    languages: ['en', 'sw', 'ki'],
    availability: { online: true, inPerson: true, emergency: true },
    cost: { session: 3500, currency: 'KES', insurance: true }
  },
  {
    id: 'mh5',
    name: 'Dr. Thandiwe Ndaba',
    type: 'psychologist',
    specialty: ['Women\'s Mental Health', 'Postpartum Depression', 'Relationship Therapy'],
    location: 'Cape Town, South Africa',
    hospital: 'Groote Schuur Hospital',
    rating: 4.9,
    experience: 14,
    languages: ['en', 'af', 'xh', 'zu'],
    availability: { online: true, inPerson: true, emergency: false },
    cost: { session: 800, currency: 'ZAR', insurance: true }
  }
];

// Sample mental health facilities
export const MENTAL_HEALTH_FACILITIES: MentalHealthFacility[] = [
  {
    id: 'mhf1',
    name: 'African Centre for Mental Health',
    type: 'center',
    services: ['Counseling', 'Crisis Intervention', 'Group Therapy', 'Psychiatric Care'],
    location: 'Lagos, Nigeria',
    phone: '+234-1-234-5678',
    emergency: true,
    rating: 4.7,
    languages: ['en', 'yo', 'ig', 'ha']
  },
  {
    id: 'mhf2',
    name: 'Cairo Mental Health Clinic',
    type: 'clinic',
    services: ['Individual Therapy', 'Family Counseling', 'Medication Management'],
    location: 'Cairo, Egypt',
    phone: '+20-2-1234-5678',
    emergency: false,
    rating: 4.5,
    languages: ['ar', 'en', 'fr']
  },
  {
    id: 'mhf3',
    name: 'Ubuntu Wellness Center',
    type: 'center',
    services: ['Traditional Healing', 'Modern Therapy', 'Community Support'],
    location: 'Johannesburg, South Africa',
    phone: '+27-11-123-4567',
    emergency: true,
    rating: 4.8,
    languages: ['en', 'zu', 'xh', 'af', 'st']
  },
  {
    id: 'mhf4',
    name: 'East Africa Mental Health Hospital',
    type: 'hospital',
    services: ['Inpatient Care', 'Emergency Psychiatry', 'Rehabilitation'],
    location: 'Nairobi, Kenya',
    phone: '+254-20-123-4567',
    emergency: true,
    rating: 4.6,
    languages: ['en', 'sw', 'ki']
  }
];

export const assessMentalHealth = async (symptoms: SymptomInput[], medicalHistory: any): Promise<MentalHealthAssessment> => {
  try {
    const symptomTexts = symptoms.map(s => s.content).join('. ');
    
    const prompt = `As a mental health AI assistant, analyze these symptoms and medical history to provide a mental health assessment:

Symptoms: ${symptomTexts}

Medical History:
- Previous conditions: ${medicalHistory.medicalConditions?.join(', ') || 'None listed'}
- Current medications: ${medicalHistory.medications?.join(', ') || 'None listed'}
- Allergies: ${medicalHistory.allergies?.join(', ') || 'None listed'}

Please provide a structured assessment in this JSON format:
{
  "riskLevel": "low|moderate|high|critical",
  "conditions": ["list of potential mental health conditions"],
  "recommendations": ["list of specific recommendations"],
  "urgency": boolean (true if immediate attention needed),
  "professionalHelp": boolean (true if professional help recommended)
}

Consider factors like:
- Mentions of suicidal thoughts, self-harm (critical risk)
- Symptoms of depression, anxiety, trauma
- Impact on daily functioning
- Duration and severity of symptoms
- Cultural and social context in African healthcare

Focus on:
1. Depression indicators
2. Anxiety symptoms
3. Trauma/PTSD signs
4. Substance abuse mentions
5. Social isolation
6. Sleep disturbances
7. Appetite changes
8. Cognitive difficulties`;

    const response = await getOpenAITextResponse([{ role: "user", content: prompt }]);
    
    try {
      // Try to parse JSON response
      const assessment = JSON.parse(response);
      return assessment;
    } catch {
      // Fallback if JSON parsing fails
      return {
        riskLevel: 'moderate',
        conditions: ['General mental health concerns'],
        recommendations: [
          'Consider speaking with a mental health professional',
          'Practice stress management techniques',
          'Maintain social connections',
          'Ensure adequate sleep and exercise'
        ],
        urgency: false,
        professionalHelp: true
      };
    }
  } catch (error) {
    console.error('Mental health assessment error:', error);
    return {
      riskLevel: 'moderate',
      conditions: ['Assessment unavailable'],
      recommendations: ['Please consult with a mental health professional'],
      urgency: false,
      professionalHelp: true
    };
  }
};

export const recommendMentalHealthProviders = (
  assessment: MentalHealthAssessment,
  location: string = '',
  language: string = 'en'
): MentalHealthProvider[] => {
  let providers = [...MENTAL_HEALTH_PROVIDERS];

  // Filter by language support
  providers = providers.filter(provider => 
    provider.languages.includes(language) || provider.languages.includes('en')
  );

  // Filter by location if specified
  if (location) {
    providers = providers.filter(provider => 
      provider.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Prioritize based on assessment
  providers = providers.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Emergency availability for critical cases
    if (assessment.riskLevel === 'critical') {
      if (a.availability.emergency) scoreA += 10;
      if (b.availability.emergency) scoreB += 10;
    }

    // Psychiatrist for severe cases
    if (['high', 'critical'].includes(assessment.riskLevel)) {
      if (a.type === 'psychiatrist') scoreA += 5;
      if (b.type === 'psychiatrist') scoreB += 5;
    }

    // Specialty matching
    assessment.conditions.forEach(condition => {
      if (a.specialty.some(spec => spec.toLowerCase().includes(condition.toLowerCase()))) {
        scoreA += 3;
      }
      if (b.specialty.some(spec => spec.toLowerCase().includes(condition.toLowerCase()))) {
        scoreB += 3;
      }
    });

    // Rating and experience
    scoreA += a.rating + (a.experience * 0.1);
    scoreB += b.rating + (b.experience * 0.1);

    return scoreB - scoreA;
  });

  return providers.slice(0, 5); // Return top 5 matches
};

export const recommendMentalHealthFacilities = (
  assessment: MentalHealthAssessment,
  location: string = '',
  language: string = 'en'
): MentalHealthFacility[] => {
  let facilities = [...MENTAL_HEALTH_FACILITIES];

  // Filter by language support
  facilities = facilities.filter(facility => 
    facility.languages.includes(language) || facility.languages.includes('en')
  );

  // Filter by location if specified
  if (location) {
    facilities = facilities.filter(facility => 
      facility.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Prioritize based on assessment
  facilities = facilities.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Emergency facilities for critical cases
    if (assessment.riskLevel === 'critical' && assessment.urgency) {
      if (a.emergency) scoreA += 10;
      if (b.emergency) scoreB += 10;
    }

    // Hospital facilities for severe cases
    if (['high', 'critical'].includes(assessment.riskLevel)) {
      if (a.type === 'hospital') scoreA += 5;
      if (b.type === 'hospital') scoreB += 5;
    }

    // Rating
    scoreA += a.rating;
    scoreB += b.rating;

    return scoreB - scoreA;
  });

  return facilities.slice(0, 3); // Return top 3 matches
};

export const getMentalHealthCrisisResources = (language: string = 'en') => {
  const resources = {
    en: {
      title: 'Crisis Resources',
      subtitle: 'Immediate help available 24/7',
      resources: [
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          description: 'Free, confidential crisis support 24/7'
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          description: 'Free, 24/7 crisis support via text'
        },
        {
          name: 'Emergency Services',
          phone: '911',
          description: 'For immediate life-threatening emergencies'
        }
      ]
    },
    sw: {
      title: 'Rasilimali za Msaada wa Haraka',
      subtitle: 'Msaada wa haraka unapatikana saa 24/7',
      resources: [
        {
          name: 'Mstari wa Kuzuia Kujiua',
          phone: '116',
          description: 'Msaada wa bure, wa siri saa 24/7'
        },
        {
          name: 'Huduma za Dharura',
          phone: '999',
          description: 'Kwa dharura za haraka za hatari ya maisha'
        }
      ]
    },
    ar: {
      title: 'موارد الأزمات',
      subtitle: 'المساعدة الفورية متاحة 24/7',
      resources: [
        {
          name: 'خط منع الانتحار الوطني',
          phone: '123',
          description: 'دعم مجاني وسري للأزمات على مدار الساعة'
        },
        {
          name: 'خدمات الطوارئ',
          phone: '123',
          description: 'للطوارئ الفورية المهددة للحياة'
        }
      ]
    }
  };

  return resources[language as keyof typeof resources] || resources.en;
};