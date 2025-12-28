import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

const NOTIFICATION_ICONS: Record<string, any> = {
  booking: Home,
  negotiation: DollarSign,
  visit: Calendar,
  message: MessageSquare,
  alert: AlertCircle,
  success: CheckCircle,
  error: XCircle,
  default: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  booking: '#F97316',
  negotiation: '#22C55E',
  visit: '#3B82F6',
  message: '#A855F7',
  alert: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
  default: '#71717A',
};

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    roomId?: string;
    bookingId?: string;
    negotiationId?: string;
    visitId?: string;
  };
  createdAt: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getAll();
      return response;
    },
    enabled: isAuthenticated,
  });

  const notifications: Notification[] = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return notificationsApi.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return notificationsApi.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    // Navigate based on type
    if (notification.data?.roomId) {
      router.push(`/room/${notification.data.roomId}`);
    } else if (notification.data?.bookingId) {
      router.push('/(tabs)/bookings');
    } else if (notification.data?.negotiationId) {
      router.push('/negotiations');
    } else if (notification.data?.visitId) {
      router.push('/visits');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const NotificationItem = ({ item, index }: { item: Notification; index: number }) => {
    const Icon = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.default;
    const color = NOTIFICATION_COLORS[item.type] || NOTIFICATION_COLORS.default;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => handleNotificationPress(item)}
          className={`flex-row p-4 border-b border-dark-border ${!item.isRead ? 'bg-dark-surface' : ''}`}
        >
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={22} color={color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-start justify-between">
              <Text className={`font-semibold flex-1 ${!item.isRead ? 'text-white' : 'text-dark-text'}`}>
                {item.title}
              </Text>
              <Text className="text-dark-muted text-xs ml-2">{formatTime(item.createdAt)}</Text>
            </View>
            <Text className="text-dark-muted text-sm mt-1" numberOfLines={2}>
              {item.message}
            </Text>
          </View>
          {!item.isRead && (
            <View className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-2" />
          )}
        </Pressable>
      </Animated.View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Bell size={64} color="#71717A" />
          <Text className="text-white text-xl font-bold mt-4">Notifications</Text>
          <Text className="text-dark-text text-center mt-2">
            Sign in to view your notifications
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
      <View className="px-6 pt-4 pb-4 flex-row items-center border-b border-dark-border">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold flex-1">Notifications</Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllReadMutation.mutate()}
            className="flex-row items-center"
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck size={18} color="#F97316" />
            <Text className="text-primary-500 font-medium ml-1">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <View className="px-6 py-3 bg-primary-500/10 border-b border-primary-500/20">
          <Text className="text-primary-500 font-medium">
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <NotificationItem item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#F97316"
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center px-6">
              <Bell size={64} color="#71717A" />
              <Text className="text-dark-text mt-4 text-center text-lg">
                No notifications yet
              </Text>
              <Text className="text-dark-muted mt-2 text-center">
                You'll receive updates about your bookings, negotiations, and visits here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
