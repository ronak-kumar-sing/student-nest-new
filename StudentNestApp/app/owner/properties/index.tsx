import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerPropertiesApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Building2,
  Plus,
  ChevronLeft,
  MapPin,
  IndianRupee,
  Star,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  location: {
    city: string;
    address?: string;
    fullAddress?: string;
  };
  images: string[];
  availability: {
    isAvailable: boolean;
    availableRooms?: number;
  };
  status: string;
  rating?: number;
  totalReviews?: number;
  roomType?: string;
  createdAt: string;
}

export default function OwnerPropertiesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ownerProperties'],
    queryFn: () => ownerPropertiesApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ownerPropertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      Alert.alert('Success', 'Property deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete property');
    },
  });

  const properties: Property[] = data?.data?.properties || [];

  const handleDelete = (property: Property) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(property._id),
        },
      ]
    );
  };

  const PropertyCard = ({ item, index }: { item: Property; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.duration(300)}
    >
      <Pressable
        onPress={() => router.push(`/room/${item._id}`)}
        className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
      >
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
          />
          {/* Status Badge */}
          <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${
            item.availability?.isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <Text className="text-white text-xs font-bold">
              {item.availability?.isAvailable ? 'Available' : 'Occupied'}
            </Text>
          </View>
          {/* Rating */}
          {item.rating && item.rating > 0 && (
            <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full flex-row items-center">
              <Star size={12} color="#EAB308" fill="#EAB308" />
              <Text className="text-white text-xs font-bold ml-1">
                {item.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-white font-bold text-lg" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={14} color="#71717A" />
                <Text className="text-dark-muted text-sm ml-1" numberOfLines={1}>
                  {item.location?.fullAddress || item.location?.city || 'Unknown'}
                </Text>
              </View>
            </View>
            <Text className="text-primary-500 font-bold text-lg">
              ₹{item.price?.toLocaleString()}/mo
            </Text>
          </View>

          {/* Room Type Tag */}
          {item.roomType && (
            <View className="mt-3 flex-row">
              <View className="bg-dark-border px-3 py-1 rounded-full">
                <Text className="text-dark-text text-xs">{item.roomType}</Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3 mt-4 pt-4 border-t border-dark-border">
            <Pressable
              onPress={() => router.push(`/owner/properties/${item._id}/edit`)}
              className="flex-1 bg-dark-border py-2.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Edit2 size={16} color="#fff" />
              <Text className="text-white font-medium">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/room/${item._id}`)}
              className="flex-1 bg-primary-500/20 py-2.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Eye size={16} color="#F97316" />
              <Text className="text-primary-500 font-medium">View</Text>
            </Pressable>
            <Pressable
              onPress={() => handleDelete(item)}
              className="bg-red-500/20 p-2.5 rounded-xl items-center justify-center"
            >
              <Trash2 size={18} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'owner') {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Building2 size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Owner Access Required</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-dark-surface border border-dark-border px-6 py-3 rounded-xl mt-6"
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-dark-surface items-center justify-center mr-3"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <View>
            <Text className="text-white text-xl font-bold">My Properties</Text>
            <Text className="text-dark-muted text-sm">{properties.length} properties</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/owner/properties/create')}
          className="bg-primary-500 p-2.5 rounded-full"
        >
          <Plus size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <PropertyCard item={item} index={index} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#F97316"
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Building2 size={64} color="#71717A" />
              <Text className="text-white text-xl font-bold mt-4">No Properties Yet</Text>
              <Text className="text-dark-muted text-center mt-2 px-6">
                Add your first property to start receiving bookings
              </Text>
              <Pressable
                onPress={() => router.push('/owner/properties/create')}
                className="bg-primary-500 px-8 py-4 rounded-xl mt-6 flex-row items-center gap-2"
              >
                <Plus size={20} color="#fff" />
                <Text className="text-white font-bold text-lg">Add Property</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
