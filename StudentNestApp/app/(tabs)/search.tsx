import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../../lib/api';
import { Room, RoomFilters } from '../../types';
import { ROOM_TYPES, AMENITIES } from '../../constants/config';
import RoomsMap from '../../components/map/RoomsMap';
import {
  Search,
  MapPin,
  Star,
  X,
  SlidersHorizontal,
  ChevronDown,
  Home as HomeIcon,
  Map,
  List,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({
    type: params.type ? [params.type] : undefined,
    minPrice: undefined,
    maxPrice: undefined,
    amenities: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['rooms', 'search', filters],
    queryFn: async () => {
      const response = await roomsApi.getAll(filters, 1, 50);
      return response;
    },
    retry: 2,
  });

  // Handle both response formats
  const rooms = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.rooms || data?.rooms || []);

  // Filter by search query locally
  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.title?.toLowerCase().includes(query) ||
      room.location?.city?.toLowerCase().includes(query) ||
      room.location?.address?.toLowerCase().includes(query)
    );
  });

  const handleRoomPress = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setSearchQuery('');
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <Pressable
      onPress={() => handleRoomPress(room.id || room._id!)}
      className="bg-dark-surface rounded-2xl overflow-hidden mb-4 flex-row"
    >
      <Image
        source={{ uri: room.images?.[0] || 'https://via.placeholder.com/150x150' }}
        style={{ width: 120, height: 120 }}
        contentFit="cover"
      />
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
            {room.title}
          </Text>
          <View className="flex-row items-center">
            <MapPin size={12} color="#71717A" />
            <Text className="text-dark-text text-xs ml-1" numberOfLines={1}>
              {room.location?.city}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-primary-500 font-bold">₹{room.price}/mo</Text>
          <View className="flex-row items-center">
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-white text-xs ml-1">{room.rating?.toFixed(1) || '4.5'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-xl mr-2 ${active ? 'bg-primary-500' : 'bg-dark-surface'}`}
    >
      <Text className={`font-medium ${active ? 'text-white' : 'text-dark-text'}`}>
        {label}
      </Text>
    </Pressable>
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
          rooms={filteredRooms} 
          onClose={() => setShowMapView(false)}
          showCloseButton
        />
      </Modal>

      {/* Search Header */}
      <View className="px-6 pt-4 pb-4">
        <View className="flex-row items-center bg-dark-surface rounded-xl px-4">
          <Search size={20} color="#71717A" />
          <TextInput
            placeholder="Search rooms, cities..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 py-4 ml-3 text-white text-base"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={20} color="#71717A" />
            </Pressable>
          )}
        </View>

        {/* Filter & Map Toggle */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              className="flex-row items-center bg-dark-surface px-4 py-2 rounded-xl"
            >
              <SlidersHorizontal size={16} color="#F97316" />
              <Text className="text-white font-medium ml-2">Filters</Text>
              <ChevronDown size={16} color="#71717A" className="ml-2" />
            </Pressable>

            {/* Map View Toggle */}
            <Pressable
              onPress={() => setShowMapView(true)}
              className="flex-row items-center bg-primary-500 px-4 py-2 rounded-xl"
            >
              <Map size={16} color="#fff" />
              <Text className="text-white font-medium ml-2">Map</Text>
            </Pressable>
          </View>

          {(filters.type || filters.minPrice || filters.amenities) && (
            <Pressable onPress={clearFilters}>
              <Text className="text-primary-500 font-medium">Clear All</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View className="px-6 pb-4">
          {/* Room Types */}
          <Text className="text-white font-semibold mb-2">Room Type</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ROOM_TYPES}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                active={filters.type?.includes(item.value) || false}
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    type: prev.type?.includes(item.value)
                      ? prev.type.filter((t) => t !== item.value)
                      : [...(prev.type || []), item.value],
                  }));
                }}
              />
            )}
            className="mb-4"
          />

          {/* Price Range */}
          <Text className="text-white font-semibold mb-2">Price Range</Text>
          <View className="flex-row items-center mb-4">
            {[
              { label: 'Under ₹5K', min: 0, max: 5000 },
              { label: '₹5K-10K', min: 5000, max: 10000 },
              { label: '₹10K-20K', min: 10000, max: 20000 },
              { label: '₹20K+', min: 20000, max: undefined },
            ].map((range) => (
              <FilterChip
                key={range.label}
                label={range.label}
                active={filters.minPrice === range.min && filters.maxPrice === range.max}
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: prev.minPrice === range.min ? undefined : range.min,
                    maxPrice: prev.maxPrice === range.max ? undefined : range.max,
                  }));
                }}
              />
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      <View className="flex-1 px-6">
        <Text className="text-dark-text text-sm mb-4">
          {filteredRooms.length} rooms found
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <FlatList
            data={filteredRooms}
            keyExtractor={(item) => item.id || item._id || String(Math.random())}
            renderItem={({ item }) => <RoomCard room={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#F97316"
              />
            }
            ListEmptyComponent={
              <View className="py-12 items-center">
                <HomeIcon size={48} color="#71717A" />
                <Text className="text-dark-text mt-4 text-center">
                  No rooms found matching your criteria
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
