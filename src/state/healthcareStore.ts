import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doctor, Hospital, Recommendation, SymptomInput, Appointment, Message, Conversation } from '../types/healthcare';
import { MentalHealthAssessment } from '../api/healthcare-analysis';
import { languageService } from '../services/language-service';

interface HealthcareState {
  symptoms: SymptomInput[];
  currentAnalysis: string;
  recommendations: Recommendation | null;
  appointments: Appointment[];
  conversations: Conversation[];
  messages: Message[];
  currentLanguage: string;
  mentalHealthAssessment: any | null;
  mentalHealthProviders: any[];
  mentalHealthFacilities: any[];
  
  // Actions
  setSymptoms: (symptoms: SymptomInput[]) => void;
  setAnalysis: (analysis: string) => void;
  setRecommendations: (recommendations: Recommendation) => void;
  bookAppointment: (appointment: Appointment) => void;
  sendMessage: (message: Message) => void;
  setCurrentLanguage: (language: string) => void;
  setMentalHealthAssessment: (assessment: MentalHealthAssessment) => void;
  translateContent: (text: string) => Promise<string>;
  clearCurrentSession: () => void;
}

// Mock data for doctors and hospitals
const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Internal Medicine',
    rating: 4.8,
    experience: 12,
    hospital: 'City General Hospital',
    address: '123 Medical Center Dr, City, ST 12345',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@citygeneral.com',
    availableSlots: [
      { id: '1', date: '2024-01-15', time: '09:00 AM', available: true },
      { id: '2', date: '2024-01-15', time: '10:30 AM', available: true },
      { id: '3', date: '2024-01-16', time: '02:00 PM', available: true },
    ],
    languages: ['English', 'Spanish'],
    costInfo: {
      consultationFee: 200,
      currency: 'USD',
      insuranceCovered: true,
      discounts: [
        {
          type: 'First Visit',
          description: 'New patient discount',
          amount: 50,
          isPercentage: false
        },
        {
          type: 'Insurance',
          description: 'Most insurance plans accepted',
          amount: 80,
          isPercentage: true
        }
      ],
      estimatedTotal: 40,
      paymentOptions: ['Insurance', 'Cash', 'Card', 'Payment Plan']
    }
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    rating: 4.9,
    experience: 15,
    hospital: 'Heart & Vascular Institute',
    address: '456 Cardiac Blvd, City, ST 12345',
    phone: '(555) 234-5678',
    email: 'michael.chen@heartinstitute.com',
    availableSlots: [
      { id: '4', date: '2024-01-17', time: '11:00 AM', available: true },
      { id: '5', date: '2024-01-18', time: '03:30 PM', available: true },
    ],
    languages: ['English', 'Mandarin'],
    costInfo: {
      consultationFee: 350,
      currency: 'USD',
      insuranceCovered: true,
      discounts: [
        {
          type: 'Senior Citizen',
          description: 'For patients 65+',
          amount: 15,
          isPercentage: true
        },
        {
          type: 'Multiple Visits',
          description: 'Package deal for follow-ups',
          amount: 100,
          isPercentage: false
        }
      ],
      estimatedTotal: 70,
      paymentOptions: ['Insurance', 'HSA/FSA', 'Card', 'Payment Plan']
    }
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    rating: 4.7,
    experience: 8,
    hospital: 'Skin Care Medical Center',
    address: '789 Dermatology Way, City, ST 12345',
    phone: '(555) 345-6789',
    email: 'emily.rodriguez@skincare.com',
    availableSlots: [
      { id: '6', date: '2024-01-16', time: '01:00 PM', available: true },
      { id: '7', date: '2024-01-19', time: '09:30 AM', available: true },
    ],
    languages: ['English', 'Spanish'],
    costInfo: {
      consultationFee: 180,
      currency: 'USD',
      insuranceCovered: true,
      discounts: [
        {
          type: 'Student',
          description: 'Student discount with valid ID',
          amount: 25,
          isPercentage: true
        },
        {
          type: 'Community Health',
          description: 'Free screenings available',
          amount: 180,
          isPercentage: false
        }
      ],
      estimatedTotal: 30,
      paymentOptions: ['Insurance', 'Cash', 'Card', 'Sliding Scale']
    }
  }
];

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Medical Center Dr, City, ST 12345',
    phone: '(555) 123-4567',
    website: 'https://citygeneral.com',
    rating: 4.6,
    specialties: ['Emergency Care', 'Internal Medicine', 'Surgery', 'Pediatrics'],
    emergencyServices: true,
    distance: 2.3,
    averageCost: 300,
    acceptedInsurance: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'United Healthcare'],
    financialAssistance: {
      available: true,
      description: 'Income-based payment plans and charity care available. Financial counselors available 24/7.',
      requirements: ['Proof of income', 'Residency verification', 'Application form']
    },
    hours: {
      monday: { open: '6:00 AM', close: '10:00 PM' },
      tuesday: { open: '6:00 AM', close: '10:00 PM' },
      wednesday: { open: '6:00 AM', close: '10:00 PM' },
      thursday: { open: '6:00 AM', close: '10:00 PM' },
      friday: { open: '6:00 AM', close: '10:00 PM' },
      saturday: { open: '8:00 AM', close: '8:00 PM' },
      sunday: { open: '8:00 AM', close: '8:00 PM' }
    },
    services: [
      'Emergency Department',
      'Outpatient Surgery', 
      'Diagnostic Imaging',
      'Laboratory Services',
      'Pharmacy',
      'Physical Therapy',
      'Radiology',
      'Blood Bank',
      'Intensive Care Unit'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Excellent emergency care when I had a heart attack. Staff was professional and caring.',
        date: '2 weeks ago',
        patientType: 'Emergency Patient'
      },
      {
        rating: 4,
        comment: 'Good overall experience. Wait times were reasonable and staff was helpful.',
        date: '1 month ago',
        patientType: 'Outpatient'
      },
      {
        rating: 5,
        comment: 'The surgery team was amazing. Clean facilities and great post-op care.',
        date: '3 weeks ago',
        patientType: 'Surgical Patient'
      }
    ]
  },
  {
    id: '2',
    name: 'Heart & Vascular Institute',
    address: '456 Cardiac Blvd, City, ST 12345',
    phone: '(555) 234-5678',
    website: 'https://heartvascular.org',
    rating: 4.8,
    specialties: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery', 'Interventional Cardiology'],
    emergencyServices: false,
    distance: 3.1,
    averageCost: 450,
    acceptedInsurance: ['Medicare', 'Blue Cross', 'Cigna', 'Humana', 'Kaiser Permanente'],
    financialAssistance: {
      available: true,
      description: 'Heart disease patient assistance program with up to 50% reduction for qualifying patients.',
      requirements: ['Medical necessity verification', 'Financial hardship documentation']
    },
    hours: {
      monday: { open: '7:00 AM', close: '6:00 PM' },
      tuesday: { open: '7:00 AM', close: '6:00 PM' },
      wednesday: { open: '7:00 AM', close: '6:00 PM' },
      thursday: { open: '7:00 AM', close: '6:00 PM' },
      friday: { open: '7:00 AM', close: '5:00 PM' },
      saturday: { open: '8:00 AM', close: '2:00 PM' }
    },
    services: [
      'Cardiac Catheterization',
      'Echocardiography',
      'Stress Testing',
      'Holter Monitoring',
      'Vascular Ultrasound',
      'Cardiac Rehabilitation',
      'Pacemaker Services',
      'Heart Surgery'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'World-class cardiac care. Dr. Martinez saved my life with bypass surgery.',
        date: '1 week ago',
        patientType: 'Cardiac Surgery Patient'
      },
      {
        rating: 5,
        comment: 'Specialized care you cannot find elsewhere. Highly recommend for heart conditions.',
        date: '2 weeks ago',
        patientType: 'Cardiology Patient'
      }
    ]
  },
  {
    id: '3',
    name: 'Regional Medical Center',
    address: '321 Healthcare Ave, City, ST 12345',
    phone: '(555) 456-7890',
    website: 'https://regionalmed.org',
    rating: 4.5,
    specialties: ['Emergency Care', 'Trauma', 'Orthopedics', 'Neurology', 'Women\'s Health'],
    emergencyServices: true,
    distance: 1.8,
    averageCost: 250,
    acceptedInsurance: ['Medicare', 'Medicaid', 'Most major insurance plans', 'Self-pay accepted'],
    financialAssistance: {
      available: true,
      description: 'Community health center with sliding fee scale based on income. No one turned away for inability to pay.',
      requirements: ['Income verification', 'Local residency (optional for emergency care)']
    },
    hours: {
      monday: { open: '6:00 AM', close: '11:00 PM' },
      tuesday: { open: '6:00 AM', close: '11:00 PM' },
      wednesday: { open: '6:00 AM', close: '11:00 PM' },
      thursday: { open: '6:00 AM', close: '11:00 PM' },
      friday: { open: '6:00 AM', close: '11:00 PM' },
      saturday: { open: '7:00 AM', close: '9:00 PM' },
      sunday: { open: '8:00 AM', close: '8:00 PM' }
    },
    services: [
      'Level II Trauma Center',
      'Emergency Department',
      'Orthopedic Surgery',
      'Neurology Services',
      'Women\'s Health Center',
      'Maternity Services',
      'Pediatric Care',
      'Urgent Care',
      'Rehabilitation Services'
    ],
    reviews: [
      {
        rating: 4,
        comment: 'Great trauma care when I had my accident. Quick response and excellent doctors.',
        date: '1 month ago',
        patientType: 'Trauma Patient'
      },
      {
        rating: 5,
        comment: 'Wonderful maternity ward. Nurses were incredible during my delivery.',
        date: '3 weeks ago',
        patientType: 'Maternity Patient'
      },
      {
        rating: 4,
        comment: 'Good community hospital. Affordable care and they work with you on payment.',
        date: '2 months ago',
        patientType: 'General Patient'
      }
    ]
  }
];

export const useHealthcareStore = create<HealthcareState>()(
  persist(
    (set, get) => ({
      symptoms: [],
      currentAnalysis: '',
      recommendations: null,
      mentalHealthAssessment: null,
      mentalHealthProviders: [],
      mentalHealthFacilities: [],
      currentLanguage: 'en',
      appointments: [
        {
          id: 'apt1',
          doctorId: '1',
          patientId: 'current-user',
          date: '2024-01-20',
          time: '10:00 AM',
          status: 'completed',
          symptoms: 'Headache, fatigue, and occasional dizziness',
          notes: 'Follow-up needed in 2 weeks'
        },
        {
          id: 'apt2',
          doctorId: '2',
          patientId: 'current-user',
          date: '2024-01-25',
          time: '02:30 PM',
          status: 'cancelled',
          symptoms: 'Chest pain during exercise',
          notes: 'Patient cancelled due to scheduling conflict'
        },
        {
          id: 'apt3',
          doctorId: '1',
          patientId: 'current-user',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
          time: '09:00 AM',
          status: 'confirmed',
          symptoms: 'Regular checkup and blood work review',
          notes: 'Bring recent lab results'
        },
        {
          id: 'apt4',
          doctorId: '3',
          patientId: 'current-user',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
          time: '11:30 AM',
          status: 'pending',
          symptoms: 'Skin rash on arms and legs',
          notes: 'Initial dermatology consultation'
        }
      ],
      conversations: [
        {
          id: 'conv1',
          doctorId: '1',
          patientId: 'current-user',
          lastMessage: {
            id: 'msg1',
            senderId: '1',
            receiverId: 'current-user',
            content: 'Thank you for booking your appointment. Please arrive 15 minutes early.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            type: 'text'
          },
          unreadCount: 1,
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'conv2',
          doctorId: '2',
          patientId: 'current-user',
          lastMessage: {
            id: 'msg2',
            senderId: 'current-user',
            receiverId: '2',
            content: 'I have a question about my recent test results.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            type: 'text'
          },
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      messages: [
        {
          id: 'msg1',
          senderId: '1',
          receiverId: 'current-user',
          content: 'Thank you for booking your appointment. Please arrive 15 minutes early.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg2',
          senderId: 'current-user',
          receiverId: '2',
          content: 'I have a question about my recent test results.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        }
      ],

      setSymptoms: (symptoms) => {
        set({ symptoms });
      },

      setAnalysis: (analysis) => {
        set({ currentAnalysis: analysis });
      },

      setRecommendations: (recommendations) => {
        set({ recommendations });
      },

      bookAppointment: (appointment) => {
        set(state => ({
          appointments: [...state.appointments, appointment]
        }));
      },

      sendMessage: (message) => {
        set(state => {
          const updatedMessages = [...state.messages, message];
          
          // Update or create conversation
          const existingConvIndex = state.conversations.findIndex(
            conv => conv.doctorId === message.receiverId || conv.doctorId === message.senderId
          );
          
          let updatedConversations = [...state.conversations];
          
          if (existingConvIndex >= 0) {
            updatedConversations[existingConvIndex] = {
              ...updatedConversations[existingConvIndex],
              lastMessage: message,
              updatedAt: message.timestamp,
              unreadCount: message.senderId !== 'current-user' ? 
                updatedConversations[existingConvIndex].unreadCount + 1 : 0
            };
          } else {
            const doctorId = message.receiverId !== 'current-user' ? message.receiverId : message.senderId;
            updatedConversations.push({
              id: Date.now().toString(),
              doctorId,
              patientId: 'current-user',
              lastMessage: message,
              unreadCount: message.senderId !== 'current-user' ? 1 : 0,
              updatedAt: message.timestamp
            });
          }
          
          return {
            messages: updatedMessages,
            conversations: updatedConversations
          };
        });
      },

      clearCurrentSession: () => {
        set({
          symptoms: [],
          currentAnalysis: '',
          recommendations: null
        });
      },

      setMentalHealthAssessment: (assessment) => {
        set({ mentalHealthAssessment: assessment });
      },

      setMentalHealthProviders: (providers) => {
        set({ mentalHealthProviders: providers });
      },

      setMentalHealthFacilities: (facilities) => {
        set({ mentalHealthFacilities: facilities });
      },

      setCurrentLanguage: (language) => {
        set({ currentLanguage: language });
        languageService.setCurrentLanguage(language);
      },

      translateContent: async (text) => {
        const { currentLanguage } = get();
        if (currentLanguage === 'en') return text;
        
        try {
          return await languageService.translateText(text, currentLanguage);
        } catch (error) {
          console.error('Translation error:', error);
          return text;
        }
      }
    }),
    {
      name: 'healthcare-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper functions to get mock data
export const getMockDoctors = () => mockDoctors;
export const getMockHospitals = () => mockHospitals;
export const getDoctorById = (id: string) => mockDoctors.find(doc => doc.id === id);
export const getHospitalById = (id: string) => mockHospitals.find(hospital => hospital.id === id);