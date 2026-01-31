import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { ownerPropertiesApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { ROOM_TYPES, AMENITIES } from '../../../constants/config';
import {
  ChevronLeft,
  Camera,
  X,
  MapPin,
  Home,
  IndianRupee,
  FileText,
  Plus,
  CheckCircle,
  Building2,
} from 'lucide-react-native';

const ACCOMMODATION_TYPES = [
  { value: 'pg', label: 'PG' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
];

export default function CreatePropertyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [roomType, setRoomType] = useState('single');
  const [accommodationType, setAccommodationType] = useState('pg');
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Location state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: any) => ownerPropertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      Alert.alert(
        'Success! 🎉',
        'Your property has been listed successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create property');
      setIsSubmitting(false);
    },
  });

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 10));
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a property title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly rent');
      return false;
    }
    if (!securityDeposit || parseFloat(securityDeposit) <= 0) {
      Alert.alert('Error', 'Please enter a valid security deposit');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter the address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter the city');
      return false;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter the state');
      return false;
    }
    if (!pincode || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const propertyData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      securityDeposit: parseFloat(securityDeposit),
      roomType,
      accommodationType,
      amenities: selectedAmenities,
      images: images, // In production, these would be uploaded to cloud storage first
      location: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      availability: {
        isAvailable: true,
        availableRooms: 1,
        totalRooms: 1,
      },
    };

    createMutation.mutate(propertyData);
  };

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'owner') {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Building2 size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Owner Access Required</Text>
        <Text className="text-dark-text text-center mt-2">
          You need to be logged in as an owner to add properties
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-dark-surface items-center justify-center mr-3"
        >
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Add Property</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6 pb-20"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Images */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Photos</Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    style={{ width: 100, height: 100, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  >
                    <X size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 10 && (
                <Pressable
                  onPress={pickImages}
                  className="w-[100] h-[100] bg-dark-surface border-2 border-dashed border-dark-border rounded-xl items-center justify-center"
                >
                  <Camera size={24} color="#71717A" />
                  <Text className="text-dark-muted text-xs mt-1">Add Photos</Text>
                </Pressable>
              )}
            </View>
            <Text className="text-dark-muted text-xs mt-2">
              Add up to 10 photos. First photo will be the cover image.
            </Text>
          </View>

          {/* Basic Info */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Basic Information</Text>

            <View className="gap-4">
              <View>
                <Text className="text-dark-text text-sm mb-1">Property Title *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                  <Home size={20} color="#71717A" />
                  <TextInput
                    placeholder="e.g., Cozy Single Room near Campus"
                    placeholderTextColor="#71717A"
                    value={title}
                    onChangeText={setTitle}
                    className="flex-1 ml-3 text-white text-base"
                  />
                </View>
              </View>

              <View>
                <Text className="text-dark-text text-sm mb-1">Description *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5">
                  <TextInput
                    placeholder="Describe your property..."
                    placeholderTextColor="#71717A"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="text-white text-base min-h-[100]"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Pricing</Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-dark-text text-sm mb-1">Monthly Rent *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                  <IndianRupee size={20} color="#71717A" />
                  <TextInput
                    placeholder="5000"
                    placeholderTextColor="#71717A"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-white text-base"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-dark-text text-sm mb-1">Security Deposit *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                  <IndianRupee size={20} color="#71717A" />
                  <TextInput
                    placeholder="10000"
                    placeholderTextColor="#71717A"
                    value={securityDeposit}
                    onChangeText={setSecurityDeposit}
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-white text-base"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Room Type */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Room Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {ROOM_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setRoomType(type.value)}
                  className={`px-4 py-2.5 rounded-xl ${roomType === type.value
                      ? 'bg-primary-500'
                      : 'bg-dark-surface'
                    }`}
                >
                  <Text className={`font-medium ${roomType === type.value ? 'text-white' : 'text-dark-text'
                    }`}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Accommodation Type */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Accommodation Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACCOMMODATION_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setAccommodationType(type.value)}
                  className={`px-4 py-2.5 rounded-xl ${accommodationType === type.value
                      ? 'bg-primary-500'
                      : 'bg-dark-surface'
                    }`}
                >
                  <Text className={`font-medium ${accommodationType === type.value ? 'text-white' : 'text-dark-text'
                    }`}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Amenities */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Amenities</Text>
            <View className="flex-row flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <Pressable
                  key={amenity.id}
                  onPress={() => toggleAmenity(amenity.id)}
                  className={`px-4 py-2.5 rounded-xl flex-row items-center ${selectedAmenities.includes(amenity.id)
                      ? 'bg-primary-500'
                      : 'bg-dark-surface'
                    }`}
                >
                  {selectedAmenities.includes(amenity.id) && (
                    <CheckCircle size={14} color="#fff" style={{ marginRight: 6 }} />
                  )}
                  <Text className={`font-medium ${selectedAmenities.includes(amenity.id) ? 'text-white' : 'text-dark-text'
                    }`}>
                    {amenity.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Location */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-3">Location</Text>

            <View className="gap-4">
              <View>
                <Text className="text-dark-text text-sm mb-1">Address *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                  <MapPin size={20} color="#71717A" />
                  <TextInput
                    placeholder="Street address"
                    placeholderTextColor="#71717A"
                    value={address}
                    onChangeText={setAddress}
                    className="flex-1 ml-3 text-white text-base"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-dark-text text-sm mb-1">City *</Text>
                  <View className="bg-dark-surface rounded-xl px-4 py-3.5">
                    <TextInput
                      placeholder="City"
                      placeholderTextColor="#71717A"
                      value={city}
                      onChangeText={setCity}
                      className="text-white text-base"
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-dark-text text-sm mb-1">State *</Text>
                  <View className="bg-dark-surface rounded-xl px-4 py-3.5">
                    <TextInput
                      placeholder="State"
                      placeholderTextColor="#71717A"
                      value={state}
                      onChangeText={setState}
                      className="text-white text-base"
                    />
                  </View>
                </View>
              </View>

              <View className="w-1/2 pr-1.5">
                <Text className="text-dark-text text-sm mb-1">Pincode *</Text>
                <View className="bg-dark-surface rounded-xl px-4 py-3.5">
                  <TextInput
                    placeholder="6-digit pincode"
                    placeholderTextColor="#71717A"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                    className="text-white text-base"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View className="px-6 pb-6 pt-4 border-t border-dark-border">
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-4 rounded-2xl flex-row items-center justify-center ${isSubmitting ? 'bg-dark-surface' : 'bg-primary-500'
            }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white font-bold text-lg ml-2">Creating...</Text>
            </>
          ) : (
            <>
              <Plus size={20} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">Add Property</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
