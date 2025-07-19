import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doctor, Hospital, Recommendation, SymptomInput, Appointment, Message, Conversation } from '../types/healthcare';

interface HealthcareState {
  symptoms: SymptomInput[];
  currentAnalysis: string;
  recommendations: Recommendation | null;
  appointments: Appointment[];
  conversations: Conversation[];
  messages: Message[];
  
  // Actions
  setSymptoms: (symptoms: SymptomInput[]) => void;
  setAnalysis: (analysis: string) => void;
  setRecommendations: (recommendations: Recommendation) => void;
  bookAppointment: (appointment: Appointment) => void;
  sendMessage: (message: Message) => void;
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
    languages: ['English', 'Spanish']
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
    languages: ['English', 'Mandarin']
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
    languages: ['English', 'Spanish']
  }
];

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Medical Center Dr, City, ST 12345',
    phone: '(555) 123-4567',
    rating: 4.6,
    specialties: ['Emergency Care', 'Internal Medicine', 'Surgery', 'Pediatrics'],
    emergencyServices: true,
    distance: 2.3
  },
  {
    id: '2',
    name: 'Heart & Vascular Institute',
    address: '456 Cardiac Blvd, City, ST 12345',
    phone: '(555) 234-5678',
    rating: 4.8,
    specialties: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery'],
    emergencyServices: false,
    distance: 3.1
  },
  {
    id: '3',
    name: 'Regional Medical Center',
    address: '321 Healthcare Ave, City, ST 12345',
    phone: '(555) 456-7890',
    rating: 4.5,
    specialties: ['Emergency Care', 'Trauma', 'Orthopedics', 'Neurology'],
    emergencyServices: true,
    distance: 1.8
  }
];

export const useHealthcareStore = create<HealthcareState>()(
  persist(
    (set, get) => ({
      symptoms: [],
      currentAnalysis: '',
      recommendations: null,
      appointments: [],
      conversations: [],
      messages: [],

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