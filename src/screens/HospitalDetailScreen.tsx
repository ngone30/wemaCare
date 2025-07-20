import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecommendedHospital } from '../types/healthcare';
import AppHeader from '../components/AppHeader';

interface HospitalDetailScreenProps {
  hospital: RecommendedHospital;
  onBack: () => void;
}

export default function HospitalDetailScreen({ hospital, onBack }: HospitalDetailScreenProps) {
  const [showDirections, setShowDirections] = useState(false);

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWebsite = () => {
    const websiteUrl = hospital.website || `https://www.${hospital.name.toLowerCase().replace(/\s+/g, '')}.com`;
    Linking.openURL(websiteUrl);
  };

  const getDirections = () => {
    const address = encodeURIComponent(hospital.address);
    const mapsUrl = `https://maps.google.com/maps?q=${address}`;
    Linking.openURL(mapsUrl);
  };

  const InfoCard = ({ 
    icon, 
    title, 
    children, 
    backgroundColor = '#FFFFFF',
    borderColor = '#E5E7EB'
  }: {
    icon: string;
    title: string;
    children: React.ReactNode;
    backgroundColor?: string;
    borderColor?: string;
  }) => (
    <View style={{
      backgroundColor,
      borderColor,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <View style={{
          backgroundColor: '#E8F5E8',
          borderRadius: 20,
          padding: 8,
          marginRight: 12
        }}>
          <Ionicons name={icon as any} size={20} color="#2E7D32" />
        </View>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#111827'
        }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  const formatHours = (hours: any) => {
    if (!hours) return "Hours not available";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      if (dayHours) {
        return `${dayNames[index]}: ${dayHours.open} - ${dayHours.close}`;
      }
      return `${dayNames[index]}: Closed`;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <AppHeader 
        title={hospital.name}
        showBackButton
        onBack={onBack}
        rightComponent={
          <Pressable
            style={{ padding: 8 }}
            onPress={() => makePhoneCall(hospital.phone)}
          >
            <Ionicons name="call" size={24} color="#2E7D32" />
          </Pressable>
        }
      />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hospital Header Info */}
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 8
              }}>
                {hospital.name}
              </Text>
              
              {hospital.emergencyServices && (
                <View style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FF7043',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  alignSelf: 'flex-start',
                  marginBottom: 8
                }}>
                  <Text style={{
                    color: '#FF7043',
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    🚨 24/7 Emergency Services
                  </Text>
                </View>
              )}
            </View>
            
            <View style={{
              backgroundColor: '#E8F5E8',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <Text style={{
                color: '#2E7D32',
                fontWeight: '600',
                fontSize: 16
              }}>
                {hospital.matchScore}% Match
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <Ionicons name="star" size={16} color="#FBC02D" />
            <Text style={{
              color: '#374151',
              marginLeft: 4,
              fontSize: 16
            }}>
              {hospital.rating} • {hospital.distance} miles away
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16
          }}>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
            <Text style={{
              color: '#6B7280',
              marginLeft: 4,
              flex: 1,
              lineHeight: 20
            }}>
              {hospital.address}
            </Text>
          </View>

          <Text style={{
            fontSize: 16,
            fontStyle: 'italic',
            color: '#374151',
            backgroundColor: '#F9FAFB',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#2E7D32'
          }}>
            "{hospital.matchReason}"
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Quick Actions */}
          <InfoCard icon="call-outline" title="Contact Information">
            <View style={{ gap: 16 }}>
              <Pressable
                style={{
                  backgroundColor: '#2E7D32',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() => makePhoneCall(hospital.phone)}
              >
                <Ionicons name="call" size={20} color="white" />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  marginLeft: 8,
                  fontSize: 16
                }}>
                  Call {hospital.phone}
                </Text>
              </Pressable>
              
              <View style={{
                flexDirection: 'row',
                gap: 12
              }}>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: '#FBC02D',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={getDirections}
                >
                  <Ionicons name="navigate" size={18} color="white" />
                  <Text style={{
                    color: 'white',
                    fontWeight: '500',
                    marginLeft: 6
                  }}>
                    Directions
                  </Text>
                </Pressable>
                
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: '#FF8E53',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={openWebsite}
                >
                  <Ionicons name="globe" size={18} color="white" />
                  <Text style={{
                    color: 'white',
                    fontWeight: '500',
                    marginLeft: 6
                  }}>
                    Website
                  </Text>
                </Pressable>
              </View>
            </View>
          </InfoCard>

          {/* Specialties */}
          <InfoCard icon="medical-outline" title="Medical Specialties">
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {hospital.specialties.map((specialty, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#E8F5E8',
                    borderColor: '#2E7D32',
                    borderWidth: 1,
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6
                  }}
                >
                  <Text style={{
                    color: '#2E7D32',
                    fontSize: 14,
                    fontWeight: '500'
                  }}>
                    {specialty}
                  </Text>
                </View>
              ))}
            </View>
          </InfoCard>

          {/* Cost & Insurance */}
          <InfoCard 
            icon="card-outline" 
            title="Cost & Insurance"
            backgroundColor="#FFF8E1"
            borderColor="#FBC02D"
          >
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#F57C00',
                  marginBottom: 8
                }}>
                  Average Cost: ${hospital.averageCost}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  lineHeight: 20
                }}>
                  Costs may vary based on specific treatments and insurance coverage
                </Text>
              </View>
              
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#2E7D32',
                  marginBottom: 8
                }}>
                  Insurance Accepted:
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 6
                }}>
                  {hospital.acceptedInsurance.map((insurance, index) => (
                    <Text
                      key={index}
                      style={{
                        backgroundColor: '#E8F5E8',
                        color: '#2E7D32',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: '500'
                      }}
                    >
                      {insurance}
                    </Text>
                  ))}
                </View>
              </View>

              {hospital.financialAssistance.available && (
                <View style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 8,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2E7D32'
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#2E7D32',
                    marginBottom: 4
                  }}>
                    💚 Financial Assistance Available
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#16A34A',
                    lineHeight: 18
                  }}>
                    {hospital.financialAssistance.description}
                  </Text>
                </View>
              )}
            </View>
          </InfoCard>

          {/* Hours */}
          <InfoCard icon="time-outline" title="Operating Hours">
            <View style={{ gap: 8 }}>
              {hospital.hours ? formatHours(hospital.hours).map((dayHour, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 4
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {dayHour.split(':')[0]}:
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280'
                  }}>
                    {dayHour.split(':').slice(1).join(':')}
                  </Text>
                </View>
              )) : (
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  fontStyle: 'italic'
                }}>
                  Operating hours not available. Please call for current hours.
                </Text>
              )}
              
              {hospital.emergencyServices && (
                <View style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#FF7043'
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#DC2626',
                    marginBottom: 4
                  }}>
                    🚨 Emergency Department: 24/7
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#991B1B'
                  }}>
                    Emergency services available around the clock
                  </Text>
                </View>
              )}
            </View>
          </InfoCard>

          {/* Services & Facilities */}
          <InfoCard icon="business-outline" title="Services & Facilities">
            <View style={{ gap: 12 }}>
              {hospital.services && hospital.services.length > 0 ? (
                hospital.services.map((service, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                    <Text style={{
                      fontSize: 14,
                      color: '#374151',
                      marginLeft: 8,
                      flex: 1
                    }}>
                      {service}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={{ gap: 8 }}>
                  {[
                    'Outpatient Services',
                    'Inpatient Care',
                    'Diagnostic Imaging',
                    'Laboratory Services',
                    'Pharmacy',
                    'Physical Therapy',
                    hospital.emergencyServices ? 'Emergency Department' : null
                  ].filter(Boolean).map((service, index) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                      <Text style={{
                        fontSize: 14,
                        color: '#374151',
                        marginLeft: 8
                      }}>
                        {service}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </InfoCard>

          {/* Patient Reviews */}
          <InfoCard icon="chatbubbles-outline" title="What Patients Say">
            <View style={{ gap: 16 }}>
              {hospital.reviews && hospital.reviews.length > 0 ? (
                hospital.reviews.slice(0, 3).map((review, index) => (
                  <View key={index} style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 8,
                    padding: 12
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={12}
                            color={i < review.rating ? "#FBC02D" : "#E5E7EB"}
                          />
                        ))}
                      </View>
                      <Text style={{
                        fontSize: 12,
                        color: '#6B7280',
                        marginLeft: 8
                      }}>
                        {review.date}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 20,
                      fontStyle: 'italic'
                    }}>
                      "{review.comment}"
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#6B7280',
                      marginTop: 4
                    }}>
                      - {review.patientType || 'Verified Patient'}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 8,
                  padding: 16,
                  alignItems: 'center'
                }}>
                  <Ionicons name="star" size={32} color="#FBC02D" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginTop: 8,
                    marginBottom: 4
                  }}>
                    {hospital.rating} Star Rating
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280',
                    textAlign: 'center'
                  }}>
                    Consistently rated by patients for quality care and service
                  </Text>
                </View>
              )}
            </View>
          </InfoCard>

          {/* Emergency Contact */}
          {hospital.emergencyServices && (
            <View style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FF7043',
              borderWidth: 2,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Ionicons name="warning" size={24} color="#FF7043" />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#DC2626',
                  marginLeft: 8
                }}>
                  Emergency Services
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: '#991B1B',
                marginBottom: 16,
                lineHeight: 20
              }}>
                For life-threatening emergencies, call 911 or go directly to the emergency department.
              </Text>
              <Pressable
                style={{
                  backgroundColor: '#FF7043',
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center'
                }}
                onPress={() => Linking.openURL('tel:911')}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  🚨 Call 911
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}