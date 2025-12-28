import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { negotiationsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  DollarSign,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  TrendingDown,
  AlertCircle,
  ChevronRight,
} from 'lucide-react-native';

const STATUS_CONFIG = {
  pending: { 
    bg: 'bg-yellow-500/20', 
    text: 'text-yellow-500', 
    icon: Clock, 
    label: 'Pending',
    description: 'Waiting for owner response'
  },
  accepted: { 
    bg: 'bg-green-500/20', 
    text: 'text-green-500', 
    icon: CheckCircle, 
    label: 'Accepted',
    description: 'Owner accepted your offer'
  },
  rejected: { 
    bg: 'bg-red-500/20', 
    text: 'text-red-500', 
    icon: XCircle, 
    label: 'Rejected',
    description: 'Owner declined your offer'
  },
  countered: { 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-500', 
    icon: MessageSquare, 
    label: 'Counter Offer',
    description: 'Owner made a counter offer'
  },
  withdrawn: { 
    bg: 'bg-gray-500/20', 
    text: 'text-gray-500', 
    icon: AlertCircle, 
    label: 'Withdrawn',
    description: 'You withdrew this negotiation'
  },
};

interface Negotiation {
  _id: string;
  status: keyof typeof STATUS_CONFIG;
  originalPrice: number;
  proposedPrice: number;
  counterOffer?: number;
  finalPrice?: number;
  message?: string;
  ownerResponse?: string;
  counterMessage?: string;
  createdAt: string;
  room: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
    location?: {
      city?: string;
      address?: string;
    };
  };
  counterparty?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export default function NegotiationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['negotiations'],
    queryFn: async () => {
      const response = await negotiationsApi.getAll();
      return response;
    },
    enabled: isAuthenticated,
  });

  // Handle nested API response: data.data.negotiations or data.data if it's already an array
  const responseData = data?.data as any;
  const negotiations: Negotiation[] = Array.isArray(responseData) 
    ? responseData 
    : (responseData?.negotiations || []);

  const filteredNegotiations = negotiations.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return n.status === 'pending' || n.status === 'countered';
    return n.status === activeTab;
  });

  // Accept counter offer mutation
  const acceptCounterMutation = useMutation({
    mutationFn: async (id: string) => {
      return negotiationsApi.respond(id, { action: 'accept' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
      Alert.alert('Success', 'You accepted the counter offer!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept offer');
    },
  });

  const handleAcceptCounter = (negotiation: Negotiation) => {
    Alert.alert(
      'Accept Counter Offer',
      `Accept the owner's counter offer of ₹${negotiation.counterOffer}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => acceptCounterMutation.mutate(negotiation._id) 
        },
      ]
    );
  };

  const handleViewRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const NegotiationCard = ({ item, index }: { item: Negotiation; index: number }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    const savings = item.originalPrice - (item.finalPrice || item.proposedPrice);
    const savingsPercent = Math.round((savings / item.originalPrice) * 100);

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
              <Text className="text-dark-muted text-sm" numberOfLines={1}>
                {item.room.location?.city || 'Unknown location'}
              </Text>
              
              {/* Status Badge */}
              <View className={`flex-row items-center mt-2 ${config.bg} px-2 py-1 rounded-full self-start`}>
                <StatusIcon size={12} color={config.text.includes('green') ? '#22C55E' : 
                  config.text.includes('red') ? '#EF4444' : 
                  config.text.includes('yellow') ? '#F59E0B' : 
                  config.text.includes('blue') ? '#3B82F6' : '#71717A'} />
                <Text className={`ml-1 text-xs font-medium ${config.text}`}>
                  {config.label}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#71717A" />
          </View>

          {/* Price Details */}
          <View className="bg-dark-card rounded-xl p-3 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-dark-muted text-sm">Original Price</Text>
              <Text className="text-white font-medium">₹{item.originalPrice}/mo</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-dark-muted text-sm">Your Offer</Text>
              <Text className="text-primary-500 font-medium">₹{item.proposedPrice}/mo</Text>
            </View>
            {item.counterOffer && (
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-dark-muted text-sm">Counter Offer</Text>
                <Text className="text-blue-400 font-medium">₹{item.counterOffer}/mo</Text>
              </View>
            )}
            {item.finalPrice && (
              <View className="flex-row items-center justify-between">
                <Text className="text-dark-muted text-sm">Final Price</Text>
                <View className="flex-row items-center">
                  <TrendingDown size={14} color="#22C55E" />
                  <Text className="text-green-500 font-bold ml-1">₹{item.finalPrice}/mo</Text>
                </View>
              </View>
            )}
          </View>

          {/* Savings Info */}
          {item.status === 'accepted' && savings > 0 && (
            <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
              <Text className="text-green-500 font-semibold text-center">
                🎉 You saved ₹{savings}/month ({savingsPercent}% off)
              </Text>
            </View>
          )}

          {/* Messages */}
          {item.message && (
            <View className="mb-3">
              <Text className="text-dark-muted text-xs mb-1">Your message:</Text>
              <Text className="text-white text-sm">{item.message}</Text>
            </View>
          )}

          {item.ownerResponse && (
            <View className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
              <Text className="text-blue-400 text-xs mb-1">Owner's response:</Text>
              <Text className="text-white text-sm">{item.ownerResponse}</Text>
            </View>
          )}

          {/* Actions for Counter Offers */}
          {item.status === 'countered' && (
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => handleAcceptCounter(item)}
                className="flex-1 bg-green-500 py-3 rounded-xl"
                disabled={acceptCounterMutation.isPending}
              >
                {acceptCounterMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-center">Accept ₹{item.counterOffer}</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => handleViewRoom(item.room._id)}
                className="flex-1 bg-dark-card py-3 rounded-xl border border-dark-border"
              >
                <Text className="text-white font-semibold text-center">View Room</Text>
              </Pressable>
            </View>
          )}

          {/* Date */}
          <Text className="text-dark-muted text-xs mt-2">
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <DollarSign size={64} color="#71717A" />
          <Text className="text-white text-xl font-bold mt-4">Price Negotiations</Text>
          <Text className="text-dark-text text-center mt-2">
            Sign in to view and manage your price negotiations
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
        <Text className="text-white text-xl font-bold flex-1">Negotiations</Text>
        <View className="bg-primary-500/20 px-3 py-1 rounded-full">
          <Text className="text-primary-500 font-medium">{negotiations.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-6 pb-4">
        <View className="flex-row bg-dark-surface rounded-xl p-1">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg ${activeTab === tab ? 'bg-primary-500' : ''}`}
            >
              <Text className={`text-center font-medium capitalize ${activeTab === tab ? 'text-white' : 'text-dark-muted'}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={filteredNegotiations}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <NegotiationCard item={item} index={index} />}
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
              <DollarSign size={48} color="#71717A" />
              <Text className="text-dark-text mt-4 text-center">
                No negotiations found
              </Text>
              <Text className="text-dark-muted mt-2 text-center text-sm">
                Start negotiating on room details page
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
