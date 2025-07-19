import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types/healthcare';
import { useHealthcareStore, getDoctorById } from '../state/healthcareStore';
import { useAuthStore } from '../state/authStore';


interface ChatScreenProps {
  doctorId: string;
  onBack: () => void;
}

export default function ChatScreen({ doctorId, onBack }: ChatScreenProps) {
  const { user } = useAuthStore();
  const { messages, sendMessage } = useHealthcareStore();
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const doctor = getDoctorById(doctorId);
  const chatMessages = messages.filter(
    msg => (msg.senderId === doctorId || msg.receiverId === doctorId) ||
           (msg.senderId === user?.id || msg.receiverId === user?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    // Simulate doctor responses for demo
    if (chatMessages.length === 1 && chatMessages[0].senderId === user?.id) {
      setTimeout(() => {
        const response: Message = {
          id: Date.now().toString(),
          senderId: doctorId,
          receiverId: user?.id || '',
          content: `Thank you for booking an appointment! I've reviewed your symptoms and medical history. I look forward to our consultation. Please arrive 15 minutes early to complete any necessary paperwork.`,
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        sendMessage(response);
      }, 2000);
    }
  }, [chatMessages.length]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: doctorId,
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    sendMessage(message);
    setMessageText('');

    // Simulate doctor response after a delay
    setTimeout(() => {
      const responses = [
        "Thank you for your message. I'll review this information before our appointment.",
        "I understand your concerns. We'll discuss this in detail during your visit.",
        "That's helpful information. Please continue monitoring your symptoms.",
        "I appreciate you providing those details. See you at your appointment.",
        "Thanks for reaching out. If this becomes urgent, please call our office directly."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response: Message = {
        id: Date.now().toString(),
        senderId: doctorId,
        receiverId: user.id,
        content: randomResponse,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      sendMessage(response);
    }, 1500 + Math.random() * 3000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!doctor) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Doctor not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              className="mr-4 p-2 -ml-2"
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                Dr. {doctor.name}
              </Text>
              <Text className="text-sm text-gray-600">
                {doctor.specialty} • {doctor.hospital}
              </Text>
            </View>
            
            <Pressable 
              className="p-2"
              onPress={() => {
                // Video call functionality - would integrate with video calling service
                alert(`Starting video call with Dr. ${doctor.name}...`);
              }}
            >
              <Ionicons name="videocam-outline" size={24} color="#2E7D32" />
            </Pressable>
            
            <Pressable 
              className="p-2 ml-2"
              onPress={() => {
                // Phone call functionality - would integrate with calling service
                alert(`Calling Dr. ${doctor.name} at ${doctor.phone || '(555) 123-4567'}...`);
              }}
            >
              <Ionicons name="call-outline" size={24} color="#FBC02D" />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {chatMessages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <View className="bg-white rounded-full p-4 mb-4">
                <Ionicons name="chatbubbles-outline" size={48} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Start a conversation
              </Text>
              <Text className="text-gray-600 text-center">
                Send a message to Dr. {doctor.name} about your appointment or health concerns
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {chatMessages.map((message, index) => {
                const isCurrentUser = message.senderId === user?.id;
                const showDate = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(chatMessages[index - 1].timestamp);
                
                return (
                  <View key={message.id}>
                    {showDate && (
                      <View className="items-center my-4">
                        <Text className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full">
                          {formatDate(message.timestamp)}
                        </Text>
                      </View>
                    )}
                    
                    <View className={isCurrentUser ? "flex-row justify-end" : "flex-row justify-start"}>
                      <View style={isCurrentUser 
                        ? {
                            maxWidth: '80%',
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: '#2E7D32',
                            borderBottomRightRadius: 4
                          }
                        : {
                            maxWidth: '80%',
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: 'white',
                            borderBottomLeftRadius: 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                            borderWidth: 1,
                            borderColor: '#F3F4F6'
                          }
                      }>
                        {message.type === 'appointment' && (
                          <View className="flex-row items-center mb-2">
                            <Ionicons 
                              name="calendar-outline" 
                              size={16} 
                              color={isCurrentUser ? "white" : "#3B82F6"} 
                            />
                            <Text className={isCurrentUser ? "text-sm font-medium ml-1 text-blue-100" : "text-sm font-medium ml-1 text-blue-600"}>
                              Appointment Booking
                            </Text>
                          </View>
                        )}
                        
                        <Text className={isCurrentUser ? "text-base leading-relaxed text-white" : "text-base leading-relaxed text-gray-900"}>
                          {message.content}
                        </Text>
                        
                        <Text className={isCurrentUser ? "text-xs mt-2 text-blue-100" : "text-xs mt-2 text-gray-500"}>
                          {formatTime(message.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-white px-4 py-4 border-t border-gray-200">
          <View className="flex-row items-end space-x-3">
            <Pressable className="p-3 bg-gray-100 rounded-full">
              <Ionicons name="attach-outline" size={20} color="#6B7280" />
            </Pressable>
            
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
              <TextInput
                className="text-gray-900 max-h-24"
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                textAlignVertical="top"
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
                blurOnSubmit={false}
              />
            </View>
            
            <Pressable 
              className="p-3 bg-gray-100 rounded-full"
              onPress={() => {
                Alert.alert('Voice Message', 'Voice recording feature would be implemented here');
              }}
            >
              <Ionicons name="mic-outline" size={20} color="#6B7280" />
            </Pressable>
            
            <Pressable
              style={{
                borderRadius: 20,
                padding: 12,
                backgroundColor: messageText.trim() ? '#2E7D32' : '#D1D5DB'
              }}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color="white" 
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}