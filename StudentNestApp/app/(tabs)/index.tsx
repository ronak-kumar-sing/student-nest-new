import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../../lib/api';
import { Room } from '../../types';
import {
  Search,
  MapPin,
  Star,
  Wifi,
  Car,
  Home as HomeIcon,
  Bell,
  Filter,
  ChevronRight,
  Users,
  Map,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { ROOM_TYPES } from '../../constants/config';
import { FadeIn, SlideIn, ScaleIn, Shimmer } from '../../components/Animations';
import RoomsMap from '../../components/map/RoomsMap';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapView, setShowMapView] = useState(false);

  // Fetch rooms with error handling
  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      try {
        const response = await roomsApi.getAll({}, 1, 20);
        if (__DEV__) {
          console.log('📦 Rooms API Response:', JSON.stringify(response, null, 2).substring(0, 500));
        }
        return response;
      } catch (err) {
        if (__DEV__) {
          console.error('❌ Rooms API Error:', err);
        }
        throw err;
      }
    },
    retry: 2,
  });

  // Handle both response formats: { data: rooms } or { data: { rooms: [] } }
  const rooms = Array.isArray(data?.data) 
    ? data.data 
    : (data?.data?.rooms || data?.rooms || []);
  const featuredRooms = rooms.slice(0, 5);

  // Debug log
  if (__DEV__ && data) {
    console.log('🏠 Rooms count:', rooms.length);
  }

  const handleRoomPress = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const RoomCard = ({ room, featured = false, index = 0 }: { room: Room; featured?: boolean; index?: number }) => (
    <SlideIn delay={index * 100} from="bottom" distance={30}>
      <Pressable
        onPress={() => handleRoomPress(room.id || room._id!)}
        className={`bg-dark-surface rounded-2xl overflow-hidden ${featured ? 'mr-4' : 'mb-4'}`}
        style={{ width: featured ? CARD_WIDTH * 0.85 : '100%' }}
      >
        <View className="relative">
          <Image
            source={{ uri: room.images?.[0] || 'https://via.placeholder.com/400x300' }}
            style={{ width: '100%', height: featured ? 180 : 160 }}
            contentFit="cover"
          />
          <View className="absolute top-3 left-3 bg-primary-500 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-semibold">₹{room.price}/mo</Text>
          </View>
          {room.availability === 'available' && (
            <View className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-semibold">Available</Text>
            </View>
          )}
        </View>
        <View className="p-4">
          <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
            {room.title}
          </Text>
          <View className="flex-row items-center mb-2">
            <MapPin size={14} color="#71717A" />
            <Text className="text-dark-text text-sm ml-1" numberOfLines={1}>
              {room.location?.city || 'Location'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-white text-sm ml-1">
                {room.rating?.toFixed(1) || '4.5'}
              </Text>
              <Text className="text-dark-muted text-sm ml-1">
                ({room.reviewCount || 0})
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              {room.amenities?.includes('wifi') && <Wifi size={14} color="#71717A" />}
              {room.amenities?.includes('parking') && <Car size={14} color="#71717A" />}
            </View>
          </View>
        </View>
      </Pressable>
    </SlideIn>
  );

  // Loading skeleton
  const RoomSkeleton = () => (
    <View className="mb-4">
      <Shimmer width="100%" height={160} borderRadius={16} />
      <View className="mt-3">
        <Shimmer width="70%" height={20} borderRadius={4} />
      </View>
      <View className="mt-2">
        <Shimmer width="50%" height={16} borderRadius={4} />
      </View>
      <View className="mt-2">
        <Shimmer width="30%" height={16} borderRadius={4} />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      {/* Map View Modal */}
      <Modal
        visible={showMapView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapView(false)}
      >
        <RoomsMap 
          rooms={rooms} 
          onClose={() => setShowMapView(false)}
          showCloseButton
        />
      </Modal>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F97316"
          />
        }
      >
        {/* Header */}
        <FadeIn duration={400}>
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-dark-text text-sm">
                  {isAuthenticated ? `Welcome back,` : 'Welcome to'}
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'StudentNest'} 👋
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {/* Map Button */}
                <Pressable
                  onPress={() => setShowMapView(true)}
                  className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center"
                >
                  <Map size={22} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => isAuthenticated ? router.push('/notifications') : router.push('/(auth)/login')}
                  className="w-12 h-12 bg-dark-surface rounded-full items-center justify-center"
                >
                  <Bell size={22} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Search Bar */}
            <Pressable
              onPress={() => router.push('/(tabs)/search')}
              className="bg-dark-surface rounded-2xl px-4 py-4 flex-row items-center"
            >
              <Search size={20} color="#71717A" />
              <Text className="text-dark-muted ml-3 flex-1">Search rooms, locations...</Text>
              <Filter size={20} color="#71717A" />
            </Pressable>
          </View>
        </FadeIn>

        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-white text-lg font-bold">Categories</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {ROOM_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { type: type.value } })}
                className="bg-dark-surface px-4 py-3 rounded-xl mr-3 flex-row items-center"
              >
                <HomeIcon size={16} color="#F97316" />
                <Text className="text-white font-medium ml-2">{type.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Rooms */}
        {featuredRooms.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-white text-lg font-bold">Featured Rooms</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/search')}
                className="flex-row items-center"
              >
                <Text className="text-primary-500 font-medium">See All</Text>
                <ChevronRight size={16} color="#F97316" />
              </Pressable>
            </View>
            <FlatList
              data={featuredRooms}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              keyExtractor={(item) => item.id || item._id || String(Math.random())}
              renderItem={({ item }) => <RoomCard room={item} featured />}
            />
          </View>
        )}

        {/* Room Sharing Banner */}
        <SlideIn from="right" delay={200}>
          <Pressable
            onPress={() => router.push('/room-sharing')}
            className="mx-6 mb-6 bg-gradient-to-r bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4 flex-row items-center"
          >
            <View className="w-14 h-14 bg-primary-500/20 rounded-full items-center justify-center">
              <Users size={28} color="#F97316" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white font-bold text-lg">Find Roommates</Text>
              <Text className="text-dark-text text-sm">Share rooms with verified students</Text>
            </View>
            <View className="bg-primary-500 px-4 py-2 rounded-xl">
              <Text className="text-white font-bold">Explore</Text>
            </View>
          </Pressable>
        </SlideIn>

        {/* All Rooms */}
        <View className="px-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">All Rooms</Text>
            <Text className="text-dark-muted text-sm">{rooms.length} available</Text>
          </View>

          {isLoading ? (
            <View>
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
            </View>
          ) : error ? (
            <FadeIn>
              <View className="py-8 items-center">
                <HomeIcon size={48} color="#EF4444" />
                <Text className="text-red-400 mt-4 text-center font-medium">
                  Failed to load rooms
                </Text>
                <Text className="text-dark-muted mt-2 text-center text-sm px-4">
                  {error instanceof Error ? error.message : 'Please check your connection and try again'}
                </Text>
                <Pressable 
                  onPress={() => refetch()}
                  className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Retry</Text>
                </Pressable>
              </View>
            </FadeIn>
          ) : rooms.length === 0 ? (
            <FadeIn>
              <View className="py-8 items-center">
                <HomeIcon size={48} color="#71717A" />
                <Text className="text-dark-text mt-4 text-center">
                  No rooms available at the moment
                </Text>
                <Pressable 
                  onPress={() => refetch()}
                  className="mt-4 bg-dark-surface border border-dark-border px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Refresh</Text>
                </Pressable>
              </View>
            </FadeIn>
          ) : (
            rooms.slice(5).map((room, index) => (
              <RoomCard key={room.id || room._id} room={room} index={index} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
