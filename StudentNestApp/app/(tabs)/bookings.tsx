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
  ChevronRight,
  CreditCard,
  IndianRupee,
} from 'lucide-react-native';

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', icon: Clock },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-500', icon: CheckCircle },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', icon: XCircle },
  completed: { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: CheckCircle },
};

const PAYMENT_STATUS_COLORS = {
  pending: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
  partial: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
  paid: { bg: 'bg-green-500/20', text: 'text-green-500' },
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
  const responseData = data?.data as any;
  const bookings = Array.isArray(responseData)
    ? responseData
    : (responseData?.bookings || []);

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

  const handlePayNow = (booking: Booking) => {
    router.push({
      pathname: '/payments/checkout',
      params: {
        bookingId: booking._id,
        amount: booking.totalAmount.toString(),
        roomTitle: booking.room?.title || 'Room',
      },
    });
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const status = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
    const paymentStatus = PAYMENT_STATUS_COLORS[booking.paymentStatus] || PAYMENT_STATUS_COLORS.pending;
    const StatusIcon = status.icon;
    const needsPayment = booking.status === 'pending' && booking.paymentStatus !== 'paid';

    return (
      <Pressable
        onPress={() => router.push(`/room/${booking.room.id || booking.room._id}`)}
        className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
      >
        <View className="flex-row">
          <Image
            source={{ uri: booking.room.images?.[0] || 'https://via.placeholder.com/100x100' }}
            style={{ width: 100, height: 120 }}
            contentFit="cover"
          />
          <View className="flex-1 p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
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
            <View className="flex-row items-center justify-between mb-2">
              <View className={`flex-row items-center px-2 py-1 rounded-lg ${status.bg}`}>
                <StatusIcon size={12} color={status.text.replace('text-', '#').replace('-500', '')} />
                <Text className={`text-xs font-medium ml-1 capitalize ${status.text}`}>
                  {booking.status}
                </Text>
              </View>
              <Text className="text-primary-500 font-bold">₹{booking.monthlyRent}/mo</Text>
            </View>
            {/* Payment Status */}
            <View className="flex-row items-center justify-between">
              <View className={`flex-row items-center px-2 py-1 rounded-lg ${paymentStatus.bg}`}>
                <CreditCard size={10} color={paymentStatus.text.includes('green') ? '#22C55E' : paymentStatus.text.includes('orange') ? '#F97316' : '#EAB308'} />
                <Text className={`text-xs font-medium ml-1 capitalize ${paymentStatus.text}`}>
                  {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        {needsPayment && (
          <View className="px-4 py-3 border-t border-dark-border bg-primary-500/5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-dark-text text-xs">Total Due</Text>
                <View className="flex-row items-center">
                  <IndianRupee size={14} color="#F97316" />
                  <Text className="text-primary-500 font-bold text-lg">{booking.totalAmount?.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => handlePayNow(booking)}
                className="bg-primary-500 px-6 py-2.5 rounded-xl flex-row items-center"
              >
                <CreditCard size={16} color="#fff" />
                <Text className="text-white font-bold ml-2">Pay Now</Text>
              </Pressable>
            </View>
          </View>
        )}

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
