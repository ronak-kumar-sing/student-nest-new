import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomSharingApi } from '../../lib/api';
import { RoomSharing } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import {
  Users,
  MapPin,
  ChevronLeft,
  Plus,
  Filter,
  IndianRupee,
  Calendar,
  User,
  Mail,
  Phone,
  MessageCircle,
  X,
  CheckCircle,
  Clock,
  Home,
} from 'lucide-react-native';
import { FadeIn, SlideIn } from '../../components/Animations';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-500' },
  full: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
  closed: { bg: 'bg-red-500/20', text: 'text-red-500' },
  pending: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
};

export default function RoomSharingListScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedShare, setSelectedShare] = useState<RoomSharing | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filters, setFilters] = useState<{
    gender?: string;
    maxBudget?: number;
    city?: string;
  }>({});

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['roomSharing', filters],
    queryFn: () => roomSharingApi.getAll(filters),
  });

  const applyMutation = useMutation({
    mutationFn: (shareId: string) => roomSharingApi.apply(shareId, {
      message: 'Hi! I would like to join this room sharing arrangement.',
    }),
    onSuccess: () => {
      setShowApplyModal(false);
      setSelectedShare(null);
      queryClient.invalidateQueries({ queryKey: ['roomSharing'] });
    },
  });

  // Handle different API response formats
  const shares: RoomSharing[] = Array.isArray(data?.data) 
    ? data.data as RoomSharing[]
    : Array.isArray((data?.data as any)?.shares) 
      ? ((data?.data as any)?.shares || []) as RoomSharing[]
      : Array.isArray((data?.data as any)?.requests)
        ? ((data?.data as any)?.requests || []) as RoomSharing[]
        : [];

  const handleApply = (share: RoomSharing) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    setSelectedShare(share);
    setShowApplyModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const RoomShareCard = ({ share, index }: { share: RoomSharing; index: number }) => {
    const status = STATUS_COLORS[share.status] || STATUS_COLORS.active;
    const availableSlots = share.maxParticipants - (share.currentParticipants?.length || 1);

    return (
      <SlideIn delay={index * 100} from="bottom" distance={30}>
        <Pressable
          onPress={() => router.push(`/room-sharing/${share.id || share._id}`)}
          className="bg-dark-surface rounded-2xl overflow-hidden mb-4 mx-4"
        >
          {/* Property Image */}
          <View className="relative">
            <Image
              source={{ uri: share.property?.images?.[0] || 'https://via.placeholder.com/400x200' }}
              style={{ width: '100%', height: 140 }}
              contentFit="cover"
            />
            <View className={`absolute top-3 left-3 px-3 py-1 rounded-lg ${status.bg}`}>
              <Text className={`font-semibold text-sm ${status.text} capitalize`}>
                {share.status}
              </Text>
            </View>
            <View className="absolute top-3 right-3 bg-dark-bg/80 px-3 py-1 rounded-lg flex-row items-center">
              <Users size={14} color="#F97316" />
              <Text className="text-white font-medium ml-1">{availableSlots} slots</Text>
            </View>
          </View>

          <View className="p-4">
            {/* Title & Price */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <Text className="text-white font-bold text-lg" numberOfLines={1}>
                  {share.property?.title || 'Room Sharing'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={14} color="#71717A" />
                  <Text className="text-dark-text text-sm ml-1" numberOfLines={1}>
                    {share.property?.location?.city}, {share.property?.location?.state}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  <IndianRupee size={16} color="#F97316" />
                  <Text className="text-primary-500 font-bold text-lg">
                    {share.costSharing?.rentPerPerson?.toLocaleString() || '0'}
                  </Text>
                </View>
                <Text className="text-dark-muted text-xs">/person/mo</Text>
              </View>
            </View>

            {/* Initiator Info */}
            <View className="flex-row items-center bg-dark-bg/50 rounded-xl p-3 mb-3">
              {share.initiator?.profilePhoto ? (
                <Image
                  source={{ uri: share.initiator.profilePhoto }}
                  style={{ width: 40, height: 40 }}
                  className="rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="w-10 h-10 bg-primary-500/20 rounded-full items-center justify-center">
                  <Text className="text-primary-500 font-bold">
                    {share.initiator?.fullName?.charAt(0) || share.initiator?.name?.charAt(0) || 'S'}
                  </Text>
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="text-white font-medium">
                  {share.initiator?.fullName || share.initiator?.name || 'Student'}
                </Text>
                <Text className="text-dark-muted text-xs">Looking for roommates</Text>
              </View>
              {share.initiator?.isVerified && (
                <View className="bg-green-500/20 px-2 py-1 rounded-full">
                  <Text className="text-green-500 text-xs">Verified</Text>
                </View>
              )}
            </View>

            {/* Requirements */}
            <View className="flex-row flex-wrap mb-3">
              {share.requirements?.gender && share.requirements.gender !== 'any' && (
                <View className="bg-dark-bg px-3 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-dark-text text-xs capitalize">{share.requirements.gender} only</Text>
                </View>
              )}
              {share.requirements?.lifestyle?.map((item, idx) => (
                <View key={idx} className="bg-dark-bg px-3 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-dark-text text-xs capitalize">{item}</Text>
                </View>
              ))}
            </View>

            {/* Available From & Action */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={14} color="#71717A" />
                <Text className="text-dark-muted text-sm ml-1">
                  From {formatDate(share.availableFrom)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleApply(share)}
                disabled={availableSlots === 0}
                className={`px-4 py-2 rounded-xl ${
                  availableSlots === 0 ? 'bg-dark-border' : 'bg-primary-500'
                }`}
              >
                <Text className={`font-bold ${availableSlots === 0 ? 'text-dark-muted' : 'text-white'}`}>
                  {availableSlots === 0 ? 'Full' : 'Apply'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </SlideIn>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-dark-text mt-4">Loading room shares...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-dark-surface rounded-full items-center justify-center"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Room Sharing</Text>
          <View className="flex-row items-center">
            {isAuthenticated && (
              <Pressable
                onPress={() => router.push('/room-sharing/my-shares')}
                className="w-10 h-10 bg-dark-surface rounded-full items-center justify-center mr-2"
              >
                <Home size={20} color="#F97316" />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push('/room-sharing/create')}
              className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
            >
              <Plus size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(500)} className="px-4 mb-4">
          <View className="flex-row">
            <View className="flex-1 bg-dark-surface rounded-xl p-4 mr-2">
              <Text className="text-white text-2xl font-bold">{shares.length}</Text>
              <Text className="text-dark-muted text-sm">Available</Text>
            </View>
            <View className="flex-1 bg-dark-surface rounded-xl p-4 mx-2">
              <Text className="text-green-500 text-2xl font-bold">
                {shares.filter(s => s.status === 'active').length}
              </Text>
              <Text className="text-dark-muted text-sm">Active</Text>
            </View>
            <View className="flex-1 bg-dark-surface rounded-xl p-4 ml-2">
              <Text className="text-yellow-500 text-2xl font-bold">
                {shares.filter(s => s.status === 'full').length}
              </Text>
              <Text className="text-dark-muted text-sm">Full</Text>
            </View>
          </View>
        </Animated.View>

        {/* List */}
        <FlatList
          data={shares}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item, index }) => <RoomShareCard share={item} index={index} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#F97316"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <Users size={64} color="#71717A" />
              <Text className="text-white text-xl font-bold mt-4">No Room Shares Yet</Text>
              <Text className="text-dark-text text-center mt-2">
                Be the first to create a room sharing request and find compatible roommates!
              </Text>
              <Pressable
                onPress={() => router.push('/room-sharing/create')}
                className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
              >
                <Text className="text-white font-bold">Create Request</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Apply Modal */}
        <Modal
          visible={showApplyModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowApplyModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/60"
            onPress={() => setShowApplyModal(false)}
          >
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  className="bg-dark-surface rounded-t-3xl"
                >
                  <SafeAreaView edges={['bottom']}>
                    <View className="p-6">
                      <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-white text-xl font-bold">Apply for Room Share</Text>
                        <Pressable
                          onPress={() => setShowApplyModal(false)}
                          className="w-10 h-10 bg-dark-bg rounded-full items-center justify-center"
                        >
                          <X size={20} color="#71717A" />
                        </Pressable>
                      </View>

                      {selectedShare && (
                        <>
                          {/* Share Info */}
                          <View className="bg-dark-bg rounded-xl p-4 mb-4">
                            <Text className="text-white font-bold text-lg mb-2">
                              {selectedShare.property?.title}
                            </Text>
                            <View className="flex-row items-center mb-2">
                              <MapPin size={14} color="#71717A" />
                              <Text className="text-dark-text ml-2">
                                {selectedShare.property?.location?.city}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <IndianRupee size={14} color="#F97316" />
                              <Text className="text-primary-500 font-bold ml-1">
                                {selectedShare.costSharing?.rentPerPerson?.toLocaleString()}/month
                              </Text>
                            </View>
                          </View>

                          {/* Initiator */}
                          <View className="flex-row items-center bg-dark-bg rounded-xl p-4 mb-6">
                            <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
                              <Text className="text-primary-500 font-bold text-lg">
                                {selectedShare.initiator?.fullName?.charAt(0) || 'S'}
                              </Text>
                            </View>
                            <View className="flex-1 ml-3">
                              <Text className="text-white font-medium">
                                {selectedShare.initiator?.fullName}
                              </Text>
                              <Text className="text-dark-muted text-sm">Initiator</Text>
                            </View>
                          </View>

                          {/* Apply Button */}
                          <Pressable
                            onPress={() => applyMutation.mutate(selectedShare.id || selectedShare._id)}
                            disabled={applyMutation.isPending}
                            className={`py-4 rounded-xl items-center ${
                              applyMutation.isPending ? 'bg-primary-700' : 'bg-primary-500'
                            }`}
                          >
                            {applyMutation.isPending ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <Text className="text-white font-bold text-lg">Send Application</Text>
                            )}
                          </Pressable>

                          <Text className="text-dark-muted text-center text-sm mt-4">
                            The initiator will review your application and contact you if interested.
                          </Text>
                        </>
                      )}
                    </View>
                  </SafeAreaView>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </>
  );
}
