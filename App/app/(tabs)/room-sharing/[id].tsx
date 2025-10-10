import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/src/services/api';
import { RoomShare } from '@/src/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';

export default function RoomShareDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [roomShare, setRoomShare] = useState<RoomShare | null>(null);

  useEffect(() => {
    loadRoomShareDetails();
  }, [id]);

  const loadRoomShareDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getRoomShareById(id as string);
      setRoomShare(data);
    } catch (error) {
      console.error('Error loading room share:', error);
      Alert.alert('Error', 'Failed to load room share details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    Alert.prompt(
      'Apply to Room Share',
      'Tell the host why you would be a good roommate:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Application',
          onPress: async (message) => {
            if (!message || message.trim().length < 20) {
              Alert.alert('Error', 'Please write at least 20 characters');
              return;
            }

            try {
              setApplying(true);
              const moveInDate = new Date();
              moveInDate.setDate(moveInDate.getDate() + 7);

              await api.applyToRoomShare(
                id as string,
                message,
                moveInDate.toISOString().split('T')[0]
              );

              Alert.alert(
                'Success',
                'Your application has been sent!',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send application');
            } finally {
              setApplying(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleContact = () => {
    const phone = roomShare?.contact?.phone;
    if (!phone) return;

    const whatsappAvailable = roomShare?.contact?.whatsappAvailable;
    
    Alert.alert(
      'Contact Host',
      'How would you like to contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${phone}`),
        },
        ...(whatsappAvailable ? [{
          text: 'WhatsApp',
          onPress: () => Linking.openURL(`whatsapp://send?phone=${phone}`),
        }] : []),
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!roomShare) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Room share not found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: roomShare.property?.images?.[0] || 'https://via.placeholder.com/400x300',
            }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: roomShare.status === 'active' ? '#10B981' : '#F59E0B' },
          ]}>
            <Text style={styles.statusText}>
              {roomShare.sharing.availableSlots} slot{roomShare.sharing.availableSlots !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {roomShare.property?.title || 'Room Share Available'}
            </Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={16} />
              {' '}{roomShare.property?.location?.city || 'Location'}
            </Text>
          </View>

          {/* Cost Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Cost Details
            </Text>
            <View style={styles.costGrid}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>
                  Rent/Person
                </Text>
                <Text style={styles.costValue}>
                  ₹{roomShare.cost.rentPerPerson.toLocaleString()}/mo
                </Text>
              </View>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>
                  Deposit/Person
                </Text>
                <Text style={styles.costValueSecondary}>
                  ₹{roomShare.cost.depositPerPerson.toLocaleString()}
                </Text>
              </View>
              {roomShare.cost.utilitiesIncluded && (
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>
                    Utilities/Person
                  </Text>
                  <Text style={styles.costValueSecondary}>
                    ₹{roomShare.cost.utilitiesPerPerson.toLocaleString()}/mo
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About
            </Text>
            <Text style={styles.description}>
              {roomShare.description}
            </Text>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Requirements
            </Text>
            <View style={styles.requirementsGrid}>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={roomShare.requirements.gender === 'male' ? 'male' : 
                        roomShare.requirements.gender === 'female' ? 'female' : 'male-female'} 
                  size={20} 
                  color="#6366F1"
                />
                <Text style={styles.requirementText}>
                  {roomShare.requirements.gender === 'any' ? 'Any Gender' : roomShare.requirements.gender}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="person-outline" size={20} color="#6366F1" />
                <Text style={styles.requirementText}>
                  Age {roomShare.requirements.ageRange.min}-{roomShare.requirements.ageRange.max}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="people-outline" size={20} color="#6366F1" />
                <Text style={styles.requirementText}>
                  {roomShare.sharing.currentParticipants}/{roomShare.maxParticipants} Occupied
                </Text>
              </View>
            </View>

            {roomShare.requirements.lifestyle.length > 0 && (
              <View style={styles.preferencesContainer}>
                <Text style={styles.preferencesLabel}>
                  Lifestyle Preferences
                </Text>
                <View style={styles.badgeContainer}>
                  {roomShare.requirements.lifestyle.map(lifestyle => (
                    <View key={lifestyle} style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {lifestyle}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Room Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Room Features
            </Text>
            <View style={styles.featuresGrid}>
              {roomShare.roomConfiguration.hasPrivateBathroom && (
                <View style={styles.featureItem}>
                  <Ionicons name="water-outline" size={20} color="#6366F1" />
                  <Text style={styles.featureText}>
                    Private Bathroom
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasSharedKitchen && (
                <View style={styles.featureItem}>
                  <Ionicons name="restaurant-outline" size={20} color="#6366F1" />
                  <Text style={styles.featureText}>
                    Shared Kitchen
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasStudyArea && (
                <View style={styles.featureItem}>
                  <Ionicons name="book-outline" size={20} color="#6366F1" />
                  <Text style={styles.featureText}>
                    Study Area
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasStorage && (
                <View style={styles.featureItem}>
                  <Ionicons name="cube-outline" size={20} color="#6366F1" />
                  <Text style={styles.featureText}>
                    Storage Space
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Posted By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Posted By
            </Text>
            <View style={styles.initiatorRow}>
              <Image
                source={{ 
                  uri: roomShare.initiator?.profilePhoto || 'https://via.placeholder.com/50',
                }}
                style={styles.initiatorPhoto}
              />
              <View style={styles.initiatorInfo}>
                <Text style={styles.initiatorName}>
                  {roomShare.initiator?.fullName || 'Student'}
                </Text>
                <Text style={styles.initiatorEmail}>
                  {roomShare.initiator?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContact}
        >
          <Ionicons name="call-outline" size={20} color="#6366F1" />
          <Text style={styles.contactButtonText}>
            Contact
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.applyButton,
            (applying || roomShare.sharing.isFull) && styles.applyButtonDisabled,
          ]}
          onPress={handleApply}
          disabled={applying || roomShare.sharing.isFull}
        >
          {applying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>
                {roomShare.sharing.isFull ? 'Full' : 'Apply Now'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#111827',
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  location: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  costGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  costItem: {
    flex: 1,
    minWidth: '45%',
  },
  costLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  costValueSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111827',
  },
  requirementsGrid: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#111827',
  },
  preferencesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  preferencesLabel: {
    fontSize: 12,
    marginBottom: 8,
    color: '#6B7280',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    color: '#111827',
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#111827',
  },
  initiatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initiatorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initiatorInfo: {
    flex: 1,
  },
  initiatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#111827',
  },
  initiatorEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
