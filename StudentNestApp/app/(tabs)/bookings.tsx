import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../lib/api';
import { Booking } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react-native';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', icon: Clock },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-500', icon: CheckCircle },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', icon: XCircle },
  completed: { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: CheckCircle },
};

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
    enabled: isAuthenticated,
  });

  // Handle nested API response: data.data.bookings or data.data if it's already an array
  const bookings = Array.isArray(data?.data) 
    ? data.data 
    : (data?.data?.bookings || []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={64} color="#71717A" />
          <Text className="text-white text-xl font-bold mt-4">Track Your Bookings</Text>
          <Text className="text-dark-text text-center mt-2">
            Sign in to view and manage your room bookings
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-500 px-8 py-4 rounded-2xl mt-6"
          >
            <Text className="text-white font-bold text-lg">Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const status = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
    const StatusIcon = status.icon;

    return (
      <Pressable
        onPress={() => router.push(`/room/${booking.room.id || booking.room._id}`)}
        className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
      >
        <View className="flex-row">
          <Image
            source={{ uri: booking.room.images?.[0] || 'https://via.placeholder.com/100x100' }}
            style={{ width: 100, height: 100 }}
            contentFit="cover"
          />
          <View className="flex-1 p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white font-bold text-base" numberOfLines={1}>
                {booking.room.title}
              </Text>
              <ChevronRight size={16} color="#71717A" />
            </View>
            <View className="flex-row items-center mb-2">
              <MapPin size={12} color="#71717A" />
              <Text className="text-dark-text text-xs ml-1" numberOfLines={1}>
                {booking.room.location?.city}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className={`flex-row items-center px-2 py-1 rounded-lg ${status.bg}`}>
                <StatusIcon size={12} color={status.text.replace('text-', '#').replace('-500', '')} />
                <Text className={`text-xs font-medium ml-1 capitalize ${status.text}`}>
                  {booking.status}
                </Text>
              </View>
              <Text className="text-primary-500 font-bold">₹{booking.monthlyRent}/mo</Text>
            </View>
          </View>
        </View>
        <View className="px-4 py-3 border-t border-dark-border flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#71717A" />
            <Text className="text-dark-text text-xs ml-2">
              {new Date(booking.startDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Text className="text-dark-muted text-xs">
            Booking ID: {booking._id.slice(-8)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <View className="px-6 pt-4 pb-4">
        <Text className="text-white text-2xl font-bold">My Bookings</Text>
        <Text className="text-dark-text mt-1">{bookings.length} bookings</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BookingCard booking={item} />}
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
              <Calendar size={48} color="#71717A" />
              <Text className="text-white text-lg font-semibold mt-4">No bookings yet</Text>
              <Text className="text-dark-text text-center mt-2">
                Your room bookings will appear here
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/search')}
                className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
              >
                <Text className="text-white font-bold">Find a Room</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
