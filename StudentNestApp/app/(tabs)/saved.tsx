import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedRoomsApi } from '../../lib/api';
import { Room } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown, FadeInUp, ZoomIn, Layout } from 'react-native-reanimated';
import { Heart, MapPin, Star, Trash2, Home as HomeIcon, Search, ChevronRight } from 'lucide-react-native';

export default function SavedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['savedRooms'],
    queryFn: savedRoomsApi.getAll,
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: savedRoomsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRooms'] });
    },
  });

  const savedRooms = data?.data || [];

  const handleRoomPress = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const handleRemove = (roomId: string) => {
    Alert.alert(
      'Remove from Saved',
      'Are you sure you want to remove this room from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeMutation.mutate(roomId) 
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={ZoomIn.duration(500)}>
            <View className="w-24 h-24 bg-primary-500/20 rounded-full items-center justify-center mb-6">
              <Heart size={48} color="#F97316" />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(200).duration(500)} className="text-white text-2xl font-bold">
            Save Your Favorites
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(300).duration(500)} className="text-dark-text text-center mt-2">
            Sign in to save rooms and access them from anywhere
          </Animated.Text>
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              className="bg-primary-500 px-8 py-4 rounded-2xl mt-6"
            >
              <Text className="text-white font-bold text-lg">Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  const RoomCard = ({ room, index }: { room: Room; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => handleRoomPress(room.id || room._id!)}
        className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
      >
        <View className="relative">
          <Image
            source={{ uri: room.images?.[0] || 'https://via.placeholder.com/400x200' }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => handleRemove(room.id || room._id!)}
            className="absolute top-3 right-3 w-10 h-10 bg-dark-bg/80 rounded-full items-center justify-center"
          >
            <Heart size={20} color="#EF4444" fill="#EF4444" />
          </Pressable>
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between">
            <View className="bg-primary-500 px-3 py-1.5 rounded-lg">
              <Text className="text-white font-bold">₹{room.price?.toLocaleString()}/mo</Text>
            </View>
            {room.availability === 'available' && (
              <View className="bg-green-500/90 px-3 py-1.5 rounded-lg">
                <Text className="text-white font-medium text-sm">Available</Text>
              </View>
            )}
          </View>
        </View>
        <View className="p-4">
          <Text className="text-white font-bold text-lg mb-2" numberOfLines={1}>{room.title}</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <MapPin size={14} color="#71717A" />
              <Text className="text-dark-text text-sm ml-1" numberOfLines={1}>{room.location?.city}</Text>
            </View>
            <View className="flex-row items-center">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-white text-sm ml-1 font-medium">{room.rating?.toFixed(1) || '4.5'}</Text>
              <Text className="text-dark-muted text-sm ml-1">({room.reviewCount || 0})</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} className="px-6 pt-4 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">Saved Rooms</Text>
            <Text className="text-dark-text mt-1">{savedRooms.length} rooms saved</Text>
          </View>
          {savedRooms.length > 0 && (
            <Pressable
              onPress={() => router.push('/(tabs)/search')}
              className="bg-dark-surface p-3 rounded-full"
            >
              <Search size={20} color="#F97316" />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-dark-text mt-4">Loading your saved rooms...</Text>
        </View>
      ) : (
        <FlatList
          data={savedRooms}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          renderItem={({ item, index }) => <RoomCard room={item} index={index} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
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
              <Animated.View entering={ZoomIn.duration(500)}>
                <View className="w-20 h-20 bg-dark-surface rounded-full items-center justify-center mb-4">
                  <Heart size={40} color="#71717A" />
                </View>
              </Animated.View>
              <Animated.Text entering={FadeInUp.delay(200).duration(500)} className="text-white text-xl font-bold">
                No saved rooms yet
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(300).duration(500)} className="text-dark-text text-center mt-2 px-6">
                Tap the heart icon on any room to save it for later
              </Animated.Text>
              <Animated.View entering={FadeInUp.delay(400).duration(500)}>
                <Pressable
                  onPress={() => router.push('/(tabs)/search')}
                  className="bg-primary-500 px-6 py-3 rounded-xl mt-6 flex-row items-center"
                >
                  <Text className="text-white font-bold">Browse Rooms</Text>
                  <ChevronRight size={20} color="#fff" />
                </Pressable>
              </Animated.View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
