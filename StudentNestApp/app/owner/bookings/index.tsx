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
import { bookingsApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  ChevronRight,
} from 'lucide-react-native';

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-500',
    icon: Clock,
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    icon: CheckCircle,
    label: 'Confirmed',
  },
  cancelled: {
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    icon: XCircle,
    label: 'Cancelled',
  },
  completed: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-500',
    icon: CheckCircle,
    label: 'Completed',
  },
  active: {
    bg: 'bg-primary-500/20',
    text: 'text-primary-500',
    icon: CheckCircle,
    label: 'Active',
  },
};

interface Booking {
  _id: string;
  status: keyof typeof STATUS_CONFIG;
  moveInDate: string;
  moveOutDate?: string;
  duration: number;
  monthlyRent: number;
  securityDeposit?: number;
  totalAmount?: number;
  createdAt: string;
  room: {
    _id: string;
    title: string;
    images?: string[];
    location?: {
      city?: string;
      address?: string;
    };
  };
  student?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
  };
}

export default function OwnerBookingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ownerBookings'],
    queryFn: () => bookingsApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  // Handle nested API response
  const responseData = data?.data as any;
  const bookings: Booking[] = Array.isArray(responseData)
    ? responseData
    : (responseData?.bookings || []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'confirmed') return ['confirmed', 'active'].includes(b.status);
    return true;
  });

  const tabs = [
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length },
    { key: 'all', label: 'All', count: bookings.length },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const BookingCard = ({ item, index }: { item: Booking; index: number }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <Pressable
          onPress={() => router.push(`/room/${item.room?._id}`)}
          className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
        >
          {/* Property Info */}
          <View className="flex-row p-4">
            <Image
              source={{ uri: item.room?.images?.[0] || 'https://via.placeholder.com/80' }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <View className={`${config.bg} px-2 py-1 rounded-full flex-row items-center`}>
                  <StatusIcon size={12} color={config.text.includes('yellow') ? '#EAB308' : config.text.includes('green') ? '#22C55E' : config.text.includes('red') ? '#EF4444' : config.text.includes('blue') ? '#3B82F6' : '#F97316'} />
                  <Text className={`text-xs font-medium ml-1 ${config.text}`}>{config.label}</Text>
                </View>
                <Text className="text-primary-500 font-bold">₹{item.monthlyRent?.toLocaleString()}/mo</Text>
              </View>
              <Text className="text-white font-bold mt-1" numberOfLines={1}>
                {item.room?.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={12} color="#71717A" />
                <Text className="text-dark-muted text-xs ml-1" numberOfLines={1}>
                  {item.room?.location?.city || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* Student Info */}
          {item.student && (
            <View className="px-4 pb-4 border-t border-dark-border mt-2 pt-4">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: item.student.profilePhoto || 'https://via.placeholder.com/40' }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  contentFit="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-white font-medium">{item.student.fullName}</Text>
                  <View className="flex-row items-center mt-0.5">
                    <Mail size={10} color="#71717A" />
                    <Text className="text-dark-muted text-xs ml-1">{item.student.email}</Text>
                  </View>
                </View>
                {item.student.phone && (
                  <Pressable className="w-9 h-9 bg-green-500/20 rounded-full items-center justify-center">
                    <Phone size={16} color="#22C55E" />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Booking Details */}
          <View className="px-4 py-3 bg-dark-border/30 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={14} color="#71717A" />
              <Text className="text-dark-text text-xs ml-2">
                {formatDate(item.moveInDate)} • {item.duration} months
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-dark-muted text-xs">
                Booking #{item._id.slice(-6)}
              </Text>
              <ChevronRight size={14} color="#71717A" />
            </View>
          </View>

          {/* Actions for Pending */}
          {item.status === 'pending' && (
            <View className="flex-row gap-3 p-4 pt-0">
              <Pressable
                onPress={() => {
                  Alert.alert('Reject Booking', 'This feature is coming soon');
                }}
                className="flex-1 bg-red-500/20 py-3 rounded-xl items-center"
              >
                <Text className="text-red-500 font-bold">Reject</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.alert('Accept Booking', 'This feature is coming soon');
                }}
                className="flex-1 bg-green-500 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Accept</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'owner') {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Calendar size={64} color="#71717A" />
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
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-dark-surface items-center justify-center mr-3"
        >
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Booking Requests</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab.key ? 'bg-primary-500' : 'bg-dark-surface'
              }`}
          >
            <Text className={`font-medium ${activeTab === tab.key ? 'text-white' : 'text-dark-text'}`}>
              {tab.label} ({tab.count})
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <BookingCard item={item} index={index} />}
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
              <Calendar size={64} color="#71717A" />
              <Text className="text-white text-xl font-bold mt-4">No Bookings</Text>
              <Text className="text-dark-muted text-center mt-2 px-6">
                {activeTab === 'pending'
                  ? 'No pending booking requests'
                  : activeTab === 'confirmed'
                    ? 'No confirmed bookings yet'
                    : 'You have no bookings yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
