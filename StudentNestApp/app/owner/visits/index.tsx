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
import { visitRequestsApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Eye,
  ChevronLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
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
    label: 'Rejected',
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
    icon: Calendar,
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

export default function OwnerVisitsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'all'>('pending');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ownerVisits'],
    queryFn: () => visitRequestsApi.getAll(),
    enabled: isAuthenticated && user?.role?.toLowerCase() === 'owner',
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action, message }: { id: string; action: 'confirm' | 'reject'; message?: string }) =>
      visitRequestsApi.respond(id, { action, message }),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerVisits'] });
      Alert.alert('Success', `Visit ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to respond');
    },
  });

  // Handle nested API response
  const visits: VisitRequest[] = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.visits || []);

  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return v.status === 'pending';
    if (activeTab === 'upcoming') return ['confirmed', 'rescheduled'].includes(v.status);
    return true;
  });

  const tabs = [
    { key: 'pending', label: 'Pending', count: visits.filter(v => v.status === 'pending').length },
    { key: 'upcoming', label: 'Upcoming', count: visits.filter(v => ['confirmed', 'rescheduled'].includes(v.status)).length },
    { key: 'all', label: 'All', count: visits.length },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleRespond = (visit: VisitRequest, action: 'confirm' | 'reject') => {
    const actionLabel = action === 'confirm' ? 'confirm' : 'reject';
    Alert.alert(
      `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} Visit`,
      `Are you sure you want to ${actionLabel} this visit request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1),
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: () => respondMutation.mutate({ id: visit._id, action }),
        },
      ]
    );
  };

  const VisitCard = ({ item, index }: { item: VisitRequest; index: number }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <View className="bg-dark-surface rounded-2xl overflow-hidden mb-4">
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
                  <StatusIcon size={12} color={
                    config.text.includes('yellow') ? '#EAB308' :
                    config.text.includes('green') ? '#22C55E' :
                    config.text.includes('red') ? '#EF4444' :
                    config.text.includes('blue') ? '#3B82F6' :
                    config.text.includes('purple') ? '#A855F7' :
                    '#71717A'
                  } />
                  <Text className={`text-xs font-medium ml-1 ${config.text}`}>{config.label}</Text>
                </View>
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

          {/* Visit Time */}
          <View className="mx-4 px-4 py-3 bg-dark-border/50 rounded-xl flex-row items-center">
            <Calendar size={18} color="#F97316" />
            <View className="ml-3">
              <Text className="text-white font-medium">
                {formatDate(item.confirmedDate || item.preferredDate)}
              </Text>
              <Text className="text-dark-muted text-sm">
                {item.confirmedTime || item.preferredTime || 'Time not set'}
              </Text>
            </View>
          </View>

          {/* Student Info */}
          {item.student && (
            <View className="px-4 py-4">
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
              {item.message && (
                <View className="mt-3 p-3 bg-dark-border/30 rounded-xl flex-row">
                  <MessageSquare size={14} color="#71717A" />
                  <Text className="text-dark-text text-sm ml-2 flex-1">
                    "{item.message}"
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Actions for Pending */}
          {item.status === 'pending' && (
            <View className="flex-row gap-3 p-4 pt-0">
              <Pressable
                onPress={() => handleRespond(item, 'reject')}
                disabled={respondMutation.isPending}
                className="flex-1 bg-red-500/20 py-3 rounded-xl items-center"
              >
                <Text className="text-red-500 font-bold">Reject</Text>
              </Pressable>
              <Pressable
                onPress={() => handleRespond(item, 'confirm')}
                disabled={respondMutation.isPending}
                className="flex-1 bg-green-500 py-3 rounded-xl items-center"
              >
                {respondMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Confirm</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'owner') {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Eye size={64} color="#71717A" />
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
        <Text className="text-white text-xl font-bold">Visit Requests</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === tab.key ? 'bg-primary-500' : 'bg-dark-surface'
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
          data={filteredVisits}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <VisitCard item={item} index={index} />}
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
              <Eye size={64} color="#71717A" />
              <Text className="text-white text-xl font-bold mt-4">No Visit Requests</Text>
              <Text className="text-dark-muted text-center mt-2 px-6">
                {activeTab === 'pending'
                  ? 'No pending visit requests'
                  : activeTab === 'upcoming'
                  ? 'No upcoming visits scheduled'
                  : 'You have no visit requests yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
