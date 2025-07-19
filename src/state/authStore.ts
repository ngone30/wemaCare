import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/healthcare';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  ensureMedicalProfile: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock login - in a real app, you'd authenticate with a backend
        if (email && password) {
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
            medicalProfile: {
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
            },
            createdAt: new Date().toISOString()
          };
          
          set({ user: mockUser, isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: async (email: string, password: string, name: string) => {
        // Mock signup
        if (email && password && name) {
          const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            medicalProfile: {
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
            },
            createdAt: new Date().toISOString()
          };
          
          set({ user: newUser, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },

      // Helper to ensure user has complete medical profile structure
      ensureMedicalProfile: () => {
        const currentUser = get().user;
        if (currentUser && !currentUser.medicalProfile) {
          const defaultProfile = {
            dateOfBirth: '',
            gender: 'male' as const,
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
            smokingStatus: 'never' as const,
            alcoholConsumption: 'none' as const,
            exerciseFrequency: 'moderate' as const
          };
          
          set({ 
            user: { 
              ...currentUser, 
              medicalProfile: defaultProfile 
            } 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);