import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitRequestsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  AlertCircle,
  Phone,
  Mail,
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
  rejected: { 
    bg: 'bg-red-500/20', 
    text: 'text-red-500', 
    icon: XCircle, 
    label: 'Declined',
  },
  cancelled: { 
    bg: 'bg-gray-500/20', 
    text: 'text-gray-500', 
    icon: XCircle, 
    label: 'Cancelled',
  },
  completed: { 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-500', 
    icon: CheckCircle, 
    label: 'Completed',
  },
  rescheduled: { 
    bg: 'bg-purple-500/20', 
    text: 'text-purple-500', 
    icon: AlertCircle, 
    label: 'Rescheduled',
  },
};

interface VisitRequest {
  _id: string;
  status: keyof typeof STATUS_CONFIG;
  preferredDate: string;
  preferredTime?: string;
  confirmedDate?: string;
  confirmedTime?: string;
  message?: string;
  ownerNotes?: string;
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
  owner?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export default function VisitsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['visitRequests'],
    queryFn: async () => {
      const response = await visitRequestsApi.getAll();
      return response;
    },
    enabled: isAuthenticated,
  });

  // Handle nested API response: data.data.visits or data.data if it's already an array
  const responseData = data?.data as any;
  const visits: VisitRequest[] = Array.isArray(responseData) 
    ? responseData 
    : (responseData?.visits || []);

  const upcomingVisits = visits.filter((v) => 
    ['pending', 'confirmed', 'rescheduled'].includes(v.status)
  );
  const pastVisits = visits.filter((v) => 
    ['completed', 'cancelled', 'rejected'].includes(v.status)
  );

  const displayVisits = activeTab === 'upcoming' ? upcomingVisits : pastVisits;

  // Cancel visit mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return visitRequestsApi.cancel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitRequests'] });
      Alert.alert('Cancelled', 'Visit request has been cancelled');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to cancel visit');
    },
  });

  const handleCancel = (visit: VisitRequest) => {
    Alert.alert(
      'Cancel Visit',
      'Are you sure you want to cancel this visit?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => cancelMutation.mutate(visit._id) 
        },
      ]
    );
  };

  const handleViewRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const VisitCard = ({ item, index }: { item: VisitRequest; index: number }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    const visitDate = item.confirmedDate || item.preferredDate;
    const visitTime = item.confirmedTime || item.preferredTime;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <Pressable
          onPress={() => handleViewRoom(item.room._id)}
          className="bg-dark-surface rounded-2xl p-4 mb-4"
        >
          {/* Room Info */}
          <View className="flex-row mb-4">
            <Image
              source={{ uri: item.room.images?.[0] || 'https://via.placeholder.com/100' }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-white font-bold text-base" numberOfLines={1}>
                {item.room.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={12} color="#71717A" />
                <Text className="text-dark-muted text-sm ml-1" numberOfLines={1}>
                  {item.room.location?.city || 'Unknown location'}
                </Text>
              </View>
              
              {/* Status Badge */}
              <View className={`flex-row items-center mt-2 ${config.bg} px-2 py-1 rounded-full self-start`}>
                <StatusIcon size={12} color={config.text.includes('green') ? '#22C55E' : 
                  config.text.includes('red') ? '#EF4444' : 
                  config.text.includes('yellow') ? '#F59E0B' : 
                  config.text.includes('blue') ? '#3B82F6' : 
                  config.text.includes('purple') ? '#A855F7' : '#71717A'} />
                <Text className={`ml-1 text-xs font-medium ${config.text}`}>
                  {config.label}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#71717A" />
          </View>

          {/* Visit Details */}
          <View className="bg-dark-card rounded-xl p-3 mb-3">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#F97316" />
              <Text className="text-white font-medium ml-2">
                {formatDate(visitDate)}
              </Text>
            </View>
            {visitTime && (
              <View className="flex-row items-center">
                <Clock size={16} color="#F97316" />
                <Text className="text-white font-medium ml-2">{visitTime}</Text>
              </View>
            )}
          </View>

          {/* Owner Info (if confirmed) */}
          {item.status === 'confirmed' && item.owner && (
            <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
              <Text className="text-green-400 font-semibold mb-2">Contact Owner</Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-white">{item.owner.fullName}</Text>
              </View>
              {item.owner.phone && (
                <View className="flex-row items-center mb-1">
                  <Phone size={12} color="#71717A" />
                  <Text className="text-dark-text text-sm ml-2">{item.owner.phone}</Text>
                </View>
              )}
              {item.owner.email && (
                <View className="flex-row items-center">
                  <Mail size={12} color="#71717A" />
                  <Text className="text-dark-text text-sm ml-2">{item.owner.email}</Text>
                </View>
              )}
            </View>
          )}

          {/* Messages */}
          {item.message && (
            <View className="mb-3">
              <Text className="text-dark-muted text-xs mb-1">Your note:</Text>
              <Text className="text-white text-sm">{item.message}</Text>
            </View>
          )}

          {item.ownerNotes && (
            <View className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
              <Text className="text-blue-400 text-xs mb-1">Owner's note:</Text>
              <Text className="text-white text-sm">{item.ownerNotes}</Text>
            </View>
          )}

          {/* Actions */}
          {item.status === 'pending' && (
            <Pressable
              onPress={() => handleCancel(item)}
              className="bg-red-500/20 border border-red-500/30 py-3 rounded-xl mt-2"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-red-400 font-semibold text-center">Cancel Request</Text>
              )}
            </Pressable>
          )}

          {/* Created Date */}
          <Text className="text-dark-muted text-xs mt-2">
            Requested on {formatDate(item.createdAt)}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={64} color="#71717A" />
          <Text className="text-white text-xl font-bold mt-4">Scheduled Visits</Text>
          <Text className="text-dark-text text-center mt-2">
            Sign in to view and manage your property visits
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

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold flex-1">Scheduled Visits</Text>
        <View className="bg-primary-500/20 px-3 py-1 rounded-full">
          <Text className="text-primary-500 font-medium">{visits.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-6 pb-4">
        <View className="flex-row bg-dark-surface rounded-xl p-1">
          <Pressable
            onPress={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'upcoming' ? 'bg-primary-500' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'upcoming' ? 'text-white' : 'text-dark-muted'}`}>
              Upcoming ({upcomingVisits.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('past')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'past' ? 'bg-primary-500' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'past' ? 'text-white' : 'text-dark-muted'}`}>
              Past ({pastVisits.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={displayVisits}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <VisitCard item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#F97316"
            />
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Calendar size={48} color="#71717A" />
              <Text className="text-dark-text mt-4 text-center">
                {activeTab === 'upcoming' ? 'No upcoming visits' : 'No past visits'}
              </Text>
              <Text className="text-dark-muted mt-2 text-center text-sm">
                Schedule visits from room details page
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
