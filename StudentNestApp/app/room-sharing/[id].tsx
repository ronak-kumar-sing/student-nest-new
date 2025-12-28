import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomSharingApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import {
  Users,
  MapPin,
  ChevronLeft,
  Share2,
  IndianRupee,
  Calendar,
  Phone,
  MessageCircle,
  X,
  CheckCircle,
  Clock,
  Home,
  User,
  Mail,
  Wifi,
  Car,
  Snowflake,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react-native';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Open for Applications' },
  full: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Currently Full' },
  closed: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Closed' },
};

export default function RoomSharingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['roomSharing', id],
    queryFn: () => roomSharingApi.getById(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => roomSharingApi.apply(id!, { message: applicationMessage }),
    onSuccess: () => {
      Alert.alert('Success', 'Your application has been sent! The room host will review and respond.');
      setShowApplyModal(false);
      setApplicationMessage('');
      queryClient.invalidateQueries({ queryKey: ['roomSharing'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to submit application';
      // Check if it's a verification error and provide more helpful message
      if (errorMessage.includes('verified')) {
        Alert.alert(
          'Verification Required',
          'You need to verify both your email and phone number to apply for room sharing. Go to Profile > Verification to complete this.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    },
  });

  const share = data?.data;

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to apply for room sharing',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    setShowApplyModal(true);
  };

  const handleCall = () => {
    if (share?.initiator?.phone) {
      Linking.openURL(`tel:${share.initiator.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to make call');
      });
    }
  };

  const handleWhatsApp = async () => {
    if (share?.initiator?.phone) {
      const phone = share.initiator.phone.replace(/[^0-9]/g, '');
      const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
      const message = encodeURIComponent(
        `Hi! I'm interested in your room sharing listing for "${share.property?.title}" on StudentNest.`
      );
      
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
      
      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'WhatsApp Not Available',
            'Would you like to call instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => handleCall() },
            ]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to open WhatsApp');
      }
    }
  };

  const handleEmail = () => {
    if (share?.initiator?.email) {
      const subject = encodeURIComponent(`Room Sharing Inquiry: ${share.property?.title}`);
      const body = encodeURIComponent(
        `Hi ${share.initiator.fullName || share.initiator.name},\n\nI'm interested in your room sharing listing for "${share.property?.title}".\n\nPlease let me know if the spot is still available.\n\nThanks!`
      );
      Linking.openURL(`mailto:${share.initiator.email}?subject=${subject}&body=${body}`).catch(() => {
        Alert.alert('Error', 'Unable to open email client');
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    );
  }

  if (error || !share) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <AlertCircle size={48} color="#71717A" />
        <Text className="text-white text-lg font-bold mt-4">Not Found</Text>
        <Text className="text-dark-text text-center mt-2">
          This room sharing listing may have been removed
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const status = STATUS_COLORS[share.status] || STATUS_COLORS.active;
  const availableSlots = share.maxParticipants - (share.currentParticipants?.length || 1);
  const isOwner = user?._id === share.initiator?._id || user?._id === share.initiator?.id;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-dark-bg">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Property Image */}
          <View className="relative">
            <Image
              source={{ uri: share.property?.images?.[0] || 'https://via.placeholder.com/400x250' }}
              style={{ width: '100%', height: 250 }}
              contentFit="cover"
            />
            
            {/* Header Overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
              <View className="flex-row items-center justify-between px-4 pt-2">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 bg-dark-bg/60 rounded-full items-center justify-center"
                >
                  <ChevronLeft size={24} color="#fff" />
                </Pressable>
                <View className={`px-4 py-2 rounded-full ${status.bg}`}>
                  <Text className={`font-semibold ${status.text}`}>{status.label}</Text>
                </View>
              </View>
            </SafeAreaView>

            {/* Slots Badge */}
            <View className="absolute bottom-4 right-4 bg-dark-bg/80 px-4 py-2 rounded-xl flex-row items-center">
              <Users size={18} color="#F97316" />
              <Text className="text-white font-bold ml-2">{availableSlots} slots available</Text>
            </View>
          </View>

          <View className="px-6 py-6">
            {/* Title & Price */}
            <Animated.View entering={FadeInDown.duration(500)}>
              <Text className="text-white text-2xl font-bold mb-2">
                {share.property?.title || 'Room Sharing Opportunity'}
              </Text>
              <View className="flex-row items-center mb-4">
                <MapPin size={16} color="#71717A" />
                <Text className="text-dark-text ml-2">
                  {share.property?.location?.address || share.property?.location?.city}
                </Text>
              </View>

              <View className="flex-row items-center justify-between bg-dark-surface rounded-2xl p-4 mb-6">
                <View>
                  <Text className="text-dark-muted text-sm">Rent per Person</Text>
                  <View className="flex-row items-center mt-1">
                    <IndianRupee size={20} color="#F97316" />
                    <Text className="text-primary-500 text-2xl font-bold">
                      {share.costSharing?.rentPerPerson?.toLocaleString() || '0'}
                    </Text>
                    <Text className="text-dark-muted text-sm ml-1">/month</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-dark-muted text-sm">Security Deposit</Text>
                  <Text className="text-white font-bold mt-1">
                    ₹{share.costSharing?.securityDepositPerPerson?.toLocaleString() || '0'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Initiator */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Posted By</Text>
              <View className="bg-dark-surface rounded-2xl p-4">
                <View className="flex-row items-center mb-4">
                  {share.initiator?.profilePhoto ? (
                    <Image
                      source={{ uri: share.initiator.profilePhoto }}
                      style={{ width: 56, height: 56 }}
                      className="rounded-full"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-14 h-14 bg-primary-500/20 rounded-full items-center justify-center">
                      <Text className="text-primary-500 text-xl font-bold">
                        {share.initiator?.fullName?.charAt(0) || share.initiator?.name?.charAt(0) || 'S'}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-lg">
                        {share.initiator?.fullName || share.initiator?.name}
                      </Text>
                      {share.initiator?.isVerified && (
                        <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full flex-row items-center">
                          <CheckCircle size={12} color="#22C55E" />
                          <Text className="text-green-500 text-xs ml-1">Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-dark-muted text-sm">Initiator</Text>
                  </View>
                </View>

                {!isOwner && (
                  <View className="flex-row">
                    <Pressable
                      onPress={() => setShowContactModal(true)}
                      className="flex-1 bg-dark-bg py-3 rounded-xl flex-row items-center justify-center mr-2"
                    >
                      <Phone size={18} color="#F97316" />
                      <Text className="text-primary-500 font-bold ml-2">Contact</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleWhatsApp}
                      className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
                    >
                      <MessageCircle size={18} color="#fff" />
                      <Text className="text-white font-bold ml-2">WhatsApp</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Description */}
            {share.description && (
              <Animated.View entering={FadeInDown.delay(150).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Description</Text>
                <Text className="text-dark-text leading-6">{share.description}</Text>
              </Animated.View>
            )}

            {/* Availability */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Availability</Text>
              <View className="bg-dark-surface rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <Calendar size={18} color="#F97316" />
                  <Text className="text-white ml-3">
                    Available from {formatDate(share.availableFrom)}
                  </Text>
                </View>
                {share.availableTill && (
                  <View className="flex-row items-center">
                    <Clock size={18} color="#71717A" />
                    <Text className="text-dark-text ml-3">
                      Until {formatDate(share.availableTill)}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Requirements */}
            {share.requirements && (
              <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Requirements</Text>
                <View className="flex-row flex-wrap">
                  {share.requirements.gender && share.requirements.gender !== 'any' && (
                    <View className="bg-dark-surface px-4 py-2 rounded-xl mr-2 mb-2">
                      <Text className="text-white capitalize">{share.requirements.gender} only</Text>
                    </View>
                  )}
                  {share.requirements.lifestyle?.map((item, idx) => (
                    <Animated.View
                      key={idx}
                      entering={ZoomIn.delay(250 + idx * 50).duration(300)}
                      className="bg-dark-surface px-4 py-2 rounded-xl mr-2 mb-2"
                    >
                      <Text className="text-white capitalize">{item}</Text>
                    </Animated.View>
                  ))}
                  {share.requirements.preferences?.map((item, idx) => (
                    <Animated.View
                      key={`pref-${idx}`}
                      entering={ZoomIn.delay(300 + idx * 50).duration(300)}
                      className="bg-primary-500/20 px-4 py-2 rounded-xl mr-2 mb-2"
                    >
                      <Text className="text-primary-500 capitalize">{item}</Text>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* House Rules */}
            {share.houseRules && share.houseRules.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">House Rules</Text>
                {share.houseRules.map((rule, idx) => (
                  <View key={idx} className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    <Text className="text-dark-text">{rule}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Current Participants */}
            {share.currentParticipants && share.currentParticipants.length > 0 && (
              <Animated.View entering={FadeInDown.delay(350).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">
                  Current Roommates ({share.currentParticipants.length}/{share.maxParticipants})
                </Text>
                <View className="flex-row flex-wrap">
                  {share.currentParticipants.map((participant: any, idx: number) => (
                    <View key={idx} className="items-center mr-4 mb-3">
                      {participant.user?.profilePhoto ? (
                        <Image
                          source={{ uri: participant.user.profilePhoto }}
                          style={{ width: 48, height: 48 }}
                          className="rounded-full"
                          contentFit="cover"
                        />
                      ) : (
                        <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
                          <Text className="text-primary-500 font-bold">
                            {participant.user?.fullName?.charAt(0) || 'R'}
                          </Text>
                        </View>
                      )}
                      <Text className="text-dark-text text-xs mt-1 text-center" numberOfLines={1}>
                        {participant.user?.fullName?.split(' ')[0] || 'Roommate'}
                      </Text>
                    </View>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: availableSlots }).map((_, idx) => (
                    <View key={`empty-${idx}`} className="items-center mr-4 mb-3">
                      <View className="w-12 h-12 bg-dark-border border-2 border-dashed border-dark-muted rounded-full items-center justify-center">
                        <User size={20} color="#71717A" />
                      </View>
                      <Text className="text-dark-muted text-xs mt-1">Open</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        {!isOwner && availableSlots > 0 && (
          <SafeAreaView className="bg-dark-surface border-t border-dark-border" edges={['bottom']}>
            <View className="flex-row items-center justify-between px-6 py-4">
              <View>
                <Text className="text-dark-muted text-sm">Per Month</Text>
                <View className="flex-row items-center">
                  <IndianRupee size={18} color="#fff" />
                  <Text className="text-white text-xl font-bold">
                    {share.costSharing?.rentPerPerson?.toLocaleString()}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleApply}
                className="bg-primary-500 px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold text-lg">Apply Now</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        )}

        {/* Contact Modal */}
        <Modal
          visible={showContactModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowContactModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/60"
            onPress={() => setShowContactModal(false)}
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
                        <Text className="text-white text-xl font-bold">Contact</Text>
                        <Pressable
                          onPress={() => setShowContactModal(false)}
                          className="w-10 h-10 bg-dark-bg rounded-full items-center justify-center"
                        >
                          <X size={20} color="#71717A" />
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={handleCall}
                        className="bg-primary-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
                      >
                        <Phone size={20} color="#fff" />
                        <Text className="text-white font-bold text-lg ml-3">Call</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleWhatsApp}
                        className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
                      >
                        <MessageCircle size={20} color="#fff" />
                        <Text className="text-white font-bold text-lg ml-3">WhatsApp</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleEmail}
                        className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center"
                      >
                        <Mail size={20} color="#fff" />
                        <Text className="text-white font-bold text-lg ml-3">Email</Text>
                      </Pressable>
                    </View>
                  </SafeAreaView>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

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

                      <Text className="text-dark-text mb-4">
                        Introduce yourself to {share?.initiator?.fullName || 'the initiator'}:
                      </Text>

                      <TextInput
                        value={applicationMessage}
                        onChangeText={setApplicationMessage}
                        placeholder="Hi! I'm interested in sharing this room. A bit about me..."
                        placeholderTextColor="#71717A"
                        multiline
                        numberOfLines={4}
                        className="bg-dark-bg text-white p-4 rounded-xl mb-6"
                        style={{ minHeight: 120, textAlignVertical: 'top' }}
                      />

                      <Pressable
                        onPress={() => applyMutation.mutate()}
                        disabled={applyMutation.isPending || !applicationMessage.trim()}
                        className={`py-4 rounded-xl items-center ${
                          applyMutation.isPending || !applicationMessage.trim()
                            ? 'bg-primary-700'
                            : 'bg-primary-500'
                        }`}
                      >
                        {applyMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-white font-bold text-lg">Send Application</Text>
                        )}
                      </Pressable>
                    </View>
                  </SafeAreaView>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    </>
  );
}
