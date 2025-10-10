import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/src/services/api';
import { 
  CreateRoomShareData, 
  LIFESTYLE_OPTIONS, 
  OCCUPATION_OPTIONS,
  DURATION_OPTIONS,
  CONTACT_TIME_LABELS,
} from '@/src/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function CreateRoomShareScreen() {
  const { roomId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [formData, setFormData] = useState<Partial<CreateRoomShareData>>({
    propertyId: roomId as string || '',
    maxParticipants: 2,
    requirements: {
      gender: 'any',
      ageRange: { min: 18, max: 35 },
      preferences: [],
      lifestyle: [],
      studyHabits: 'Balanced',
    },
    costSharing: {
      monthlyRent: 0,
      rentPerPerson: 0,
      securityDeposit: 0,
      maintenanceCharges: 0,
      utilitiesIncluded: false,
      utilitiesPerPerson: 0,
    },
    description: '',
    roomConfiguration: {
      totalBeds: 2,
      bedsAvailable: 1,
      hasPrivateBathroom: false,
      hasSharedKitchen: true,
      hasStudyArea: false,
      hasStorage: false,
    },
    availableFrom: new Date().toISOString().split('T')[0],
    duration: '6 months',
    houseRules: [],
    contact: {
      phone: '',
      whatsappAvailable: true,
      preferredContactTime: 'evening',
    },
  });

  useEffect(() => {
    if (roomId) {
      loadRoomDetails();
    }
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      setLoadingRoom(true);
      const room = await api.getRoomById(roomId as string);
      setSelectedRoom(room);

      // Auto-fill form data based on room
      const rentPerPerson = Math.floor(room.price / 2);
      setFormData(prev => ({
        ...prev,
        propertyId: room.id,
        costSharing: {
          ...prev.costSharing!,
          monthlyRent: room.price,
          rentPerPerson,
          securityDeposit: room.securityDeposit || room.price,
        },
      }));
    } catch (error) {
      console.error('Error loading room:', error);
      Alert.alert('Error', 'Failed to load room details');
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.propertyId) {
      Alert.alert('Error', 'Please select a room');
      return;
    }

    if (!formData.description || formData.description.length < 50) {
      Alert.alert('Error', 'Description must be at least 50 characters');
      return;
    }

    if (!formData.contact?.phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createRoomShare(formData.propertyId, formData);
      
      Alert.alert(
        'Success',
        'Room sharing post created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/room-sharing'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room share');
    } finally {
      setLoading(false);
    }
  };

  const toggleLifestyle = (lifestyle: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements!,
        lifestyle: prev.requirements!.lifestyle.includes(lifestyle)
          ? prev.requirements!.lifestyle.filter(l => l !== lifestyle)
          : [...prev.requirements!.lifestyle, lifestyle],
      },
    }));
  };

  const toggleOccupation = (occupation: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements!,
        preferences: prev.requirements!.preferences.includes(occupation)
          ? prev.requirements!.preferences.filter(o => o !== occupation)
          : [...prev.requirements!.preferences, occupation],
      },
    }));
  };

  if (loadingRoom) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Post Room for Sharing
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Room Info (if pre-selected) */}
        {selectedRoom && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Room
            </Text>
            <View style={styles.selectedRoomCard}>
              <Text style={styles.roomTitle}>
                {selectedRoom.title}
              </Text>
              <Text style={styles.roomLocation}>
                {selectedRoom.location?.city} • ₹{selectedRoom.price}/month
              </Text>
            </View>
          </View>
        )}

        {/* Sharing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sharing Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Max Participants *
            </Text>
            <Picker
              selectedValue={formData.maxParticipants}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  maxParticipants: value,
                  roomConfiguration: {
                    ...prev.roomConfiguration!,
                    totalBeds: value,
                    bedsAvailable: value - 1,
                  },
                }));
              }}
              style={styles.picker}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <Picker.Item 
                  key={num} 
                  label={`${num} ${num === 1 ? 'Person' : 'People'}`} 
                  value={num} 
                />
              ))}
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Rent per Person (₹/month) *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.costSharing?.rentPerPerson?.toString()}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                costSharing: {
                  ...prev.costSharing!,
                  rentPerPerson: parseInt(text) || 0,
                },
              }))}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Security Deposit (₹) *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.costSharing?.securityDeposit?.toString()}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                costSharing: {
                  ...prev.costSharing!,
                  securityDeposit: parseInt(text) || 0,
                },
              }))}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description *
            </Text>
            <TextInput
              style={styles.textArea}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              placeholder="Tell potential roommates about yourself and what you're looking for... (minimum 50 characters)"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.charCount}>
              {formData.description?.length || 0}/50 characters
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Roommate Preferences
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Gender Preference
            </Text>
            <Picker
              selectedValue={formData.requirements?.gender}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                requirements: { ...prev.requirements!, gender: value },
              }))}
              style={styles.picker}
            >
              <Picker.Item label="Any" value="any" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Age Range
            </Text>
            <View style={styles.ageRangeRow}>
              <TextInput
                style={styles.ageInput}
                value={formData.requirements?.ageRange.min.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements!,
                    ageRange: { 
                      ...prev.requirements!.ageRange, 
                      min: parseInt(text) || 18,
                    },
                  },
                }))}
                keyboardType="numeric"
                placeholder="18"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.ageRangeSeparator}>
                to
              </Text>
              <TextInput
                style={styles.ageInput}
                value={formData.requirements?.ageRange.max.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements!,
                    ageRange: { 
                      ...prev.requirements!.ageRange, 
                      max: parseInt(text) || 35,
                    },
                  },
                }))}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Occupation
            </Text>
            <View style={styles.badgeContainer}>
              {OCCUPATION_OPTIONS.map(occupation => (
                <TouchableOpacity
                  key={occupation}
                  style={[
                    styles.badge,
                    formData.requirements?.preferences.includes(occupation) && 
                      styles.badgeActive,
                  ]}
                  onPress={() => toggleOccupation(occupation)}
                >
                  <Text style={[
                    styles.badgeText,
                    formData.requirements?.preferences.includes(occupation) && 
                      styles.badgeTextActive,
                  ]}>
                    {occupation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Lifestyle Preferences
            </Text>
            <View style={styles.badgeContainer}>
              {LIFESTYLE_OPTIONS.map(lifestyle => (
                <TouchableOpacity
                  key={lifestyle}
                  style={[
                    styles.badge,
                    formData.requirements?.lifestyle.includes(lifestyle) && 
                      styles.badgeActive,
                  ]}
                  onPress={() => toggleLifestyle(lifestyle)}
                >
                  <Text style={[
                    styles.badgeText,
                    formData.requirements?.lifestyle.includes(lifestyle) && 
                      styles.badgeTextActive,
                  ]}>
                    {lifestyle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Availability
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Available From *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.availableFrom}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                availableFrom: text,
              }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Duration
            </Text>
            <Picker
              selectedValue={formData.duration}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                duration: value,
              }))}
              style={styles.picker}
            >
              {DURATION_OPTIONS.map(duration => (
                <Picker.Item key={duration} label={duration} value={duration} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.contact?.phone}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, phone: text },
              }))}
              keyboardType="phone-pad"
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>
              Available on WhatsApp
            </Text>
            <Switch
              value={formData.contact?.whatsappAvailable}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, whatsappAvailable: value },
              }))}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Preferred Contact Time
            </Text>
            <Picker
              selectedValue={formData.contact?.preferredContactTime}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, preferredContactTime: value },
              }))}
              style={styles.picker}
            >
              {Object.entries(CONTACT_TIME_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              Post Room Sharing
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  selectedRoomCard: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  roomLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    color: '#6B7280',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  ageRangeSeparator: {
    fontSize: 16,
    color: '#111827',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  badgeActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  badgeText: {
    fontSize: 14,
    color: '#111827',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6366F1',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
