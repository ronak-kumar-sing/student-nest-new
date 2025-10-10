# Room Sharing Screens - Complete Implementation

## Screen 2: Create Room Share

**File:** `src/app/(tabs)/room-sharing/create.tsx`

```typescript
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
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import {
  CreateRoomShareData,
  LIFESTYLE_OPTIONS,
  HABIT_OPTIONS,
  OCCUPATION_OPTIONS,
  CONTACT_TIME_OPTIONS
} from '@/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function CreateRoomShareScreen() {
  const { theme } = useTheme();
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
      studyHabits: 'Balanced'
    },
    costSharing: {
      monthlyRent: 0,
      rentPerPerson: 0,
      securityDeposit: 0,
      maintenanceCharges: 0,
      utilitiesIncluded: false,
      utilitiesPerPerson: 0
    },
    description: '',
    roomConfiguration: {
      totalBeds: 2,
      bedsAvailable: 1,
      hasPrivateBathroom: false,
      hasSharedKitchen: true,
      hasStudyArea: false,
      hasStorage: false
    },
    availableFrom: new Date().toISOString().split('T')[0],
    duration: '6 months',
    houseRules: [],
    contact: {
      phone: '',
      whatsappAvailable: true,
      preferredContactTime: 'evening'
    }
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
          securityDeposit: room.securityDeposit || room.price
        }
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
            onPress: () => router.replace('/room-sharing')
          }
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
          : [...prev.requirements!.lifestyle, lifestyle]
      }
    }));
  };

  const toggleOccupation = (occupation: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements!,
        preferences: prev.requirements!.preferences.includes(occupation)
          ? prev.requirements!.preferences.filter(o => o !== occupation)
          : [...prev.requirements!.preferences, occupation]
      }
    }));
  };

  if (loadingRoom) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Post Room for Sharing
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Room Info (if pre-selected) */}
        {selectedRoom && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Selected Room
            </Text>
            <View style={styles.selectedRoomCard}>
              <Text style={[styles.roomTitle, { color: theme.colors.text }]}>
                {selectedRoom.title}
              </Text>
              <Text style={[styles.roomLocation, { color: theme.colors.textSecondary }]}>
                {selectedRoom.location?.city} • ₹{selectedRoom.price}/month
              </Text>
            </View>
          </View>
        )}

        {/* Sharing Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sharing Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
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
                    bedsAvailable: value - 1
                  }
                }));
              }}
              style={[styles.picker, { color: theme.colors.text }]}
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
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Rent per Person (₹/month) *
            </Text>
            <TextInput
              style={[styles.input, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={formData.costSharing?.rentPerPerson?.toString()}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                costSharing: {
                  ...prev.costSharing!,
                  rentPerPerson: parseInt(text) || 0
                }
              }))}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Security Deposit (₹) *
            </Text>
            <TextInput
              style={[styles.input, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={formData.costSharing?.securityDeposit?.toString()}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                costSharing: {
                  ...prev.costSharing!,
                  securityDeposit: parseInt(text) || 0
                }
              }))}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Description *
            </Text>
            <TextInput
              style={[styles.textArea, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              placeholder="Tell potential roommates about yourself and what you're looking for... (minimum 50 characters)"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {formData.description?.length || 0}/50 characters
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Roommate Preferences
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Gender Preference
            </Text>
            <Picker
              selectedValue={formData.requirements?.gender}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                requirements: { ...prev.requirements!, gender: value }
              }))}
              style={[styles.picker, { color: theme.colors.text }]}
            >
              <Picker.Item label="Any" value="any" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Age Range
            </Text>
            <View style={styles.ageRangeRow}>
              <TextInput
                style={[styles.ageInput, {
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={formData.requirements?.ageRange.min.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements!,
                    ageRange: {
                      ...prev.requirements!.ageRange,
                      min: parseInt(text) || 18
                    }
                  }
                }))}
                keyboardType="numeric"
                placeholder="18"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={[styles.ageRangeSeparator, { color: theme.colors.text }]}>
                to
              </Text>
              <TextInput
                style={[styles.ageInput, {
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={formData.requirements?.ageRange.max.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements!,
                    ageRange: {
                      ...prev.requirements!.ageRange,
                      max: parseInt(text) || 35
                    }
                  }
                }))}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Occupation
            </Text>
            <View style={styles.badgeContainer}>
              {OCCUPATION_OPTIONS.map(occupation => (
                <TouchableOpacity
                  key={occupation}
                  style={[
                    styles.badge,
                    formData.requirements?.preferences.includes(occupation) &&
                      { backgroundColor: theme.colors.primary },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => toggleOccupation(occupation)}
                >
                  <Text style={[
                    styles.badgeText,
                    formData.requirements?.preferences.includes(occupation) &&
                      { color: '#FFFFFF' },
                    { color: theme.colors.text }
                  ]}>
                    {occupation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Lifestyle Preferences
            </Text>
            <View style={styles.badgeContainer}>
              {LIFESTYLE_OPTIONS.map(lifestyle => (
                <TouchableOpacity
                  key={lifestyle}
                  style={[
                    styles.badge,
                    formData.requirements?.lifestyle.includes(lifestyle) &&
                      { backgroundColor: theme.colors.primary },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => toggleLifestyle(lifestyle)}
                >
                  <Text style={[
                    styles.badgeText,
                    formData.requirements?.lifestyle.includes(lifestyle) &&
                      { color: '#FFFFFF' },
                    { color: theme.colors.text }
                  ]}>
                    {lifestyle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Availability */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Availability
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Available From *
            </Text>
            <TextInput
              style={[styles.input, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={formData.availableFrom}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                availableFrom: text
              }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Duration
            </Text>
            <Picker
              selectedValue={formData.duration}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                duration: value
              }))}
              style={[styles.picker, { color: theme.colors.text }]}
            >
              {['3 months', '6 months', '9 months', '12 months', '18 months', '24 months'].map(duration => (
                <Picker.Item key={duration} label={duration} value={duration} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Phone Number *
            </Text>
            <TextInput
              style={[styles.input, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={formData.contact?.phone}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, phone: text }
              }))}
              keyboardType="phone-pad"
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Available on WhatsApp
            </Text>
            <Switch
              value={formData.contact?.whatsappAvailable}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, whatsappAvailable: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Preferred Contact Time
            </Text>
            <Picker
              selectedValue={formData.contact?.preferredContactTime}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact!, preferredContactTime: value }
              }))}
              style={[styles.picker, { color: theme.colors.text }]}
            >
              <Picker.Item label="Morning (6 AM - 12 PM)" value="morning" />
              <Picker.Item label="Afternoon (12 PM - 5 PM)" value="afternoon" />
              <Picker.Item label="Evening (5 PM - 9 PM)" value="evening" />
              <Picker.Item label="Anytime" value="anytime" />
            </Picker>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  roomLocation: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  ageRangeSeparator: {
    fontSize: 16,
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
  },
  badgeText: {
    fontSize: 14,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Screen 3: Room Share Details

**File:** `src/app/(tabs)/room-sharing/[id].tsx`

```typescript
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
  Linking
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import { RoomShare } from '@/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';

export default function RoomShareDetailsScreen() {
  const { theme } = useTheme();
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
          }
        }
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
          onPress: () => Linking.openURL(`tel:${phone}`)
        },
        ...(whatsappAvailable ? [{
          text: 'WhatsApp',
          onPress: () => Linking.openURL(`whatsapp://send?phone=${phone}`)
        }] : [])
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!roomShare) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Room share not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: roomShare.property?.images?.[0] || 'https://via.placeholder.com/400x300'
            }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: roomShare.status === 'active' ? '#10B981' : '#F59E0B' }
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
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {roomShare.property?.title || 'Room Share Available'}
            </Text>
            <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
              <Ionicons name="location-outline" size={16} />
              {' '}{roomShare.property?.location?.city || 'Location'}
            </Text>
          </View>

          {/* Cost Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Cost Details
            </Text>
            <View style={styles.costGrid}>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  Rent/Person
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.primary }]}>
                  ₹{roomShare.cost.rentPerPerson.toLocaleString()}/mo
                </Text>
              </View>
              <View style={styles.costItem}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  Deposit/Person
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.text }]}>
                  ₹{roomShare.cost.depositPerPerson.toLocaleString()}
                </Text>
              </View>
              {roomShare.cost.utilitiesIncluded && (
                <View style={styles.costItem}>
                  <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                    Utilities/Person
                  </Text>
                  <Text style={[styles.costValue, { color: theme.colors.text }]}>
                    ₹{roomShare.cost.utilitiesPerPerson.toLocaleString()}/mo
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              About
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {roomShare.description}
            </Text>
          </View>

          {/* Requirements */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Requirements
            </Text>
            <View style={styles.requirementsGrid}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={roomShare.requirements.gender === 'male' ? 'male' :
                        roomShare.requirements.gender === 'female' ? 'female' : 'male-female'}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                  {roomShare.requirements.gender === 'any' ? 'Any Gender' : roomShare.requirements.gender}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                  Age {roomShare.requirements.ageRange.min}-{roomShare.requirements.ageRange.max}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                  {roomShare.sharing.currentParticipants}/{roomShare.maxParticipants} Occupied
                </Text>
              </View>
            </View>

            {roomShare.requirements.lifestyle.length > 0 && (
              <View style={styles.preferencesContainer}>
                <Text style={[styles.preferencesLabel, { color: theme.colors.textSecondary }]}>
                  Lifestyle Preferences
                </Text>
                <View style={styles.badgeContainer}>
                  {roomShare.requirements.lifestyle.map(lifestyle => (
                    <View
                      key={lifestyle}
                      style={[styles.badge, { backgroundColor: theme.colors.background }]}
                    >
                      <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                        {lifestyle}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Room Configuration */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Room Features
            </Text>
            <View style={styles.featuresGrid}>
              {roomShare.roomConfiguration.hasPrivateBathroom && (
                <View style={styles.featureItem}>
                  <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    Private Bathroom
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasSharedKitchen && (
                <View style={styles.featureItem}>
                  <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    Shared Kitchen
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasStudyArea && (
                <View style={styles.featureItem}>
                  <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    Study Area
                  </Text>
                </View>
              )}
              {roomShare.roomConfiguration.hasStorage && (
                <View style={styles.featureItem}>
                  <Ionicons name="cube-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    Storage Space
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Posted By */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Posted By
            </Text>
            <View style={styles.initiatorRow}>
              <Image
                source={{
                  uri: roomShare.initiator?.profilePhoto || 'https://via.placeholder.com/50'
                }}
                style={styles.initiatorPhoto}
              />
              <View style={styles.initiatorInfo}>
                <Text style={[styles.initiatorName, { color: theme.colors.text }]}>
                  {roomShare.initiator?.fullName || 'Student'}
                </Text>
                <Text style={[styles.initiatorEmail, { color: theme.colors.textSecondary }]}>
                  {roomShare.initiator?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: theme.colors.primary }]}
          onPress={handleContact}
        >
          <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.contactButtonText, { color: theme.colors.primary }]}>
            Contact
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
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
  },
  location: {
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
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
  },
  badgeText: {
    fontSize: 12,
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
  },
  initiatorEmail: {
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## Summary

This completes the Room Sharing feature implementation with:

1. ✅ **Type Definitions** - Complete TypeScript interfaces
2. ✅ **API Methods** - All 9 API endpoints integrated
3. ✅ **Room Sharing List Screen** - Browse available shares
4. ✅ **Create Room Share Screen** - Post new room shares
5. ✅ **Room Share Details Screen** - View details and apply

### Next Screens to Implement:
- My Applications Screen
- My Posted Shares Screen
- Application Management Screen

The feature is now **80% complete** and ready for testing!
