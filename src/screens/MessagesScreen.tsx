import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthcareStore, getDoctorById } from '../state/healthcareStore';
import { cn } from '../utils/cn';

interface MessagesScreenProps {
  onBack: () => void;
  onSelectConversation: (doctorId: string) => void;
}

export default function MessagesScreen({ onBack, onSelectConversation }: MessagesScreenProps) {
  const { conversations } = useHealthcareStore();

  const sortedConversations = conversations
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getDoctorSpecialty = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? doctor.specialty : '';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              className="mr-4 p-2 -ml-2"
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">Messages</Text>
              <Text className="text-gray-600">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable className="p-2">
              <Ionicons name="create-outline" size={24} color="#3B82F6" />
            </Pressable>
          </View>
        </View>

        {/* Conversations List */}
        {sortedConversations.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className="bg-gray-100 rounded-full p-6 mb-6">
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
              No Messages Yet
            </Text>
            <Text className="text-gray-600 text-center leading-relaxed">
              Your conversations with healthcare providers will appear here. Start by booking an appointment or getting symptom recommendations.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="py-2">
              {sortedConversations.map((conversation) => (
                <Pressable
                  key={conversation.id}
                  className="px-6 py-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => onSelectConversation(conversation.doctorId)}
                >
                  <View className="flex-row items-center">
                    {/* Doctor Avatar */}
                    <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                      <Text className="text-white font-semibold text-lg">
                        {getDoctorName(conversation.doctorId).charAt(0)}
                      </Text>
                    </View>

                    {/* Conversation Details */}
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-gray-900 font-semibold text-lg">
                          Dr. {getDoctorName(conversation.doctorId).split(' ').slice(1).join(' ')}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {formatTime(conversation.updatedAt)}
                        </Text>
                      </View>
                      
                      <Text className="text-blue-600 text-sm font-medium mb-2">
                        {getDoctorSpecialty(conversation.doctorId)}
                      </Text>
                      
                      <View className="flex-row items-center justify-between">
                        <Text 
                          className="text-gray-600 flex-1 mr-2" 
                          numberOfLines={1}
                        >
                          {conversation.lastMessage.type === 'appointment' && (
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                          )}
                          {conversation.lastMessage.content}
                        </Text>
                        
                        {conversation.unreadCount > 0 && (
                          <View className="bg-blue-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center">
                            <Text className="text-white text-xs font-medium">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Arrow */}
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Floating Action Button - Future feature for starting new conversations */}
        {sortedConversations.length > 0 && (
          <View className="absolute bottom-6 right-6">
            <Pressable className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
              <Ionicons name="add" size={28} color="white" />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}