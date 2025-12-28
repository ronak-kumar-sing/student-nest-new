import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomSharingApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import {
  Users,
  MapPin,
  ChevronLeft,
  IndianRupee,
  Calendar,
  User,
  Mail,
  Phone,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  MessageCircle,
  ChevronRight,
  Trash2,
} from 'lucide-react-native';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Active' },
  full: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Full' },
  closed: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Closed' },
  pending: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Pending' },
};

const APPLICATION_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pending' },
  accepted: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Accepted' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Withdrawn' },
};

export default function MySharesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [selectedShare, setSelectedShare] = useState<any>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myShares'],
    queryFn: () => roomSharingApi.getMyShares(),
    enabled: isAuthenticated,
  });

  const respondMutation = useMutation({
    mutationFn: ({ shareId, applicationId, action, message }: {
      shareId: string;
      applicationId: string;
      action: 'accepted' | 'rejected';
      message?: string;
    }) => roomSharingApi.respondToApplication(shareId, applicationId, action, message),
    onSuccess: (_, { action }) => {
      Alert.alert('Success', `Application ${action} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['myShares'] });
      queryClient.invalidateQueries({ queryKey: ['roomSharing'] });
      refetch();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to respond to application');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => roomSharingApi.close(id),
    onSuccess: () => {
      Alert.alert('Success', 'Listing closed successfully');
      queryClient.invalidateQueries({ queryKey: ['myShares'] });
      queryClient.invalidateQueries({ queryKey: ['roomSharing'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to close listing');
    },
  });

  const shares = data?.data || [];

  const handleRespondToApplication = (
    shareId: string,
    applicationId: string,
    action: 'accepted' | 'rejected'
  ) => {
    const actionLabel = action === 'accepted' ? 'accept' : 'reject';
    Alert.alert(
      `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} Application`,
      `Are you sure you want to ${actionLabel} this application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1),
          style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => respondMutation.mutate({ shareId, applicationId, action }),
        },
      ]
    );
  };

  const handleCloseShare = (id: string) => {
    Alert.alert(
      'Close Listing',
      'Are you sure you want to close this room sharing listing? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: () => deactivateMutation.mutate(id),
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Users size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Sign In Required</Text>
        <Text className="text-dark-text text-center mt-2">
          Please sign in to view your room sharing listings
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

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-dark-surface items-center justify-center mr-3"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">My Listings</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-20"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : shares.length === 0 ? (
          <View className="items-center py-20">
            <Home size={64} color="#71717A" />
            <Text className="text-white text-lg font-bold mt-4">No Listings Yet</Text>
            <Text className="text-dark-text text-center mt-2 px-6">
              You haven't created any room sharing listings yet
            </Text>
            <Pressable
              onPress={() => router.push('/room-sharing/create')}
              className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-bold">Create Listing</Text>
            </Pressable>
          </View>
        ) : (
          shares.map((share: any, index: number) => {
            const status = STATUS_COLORS[share.status] || STATUS_COLORS.active;
            const pendingApplications = share.applications?.filter(
              (app: any) => app.status === 'pending'
            ) || [];

            return (
              <Animated.View
                key={share._id || share.id}
                entering={FadeInDown.delay(index * 100).duration(500)}
                layout={Layout.duration(300)}
                className="bg-dark-surface rounded-2xl overflow-hidden mb-4"
              >
                {/* Property Info */}
                <View className="flex-row p-4">
                  <Image
                    source={{
                      uri: share.property?.images?.[0] || 'https://via.placeholder.com/100',
                    }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center justify-between">
                      <View className={`${status.bg} px-2 py-1 rounded-full`}>
                        <Text className={`${status.text} text-xs font-medium`}>
                          {status.label}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleCloseShare(share._id || share.id)}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                    <Text className="text-white font-bold mt-1" numberOfLines={1}>
                      {share.property?.title || 'Room Sharing'}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#71717A" />
                      <Text className="text-dark-text text-xs ml-1">
                        {share.property?.location?.city || 'Unknown location'}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <IndianRupee size={14} color="#F97316" />
                      <Text className="text-primary-500 font-bold">
                        {share.costSharing?.rentPerPerson || share.cost?.rentPerPerson}/person
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats Row */}
                <View className="flex-row px-4 pb-3">
                  <View className="flex-1 flex-row items-center">
                    <Users size={14} color="#71717A" />
                    <Text className="text-dark-text text-xs ml-1">
                      {share.currentParticipants?.filter((p: any) => p.status === 'confirmed').length || 1}/
                      {share.maxParticipants} members
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={14} color="#71717A" />
                    <Text className="text-dark-text text-xs ml-1">
                      {formatDate(share.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Applications Section */}
                {pendingApplications.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSelectedShare(share);
                      setShowApplicationsModal(true);
                    }}
                    className="bg-primary-500/10 px-4 py-3 flex-row items-center justify-between border-t border-dark-border"
                  >
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center mr-2">
                        <Text className="text-white text-xs font-bold">
                          {pendingApplications.length}
                        </Text>
                      </View>
                      <Text className="text-primary-500 font-medium">
                        Pending Applications
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#F97316" />
                  </Pressable>
                )}

                {/* All Applications Button */}
                <Pressable
                  onPress={() => {
                    setSelectedShare(share);
                    setShowApplicationsModal(true);
                  }}
                  className="bg-dark-card px-4 py-3 flex-row items-center justify-center border-t border-dark-border"
                >
                  <MessageCircle size={16} color="#9CA3AF" />
                  <Text className="text-dark-text font-medium ml-2">
                    View All Applications ({share.applications?.length || 0})
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Applications Modal */}
      <Modal
        visible={showApplicationsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplicationsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-dark-surface rounded-t-3xl max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-dark-border">
              <Text className="text-white text-lg font-bold">Applications</Text>
              <Pressable
                onPress={() => setShowApplicationsModal(false)}
                className="w-8 h-8 bg-dark-card rounded-full items-center justify-center"
              >
                <X size={18} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[500px]" contentContainerClassName="p-4">
              {selectedShare?.applications?.length === 0 ? (
                <View className="items-center py-10">
                  <Users size={48} color="#71717A" />
                  <Text className="text-white font-bold mt-4">No Applications Yet</Text>
                  <Text className="text-dark-text text-center mt-2">
                    When someone applies, you'll see their information here
                  </Text>
                </View>
              ) : (
                selectedShare?.applications?.map((application: any, index: number) => {
                  const appStatus = APPLICATION_STATUS[application.status] || APPLICATION_STATUS.pending;
                  const applicant = application.applicant;

                  return (
                    <Animated.View
                      key={application._id || index}
                      entering={FadeInDown.delay(index * 50).duration(300)}
                      className="bg-dark-card rounded-xl p-4 mb-3"
                    >
                      {/* Applicant Info */}
                      <View className="flex-row items-center">
                        {applicant?.profilePhoto ? (
                          <Image
                            source={{ uri: applicant.profilePhoto }}
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
                            <Text className="text-primary-500 text-lg font-bold">
                              {applicant?.fullName?.charAt(0) || 'U'}
                            </Text>
                          </View>
                        )}
                        <View className="flex-1 ml-3">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-white font-bold">
                              {applicant?.fullName || 'Unknown User'}
                            </Text>
                            <View className={`${appStatus.bg} px-2 py-1 rounded-full`}>
                              <Text className={`${appStatus.text} text-xs font-medium`}>
                                {appStatus.label}
                              </Text>
                            </View>
                          </View>
                          {applicant?.email && (
                            <View className="flex-row items-center mt-1">
                              <Mail size={12} color="#71717A" />
                              <Text className="text-dark-text text-xs ml-1">
                                {applicant.email}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Application Message */}
                      {application.message && (
                        <View className="bg-dark-bg rounded-lg p-3 mt-3">
                          <Text className="text-dark-text text-sm">
                            "{application.message}"
                          </Text>
                        </View>
                      )}

                      {/* Applied Date */}
                      <View className="flex-row items-center mt-3">
                        <Calendar size={12} color="#71717A" />
                        <Text className="text-dark-muted text-xs ml-1">
                          Applied {formatDate(application.appliedAt)}
                        </Text>
                      </View>

                      {/* Action Buttons (only for pending applications) */}
                      {application.status === 'pending' && (
                        <View className="flex-row mt-4 gap-3">
                          <Pressable
                            onPress={() =>
                              handleRespondToApplication(
                                selectedShare._id || selectedShare.id,
                                application._id,
                                'rejected'
                              )
                            }
                            disabled={respondMutation.isPending}
                            className="flex-1 bg-red-500/20 py-3 rounded-xl flex-row items-center justify-center"
                          >
                            <XCircle size={18} color="#EF4444" />
                            <Text className="text-red-500 font-medium ml-2">Reject</Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              handleRespondToApplication(
                                selectedShare._id || selectedShare.id,
                                application._id,
                                'accepted'
                              )
                            }
                            disabled={respondMutation.isPending}
                            className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
                          >
                            {respondMutation.isPending ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <CheckCircle size={18} color="#fff" />
                                <Text className="text-white font-medium ml-2">Accept</Text>
                              </>
                            )}
                          </Pressable>
                        </View>
                      )}

                      {/* Response Info (for already responded applications) */}
                      {application.initiatorResponse?.message && (
                        <View className="bg-dark-bg rounded-lg p-3 mt-3">
                          <Text className="text-dark-muted text-xs mb-1">Your Response:</Text>
                          <Text className="text-dark-text text-sm">
                            "{application.initiatorResponse.message}"
                          </Text>
                        </View>
                      )}
                    </Animated.View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
