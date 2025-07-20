export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  address?: {
    country: string;
    city: string;
  };
  medicalProfile: MedicalProfile;
  createdAt: string;
}

export interface MedicalProfile {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  emergencyContact2?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
  preferredLanguage: string;
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'heavy';
}

export interface SymptomInput {
  id: string;
  type: 'text' | 'voice' | 'image';
  content: string;
  imageUri?: string;
  voiceUri?: string;
  timestamp: string;
  aiSummary?: string;
}

export interface CostInfo {
  consultationFee: number;
  currency: string;
  insuranceCovered: boolean;
  discounts: {
    type: string;
    description: string;
    amount: number;
    isPercentage: boolean;
  }[];
  estimatedTotal: number;
  paymentOptions: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  hospital: string;
  address: string;
  phone: string;
  email: string;
  profileImage?: string;
  availableSlots: AppointmentSlot[];
  languages: string[];
  costInfo: CostInfo;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  specialties: string[];
  emergencyServices: boolean;
  imageUri?: string;
  distance?: number;
  averageCost: number;
  acceptedInsurance: string[];
  financialAssistance: {
    available: boolean;
    description: string;
    requirements: string[];
  };
  website?: string;
  hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  services?: string[];
  reviews?: {
    rating: number;
    comment: string;
    date: string;
    patientType?: string;
  }[];
}

export interface Recommendation {
  doctors: RecommendedDoctor[];
  hospitals: RecommendedHospital[];
  reasoning: string;
  confidence: number;
}

export interface RecommendedDoctor extends Doctor {
  matchScore: number;
  matchReason: string;
}

export interface RecommendedHospital extends Hospital {
  matchScore: number;
  matchReason: string;
}

export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  symptoms: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'appointment' | 'image';
  appointmentId?: string;
  imageUri?: string;
}

export interface Conversation {
  id: string;
  doctorId: string;
  patientId: string;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}