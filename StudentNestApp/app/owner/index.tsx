import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack, useFocusEffect, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerPropertiesApi, bookingsApi, visitRequestsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Home,
  Building2,
  Calendar,
  Users,
  IndianRupee,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Eye,
  Star,
  Bell,
  Settings,
} from 'lucide-react-native';

interface PropertyStats {
  totalProperties: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRent: number;
  pendingBookings: number;
  pendingVisits: number;
}

interface Property {
  _id: string;
  title: string;
  price: number;
  location: {
    city: string;
    address?: string;
  };
  images: string[];
  availability: {
    isAvailable: boolean;
    availableRooms?: number;
  };
  status: string;
  rating?: number;
  totalReviews?: number;
}

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch owner properties
  const { data: propertiesData, isLoading: loadingProperties, refetch: refetchProperties } = useQuery({
    queryKey: ['ownerProperties'],
    queryFn: () => ownerPropertiesApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  // Fetch pending bookings (for owners)
  const { data: bookingsData, isLoading: loadingBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['ownerBookings'],
    queryFn: () => bookingsApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  // Fetch visit requests
  const { data: visitsData, isLoading: loadingVisits, refetch: refetchVisits } = useQuery({
    queryKey: ['ownerVisits'],
    queryFn: () => visitRequestsApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['ownerVisits'] });
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProperties(), refetchBookings(), refetchVisits()]);
    setRefreshing(false);
  };

  // Extract data with proper nested handling
  const propertiesResponse = propertiesData?.data as any;
  const properties: Property[] = propertiesResponse?.properties || [];
  
  const bookingsResponse = bookingsData?.data as any;
  const bookings = Array.isArray(bookingsResponse) 
    ? bookingsResponse 
    : (bookingsResponse?.bookings || []);
  
  const visitsResponse = visitsData?.data as any;
  const visits = Array.isArray(visitsResponse) 
    ? visitsResponse 
    : (visitsResponse?.visits || []);

  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
  const pendingVisits = visits.filter((v: any) => v.status === 'pending');

  // Calculate stats
  const stats = {
    totalProperties: properties.length,
    availableRooms: properties.filter(p => p.availability?.isAvailable).length,
    occupiedRooms: properties.filter(p => !p.availability?.isAvailable).length,
    totalRent: properties.reduce((sum, p) => sum + (p.price || 0), 0),
    pendingBookings: pendingBookings.length,
    pendingVisits: pendingVisits.length,
  };

  const isLoading = loadingProperties || loadingBookings || loadingVisits;

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Building2 size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Sign In Required</Text>
        <Text className="text-dark-text text-center mt-2">
          Please sign in to access your owner dashboard
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

  if (user?.role?.toLowerCase() !== 'owner') {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <AlertCircle size={64} color="#EF4444" />
        <Text className="text-white text-xl font-bold mt-4">Owner Access Required</Text>
        <Text className="text-dark-text text-center mt-2">
          This dashboard is only available for property owners
        </Text>
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
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-dark-border">
        <View>
          <Text className="text-dark-muted text-sm">Welcome back,</Text>
          <Text className="text-white text-xl font-bold">
            {user?.fullName || user?.name || 'Owner'}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push('/notifications')}
            className="w-11 h-11 rounded-full bg-dark-surface items-center justify-center"
          >
            <Bell size={20} color="#fff" />
            {(stats.pendingBookings + stats.pendingVisits) > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {stats.pendingBookings + stats.pendingVisits}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-20"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
          />
        }
      >
        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text className="text-white text-lg font-bold mb-4">Overview</Text>
          <View className="flex-row flex-wrap gap-3">
            {/* Total Properties */}
            <View className="flex-1 min-w-[45%] bg-dark-surface rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-3">
                <Building2 size={20} color="#3B82F6" />
              </View>
              <Text className="text-white text-2xl font-bold">{stats.totalProperties}</Text>
              <Text className="text-dark-muted text-sm">Total Properties</Text>
            </View>

            {/* Available Rooms */}
            <View className="flex-1 min-w-[45%] bg-dark-surface rounded-2xl p-4">
              <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mb-3">
                <CheckCircle size={20} color="#22C55E" />
              </View>
              <Text className="text-white text-2xl font-bold">{stats.availableRooms}</Text>
              <Text className="text-dark-muted text-sm">Available</Text>
            </View>

            {/* Pending Bookings */}
            <View className="flex-1 min-w-[45%] bg-dark-surface rounded-2xl p-4">
              <View className="w-10 h-10 bg-yellow-500/20 rounded-full items-center justify-center mb-3">
                <Clock size={20} color="#EAB308" />
              </View>
              <Text className="text-white text-2xl font-bold">{stats.pendingBookings}</Text>
              <Text className="text-dark-muted text-sm">Pending Bookings</Text>
            </View>

            {/* Pending Visits */}
            <View className="flex-1 min-w-[45%] bg-dark-surface rounded-2xl p-4">
              <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mb-3">
                <Eye size={20} color="#A855F7" />
              </View>
              <Text className="text-white text-2xl font-bold">{stats.pendingVisits}</Text>
              <Text className="text-dark-muted text-sm">Visit Requests</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200)} className="mt-6">
          <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push('/owner/properties/create' as Href)}
              className="flex-1 bg-primary-500 rounded-2xl p-4 flex-row items-center justify-center gap-2"
            >
              <Plus size={20} color="#fff" />
              <Text className="text-white font-bold">Add Property</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/owner/bookings')}
              className="flex-1 bg-dark-surface rounded-2xl p-4 flex-row items-center justify-center gap-2"
            >
              <Calendar size={20} color="#F97316" />
              <Text className="text-white font-bold">Bookings</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* My Properties */}
        <Animated.View entering={FadeInDown.delay(300)} className="mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">My Properties</Text>
            <Pressable
              onPress={() => router.push('/owner/properties')}
              className="flex-row items-center"
            >
              <Text className="text-primary-500 font-medium">View All</Text>
              <ChevronRight size={16} color="#F97316" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : properties.length === 0 ? (
            <View className="bg-dark-surface rounded-2xl p-8 items-center">
              <Building2 size={48} color="#71717A" />
              <Text className="text-white font-bold mt-4">No Properties Yet</Text>
              <Text className="text-dark-muted text-center mt-2">
                Start by adding your first property
              </Text>
              <Pressable
                onPress={() => router.push('/owner/properties/create' as Href)}
                className="bg-primary-500 px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-white font-bold">Add Property</Text>
              </Pressable>
            </View>
          ) : (
            properties.slice(0, 3).map((property, index) => (
              <Pressable
                key={property._id}
                onPress={() => router.push(`/room/${property._id}`)}
                className="bg-dark-surface rounded-2xl overflow-hidden mb-3"
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: property.images?.[0] || 'https://via.placeholder.com/100' }}
                    style={{ width: 100, height: 100 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white font-bold flex-1" numberOfLines={1}>
                        {property.title}
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${
                        property.availability?.isAvailable 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          property.availability?.isAvailable 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {property.availability?.isAvailable ? 'Available' : 'Occupied'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#71717A" />
                      <Text className="text-dark-muted text-xs ml-1" numberOfLines={1}>
                        {property.location?.city || 'Unknown'}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-primary-500 font-bold">
                        ₹{property.price?.toLocaleString()}/mo
                      </Text>
                      {property.rating && (
                        <View className="flex-row items-center">
                          <Star size={12} color="#EAB308" fill="#EAB308" />
                          <Text className="text-white text-xs ml-1">
                            {property.rating?.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </Animated.View>

        {/* Recent Activity */}
        {(pendingBookings.length > 0 || pendingVisits.length > 0) && (
          <Animated.View entering={FadeInDown.delay(400)} className="mt-6">
            <Text className="text-white text-lg font-bold mb-4">Recent Activity</Text>
            <View className="bg-dark-surface rounded-2xl overflow-hidden">
              {pendingBookings.slice(0, 2).map((booking: any, index: number) => (
                <Pressable
                  key={booking._id}
                  onPress={() => router.push('/owner/bookings')}
                  className={`flex-row items-center p-4 ${
                    index < pendingBookings.slice(0, 2).length - 1 || pendingVisits.length > 0
                      ? 'border-b border-dark-border' 
                      : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-yellow-500/20 rounded-full items-center justify-center">
                    <Calendar size={18} color="#EAB308" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-medium">New Booking Request</Text>
                    <Text className="text-dark-muted text-sm">
                      {booking.room?.title || 'Property'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#71717A" />
                </Pressable>
              ))}
              {pendingVisits.slice(0, 2).map((visit: any, index: number) => (
                <Pressable
                  key={visit._id}
                  onPress={() => router.push('/owner/visits')}
                  className={`flex-row items-center p-4 ${
                    index < pendingVisits.slice(0, 2).length - 1 ? 'border-b border-dark-border' : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center">
                    <Eye size={18} color="#A855F7" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-medium">Visit Request</Text>
                    <Text className="text-dark-muted text-sm">
                      {new Date(visit.preferredDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })} at {visit.preferredTime}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#71717A" />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
