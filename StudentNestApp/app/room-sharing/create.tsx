import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomSharingApi, roomsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft,
  Check,
  Users,
  IndianRupee,
  Calendar,
  Home,
  MapPin,
  ChevronDown,
} from 'lucide-react-native';
import { Room } from '../../types';
import { Image } from 'expo-image';

const GENDER_OPTIONS = [
  { id: 'any', label: 'Any Gender' },
  { id: 'male', label: 'Male Only' },
  { id: 'female', label: 'Female Only' },
];

const LIFESTYLE_OPTIONS = [
  { id: 'non-smoker', label: 'Non-Smoker' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'non-drinker', label: 'Non-Drinker' },
  { id: 'early-riser', label: 'Early Riser' },
  { id: 'night-owl', label: 'Night Owl' },
  { id: 'pet-friendly', label: 'Pet Friendly' },
];

const PREFERENCE_OPTIONS = [
  { id: 'quiet', label: 'Quiet Environment' },
  { id: 'studious', label: 'Studious' },
  { id: 'social', label: 'Social' },
  { id: 'clean', label: 'Clean & Organized' },
  { id: 'flexible', label: 'Flexible Schedule' },
];

export default function CreateRoomSharingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { roomId: preselectedRoomId } = useLocalSearchParams<{ roomId?: string }>();

  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    maxParticipants: 2,
    rentPerPerson: '',
    securityDepositPerPerson: '',
    gender: 'any',
    lifestyle: [] as string[],
    preferences: [] as string[],
    description: '',
    availableFrom: new Date().toISOString().split('T')[0],
    houseRules: '',
  });

  // Fetch user's rooms if they are an owner
  const { data: roomsData, isLoading: loadingRooms } = useQuery({
    queryKey: ['myRooms'],
    queryFn: () => roomsApi.getAll({}, 1, 50),
    enabled: !!user?._id,
  });

  // Fetch preselected room if coming from room detail page
  const { data: preselectedRoomData } = useQuery({
    queryKey: ['room', preselectedRoomId],
    queryFn: () => roomsApi.getById(preselectedRoomId!),
    enabled: !!preselectedRoomId && !selectedRoom,
  });

  // Auto-select preselected room when data is available
  useEffect(() => {
    if (preselectedRoomData?.data && !selectedRoom) {
      const room = preselectedRoomData.data;
      setSelectedRoom(room);
      // Auto-set rent per person based on room price
      if (room.price) {
        setFormData(prev => ({
          ...prev,
          rentPerPerson: Math.round(room.price / 2).toString(),
          securityDepositPerPerson: Math.round(room.price).toString(),
        }));
      }
    }
  }, [preselectedRoomData, selectedRoom]);


  const rooms = roomsData?.data || [];

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedRoom?.id && !selectedRoom?._id) {
        throw new Error('No room selected');
      }
      const payload = {
        propertyId: (selectedRoom?.id || selectedRoom?._id)!,
        maxParticipants: formData.maxParticipants,
        costSharing: {
          rentPerPerson: parseInt(formData.rentPerPerson) || 0,
          depositPerPerson: parseInt(formData.securityDepositPerPerson) || 0,
        },
        requirements: {
          gender: formData.gender as 'male' | 'female' | 'any',
          lifestyle: formData.lifestyle,
          preferences: formData.preferences,
        },
        description: formData.description,
        availableFrom: formData.availableFrom,
      };
      return roomSharingApi.create(payload);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Room sharing listing created successfully!', [
        { text: 'OK', onPress: () => router.replace('/room-sharing') },
      ]);
      queryClient.invalidateQueries({ queryKey: ['roomSharing'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create listing');
    },
  });

  const toggleLifestyle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(id)
        ? prev.lifestyle.filter(l => l !== id)
        : [...prev.lifestyle, id],
    }));
  };

  const togglePreference = (id: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(id)
        ? prev.preferences.filter(p => p !== id)
        : [...prev.preferences, id],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !selectedRoom) {
      Alert.alert('Required', 'Please select a room first');
      return;
    }
    if (step === 2 && !formData.rentPerPerson) {
      Alert.alert('Required', 'Please enter the rent per person');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      createMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Users size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Sign In Required</Text>
        <Text className="text-dark-text text-center mt-2">
          Please sign in to create a room sharing listing
        </Text>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <Text className="text-white text-lg font-bold mb-4">Select Your Room</Text>
      <Text className="text-dark-text mb-6">
        Choose a room you want to share with other students
      </Text>

      {loadingRooms ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#F97316" />
        </View>
      ) : rooms.length === 0 ? (
        <View className="bg-dark-surface rounded-2xl p-6 items-center">
          <Home size={48} color="#71717A" />
          <Text className="text-white font-bold mt-4">No Rooms Found</Text>
          <Text className="text-dark-text text-center mt-2">
            You need to have a room listed first to create a sharing request
          </Text>
        </View>
      ) : (
        rooms.map((room: Room) => {
          const roomId = room.id || room._id;
          const selectedId = selectedRoom?.id || selectedRoom?._id;
          const isSelected = roomId === selectedId;
          
          return (
            <Pressable
              key={roomId}
              onPress={() => setSelectedRoom(room)}
              className={`bg-dark-surface rounded-2xl overflow-hidden mb-4 ${
                isSelected ? 'border-2 border-primary-500' : ''
              }`}
            >
              <View className="flex-row">
                <Image
                  source={{ uri: room.images?.[0] || 'https://via.placeholder.com/100' }}
                  style={{ width: 100, height: 100 }}
                  contentFit="cover"
                />
                <View className="flex-1 p-3 justify-between">
                  <View>
                    <Text className="text-white font-bold" numberOfLines={1}>
                      {room.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#71717A" />
                      <Text className="text-dark-text text-xs ml-1">{room.location?.city}</Text>
                    </View>
                  </View>
                  <Text className="text-primary-500 font-bold">₹{room.price}/mo</Text>
                </View>
                {isSelected && (
                  <View className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                    <Check size={16} color="#fff" />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })
      )}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <Text className="text-white text-lg font-bold mb-4">Sharing Details</Text>
      <Text className="text-dark-text mb-6">
        Set up the cost sharing and participant details
      </Text>

      {/* Max Participants */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Maximum Roommates</Text>
        <View className="flex-row">
          {[2, 3, 4, 5].map((num) => (
            <Pressable
              key={num}
              onPress={() => setFormData(prev => ({ ...prev, maxParticipants: num }))}
              className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                formData.maxParticipants === num ? 'bg-primary-500' : 'bg-dark-surface'
              }`}
            >
              <Text className={`font-bold ${
                formData.maxParticipants === num ? 'text-white' : 'text-dark-text'
              }`}>
                {num}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Rent Per Person */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Rent Per Person (₹/month)</Text>
        <View className="bg-dark-surface rounded-xl flex-row items-center px-4">
          <IndianRupee size={20} color="#71717A" />
          <TextInput
            value={formData.rentPerPerson}
            onChangeText={(text) => setFormData(prev => ({ ...prev, rentPerPerson: text }))}
            placeholder="5000"
            placeholderTextColor="#71717A"
            keyboardType="numeric"
            className="flex-1 text-white py-4 ml-2 text-lg"
          />
        </View>
      </View>

      {/* Security Deposit */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Security Deposit Per Person (₹)</Text>
        <View className="bg-dark-surface rounded-xl flex-row items-center px-4">
          <IndianRupee size={20} color="#71717A" />
          <TextInput
            value={formData.securityDepositPerPerson}
            onChangeText={(text) => setFormData(prev => ({ ...prev, securityDepositPerPerson: text }))}
            placeholder="10000"
            placeholderTextColor="#71717A"
            keyboardType="numeric"
            className="flex-1 text-white py-4 ml-2 text-lg"
          />
        </View>
      </View>

      {/* Available From */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Available From</Text>
        <View className="bg-dark-surface rounded-xl flex-row items-center px-4 py-4">
          <Calendar size={20} color="#71717A" />
          <TextInput
            value={formData.availableFrom}
            onChangeText={(text) => setFormData(prev => ({ ...prev, availableFrom: text }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#71717A"
            className="flex-1 text-white ml-2"
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <Text className="text-white text-lg font-bold mb-4">Roommate Preferences</Text>
      <Text className="text-dark-text mb-6">
        Specify what kind of roommates you're looking for
      </Text>

      {/* Gender Preference */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Gender Preference</Text>
        <View className="flex-row flex-wrap">
          {GENDER_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setFormData(prev => ({ ...prev, gender: option.id }))}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                formData.gender === option.id ? 'bg-primary-500' : 'bg-dark-surface'
              }`}
            >
              <Text className={`font-medium ${
                formData.gender === option.id ? 'text-white' : 'text-dark-text'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Lifestyle */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Lifestyle Preferences</Text>
        <View className="flex-row flex-wrap">
          {LIFESTYLE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => toggleLifestyle(option.id)}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 flex-row items-center ${
                formData.lifestyle.includes(option.id) ? 'bg-primary-500' : 'bg-dark-surface'
              }`}
            >
              {formData.lifestyle.includes(option.id) && (
                <Check size={14} color="#fff" style={{ marginRight: 4 }} />
              )}
              <Text className={`font-medium ${
                formData.lifestyle.includes(option.id) ? 'text-white' : 'text-dark-text'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Other Preferences */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Other Preferences</Text>
        <View className="flex-row flex-wrap">
          {PREFERENCE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => togglePreference(option.id)}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 flex-row items-center ${
                formData.preferences.includes(option.id) ? 'bg-primary-500' : 'bg-dark-surface'
              }`}
            >
              {formData.preferences.includes(option.id) && (
                <Check size={14} color="#fff" style={{ marginRight: 4 }} />
              )}
              <Text className={`font-medium ${
                formData.preferences.includes(option.id) ? 'text-white' : 'text-dark-text'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <Text className="text-white text-lg font-bold mb-4">Final Details</Text>
      <Text className="text-dark-text mb-6">
        Add a description and house rules
      </Text>

      {/* Description */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Description</Text>
        <TextInput
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Tell potential roommates about the space, neighborhood, and what it's like living there..."
          placeholderTextColor="#71717A"
          multiline
          numberOfLines={4}
          className="bg-dark-surface text-white p-4 rounded-xl"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
      </View>

      {/* House Rules */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">House Rules (one per line)</Text>
        <TextInput
          value={formData.houseRules}
          onChangeText={(text) => setFormData(prev => ({ ...prev, houseRules: text }))}
          placeholder="No smoking inside&#10;Quiet hours after 11 PM&#10;Clean common areas regularly"
          placeholderTextColor="#71717A"
          multiline
          numberOfLines={4}
          className="bg-dark-surface text-white p-4 rounded-xl"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
      </View>

      {/* Summary */}
      <View className="bg-dark-surface rounded-2xl p-4">
        <Text className="text-white font-bold mb-3">Summary</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-dark-text">Room</Text>
          <Text className="text-white font-medium">{selectedRoom?.title}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-dark-text">Max Roommates</Text>
          <Text className="text-white font-medium">{formData.maxParticipants}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-dark-text">Rent per Person</Text>
          <Text className="text-primary-500 font-bold">₹{formData.rentPerPerson}/mo</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-dark-text">Gender</Text>
          <Text className="text-white font-medium capitalize">{formData.gender}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable
            onPress={() => step > 1 ? setStep(step - 1) : router.back()}
            className="w-10 h-10 bg-dark-surface rounded-full items-center justify-center"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Create Room Share</Text>
          <View className="w-10" />
        </View>

        {/* Progress */}
        <View className="flex-row px-4 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full mx-1 ${
                s <= step ? 'bg-primary-500' : 'bg-dark-border'
              }`}
            />
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ScrollView>

          {/* Bottom Button */}
          <SafeAreaView edges={['bottom']} className="px-4 pb-4">
            <Pressable
              onPress={handleNext}
              disabled={createMutation.isPending}
              className={`py-4 rounded-xl items-center ${
                createMutation.isPending ? 'bg-primary-700' : 'bg-primary-500'
              }`}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {step < 4 ? 'Continue' : 'Create Listing'}
                </Text>
              )}
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
