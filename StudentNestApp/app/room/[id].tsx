import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Modal,
  Animated as RNAnimated,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, savedRoomsApi, bookingsApi, negotiationsApi, visitRequestsApi, reviewsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Wifi,
  Car,
  Snowflake,
  Bath,
  Zap,
  Shield,
  Users,
  Home,
  Calendar,
  ChevronLeft,
  Check,
  X,
  Mail,
  Clock,
  IndianRupee,
  Building,
  Ruler,
  Layers,
  DollarSign,
  Bookmark,
  UserPlus,
} from 'lucide-react-native';
import { AMENITIES } from '../../constants/config';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  ac: Snowflake,
  parking: Car,
  attached_bathroom: Bath,
  power_backup: Zap,
  security: Shield,
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch reviews for this room
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getByRoom(id!),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: () => isSaved ? savedRoomsApi.remove(id!) : savedRoomsApi.add(id!),
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ['savedRooms'] });
    },
  });

  const bookMutation = useMutation({
    mutationFn: () => bookingsApi.create({
      roomId: id!,
      startDate: new Date().toISOString(),
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Booking request sent successfully!');
      setShowBookingModal(false);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to book room');
    },
  });

  const negotiateMutation = useMutation({
    mutationFn: () => negotiationsApi.create({
      roomId: id!,
      proposedPrice: parseInt(proposedPrice),
      message: negotiateMessage,
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Negotiation request sent to owner!');
      setShowNegotiateModal(false);
      setProposedPrice('');
      setNegotiateMessage('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send negotiation');
    },
  });

  const visitMutation = useMutation({
    mutationFn: () => visitRequestsApi.create({
      roomId: id!,
      preferredDate: visitDate,
      preferredTime: visitTime,
      message: visitMessage,
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Visit request sent! The owner will confirm shortly.');
      setShowScheduleModal(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to schedule visit');
    },
  });

  const room = data?.data;
  const reviews = Array.isArray(reviewsData?.data) 
    ? reviewsData.data 
    : (reviewsData?.data as any)?.reviews || [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this room on StudentNest: ${room?.title} - ₹${room?.price}/mo`,
        title: room?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to book this room',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Request to book "${room?.title}" for ₹${room?.price}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => bookMutation.mutate() },
      ]
    );
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the owner',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    setShowContactModal(true);
  };

  const handleCall = () => {
    if (room?.owner?.phone) {
      Linking.openURL(`tel:${room.owner.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to make call');
      });
      setShowContactModal(false);
    }
  };

  const handleWhatsApp = async () => {
    if (room?.owner?.phone) {
      const phone = room.owner.phone.replace(/[^0-9]/g, '');
      // Ensure phone has country code (India)
      const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
      const message = encodeURIComponent(
        `Hi! I'm interested in your room "${room.title}" listed on StudentNest for ₹${room.price}/month. Is it still available?`
      );
      
      // Try WhatsApp API URL first (works on both iOS and Android)
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
      
      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          // Fallback to direct call if WhatsApp not installed
          Alert.alert(
            'WhatsApp Not Available',
            'Would you like to call the owner instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => handleCall() },
            ]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to open WhatsApp. Try calling instead.');
      }
      setShowContactModal(false);
    }
  };

  const handleEmail = () => {
    if (room?.owner?.email) {
      const subject = encodeURIComponent(`Inquiry about ${room.title} on StudentNest`);
      const body = encodeURIComponent(
        `Hi ${room.owner.name},\n\nI'm interested in your room "${room.title}" listed for ₹${room.price}/month.\n\nPlease let me know if it's still available.\n\nThanks!`
      );
      Linking.openURL(`mailto:${room.owner.email}?subject=${subject}&body=${body}`).catch(() => {
        Alert.alert('Error', 'Unable to open email client');
      });
      setShowContactModal(false);
    }
  };

  const handleNegotiate = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to negotiate price',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    setProposedPrice(Math.round((room?.price || 0) * 0.9).toString()); // Suggest 10% less
    setShowNegotiateModal(true);
  };

  const handleScheduleVisit = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to schedule a visit',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setVisitDate(tomorrow.toISOString().split('T')[0]);
    setVisitTime('10:00');
    setShowScheduleModal(true);
  };

  const handleSaveForLater = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save this room',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    saveMutation.mutate();
  };

  const handlePostForSharing = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to post for room sharing',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    router.push({
      pathname: '/room-sharing/create',
      params: { roomId: id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Home size={48} color="#71717A" />
        <Text className="text-white text-lg font-bold mt-4">Room Not Found</Text>
        <Text className="text-dark-text text-center mt-2">
          This room may have been removed or is no longer available
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-dark-bg">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View className="relative">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
            >
              {(room.images?.length ? room.images : ['https://via.placeholder.com/400x300']).map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width, height: 300 }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            {/* Header Overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
              <View className="flex-row items-center justify-between px-4 pt-2">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 bg-dark-bg/60 rounded-full items-center justify-center"
                >
                  <ChevronLeft size={24} color="#fff" />
                </Pressable>
                <View className="flex-row">
                  <Pressable
                    onPress={() => saveMutation.mutate()}
                    className="w-10 h-10 bg-dark-bg/60 rounded-full items-center justify-center mr-2"
                  >
                    <Heart size={20} color={isSaved ? '#EF4444' : '#fff'} fill={isSaved ? '#EF4444' : 'transparent'} />
                  </Pressable>
                  <Pressable
                    onPress={handleShare}
                    className="w-10 h-10 bg-dark-bg/60 rounded-full items-center justify-center"
                  >
                    <Share2 size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>

            {/* Image Indicators */}
            {room.images && room.images.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                {room.images.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full mx-1 ${index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* Title and Price */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-white text-2xl font-bold">{room.title}</Text>
                <View className="flex-row items-center mt-2">
                  <MapPin size={16} color="#71717A" />
                  <Text className="text-dark-text ml-1">{room.location?.address || room.location?.city}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-primary-500 text-2xl font-bold">₹{room.price}</Text>
                <Text className="text-dark-muted text-sm">/month</Text>
              </View>
            </View>

            {/* Rating and Type */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="flex-row items-center flex-wrap mb-6">
              <View className="flex-row items-center bg-dark-surface px-3 py-2 rounded-xl mr-3 mb-2">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-white font-semibold ml-1">{room.rating?.toFixed(1) || '4.5'}</Text>
                <Text className="text-dark-muted ml-1">({room.reviewCount || 0})</Text>
              </View>
              <View className="flex-row items-center bg-dark-surface px-3 py-2 rounded-xl mr-3 mb-2">
                <Users size={16} color="#F97316" />
                <Text className="text-white font-medium ml-2 capitalize">{room.type || room.roomType}</Text>
              </View>
              {room.availability === 'available' && (
                <View className="flex-row items-center bg-green-500/20 px-3 py-2 rounded-xl mb-2">
                  <Check size={16} color="#22C55E" />
                  <Text className="text-green-500 font-medium ml-1">Available</Text>
                </View>
              )}
            </Animated.View>

            {/* Description */}
            <Animated.View entering={FadeInDown.delay(150).duration(500)} className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Description</Text>
              <Text className="text-dark-text leading-6">{room.description || 'No description available.'}</Text>
            </Animated.View>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Amenities</Text>
                <View className="flex-row flex-wrap">
                  {room.amenities.map((amenity, index) => {
                    const Icon = AMENITY_ICONS[amenity] || Check;
                    const label = AMENITIES.find((a) => a.id === amenity)?.label || amenity;
                    return (
                      <Animated.View
                        key={index}
                        entering={ZoomIn.delay(200 + index * 50).duration(300)}
                        className="flex-row items-center bg-dark-surface px-4 py-2 rounded-xl mr-2 mb-2"
                      >
                        <Icon size={16} color="#F97316" />
                        <Text className="text-white ml-2 capitalize">{label}</Text>
                      </Animated.View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Rules */}
            {room.rules && room.rules.length > 0 && (
              <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">House Rules</Text>
                {room.rules.map((rule, index) => (
                  <Animated.View 
                    key={index} 
                    entering={SlideInRight.delay(250 + index * 50).duration(300)}
                    className="flex-row items-center mb-2"
                  >
                    <View className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    <Text className="text-dark-text">{rule}</Text>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Owner */}
            {room.owner && (
              <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Property Owner</Text>
                <View className="bg-dark-surface rounded-2xl p-4">
                  <View className="flex-row items-center mb-4">
                    {room.owner.avatar ? (
                      <Image
                        source={{ uri: room.owner.avatar }}
                        style={{ width: 56, height: 56 }}
                        className="rounded-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-14 h-14 bg-primary-500/20 rounded-full items-center justify-center">
                        <Text className="text-primary-500 text-xl font-bold">
                          {room.owner.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center">
                        <Text className="text-white font-bold text-lg">{room.owner.name}</Text>
                        {room.owner.isVerified && (
                          <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full flex-row items-center">
                            <Check size={12} color="#22C55E" />
                            <Text className="text-green-500 text-xs ml-1">Verified</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-dark-text text-sm">Property Owner</Text>
                    </View>
                  </View>
                  <View className="flex-row">
                    <Pressable
                      onPress={handleContact}
                      className="flex-1 bg-primary-500 py-3 rounded-xl flex-row items-center justify-center mr-2"
                    >
                      <Phone size={18} color="#fff" />
                      <Text className="text-white font-bold ml-2">Contact</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleWhatsApp}
                      className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
                    >
                      <MessageCircle size={18} color="#fff" />
                      <Text className="text-white font-bold ml-2">WhatsApp</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Booking Options Card */}
            <Animated.View entering={FadeInDown.delay(350).duration(500)} className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Book This Room</Text>
              <View className="bg-dark-surface rounded-2xl p-4">
                {/* Price Summary */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-dark-text">Monthly Rent</Text>
                    <Text className="text-white font-bold">₹{room.price?.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-dark-text">Security Deposit</Text>
                    <Text className="text-white font-bold">₹{((room as any).deposit || (room.price || 0) * 2)?.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-primary-500">Maintenance</Text>
                    <Text className="text-primary-500 font-medium">
                      {(room as any).maintenanceIncluded ? 'Included' : `₹${(room as any).maintenance || 0}`}
                    </Text>
                  </View>
                  <View className="h-px bg-dark-border my-3" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-bold">Total Initial Cost</Text>
                    <Text className="text-primary-500 font-bold text-lg">
                      ₹{((room.price || 0) + ((room as any).deposit || (room.price || 0) * 2))?.toLocaleString()}
                    </Text>
                  </View>
                  <Text className="text-dark-muted text-xs text-center mt-2">No booking fees • Cancel anytime</Text>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <Pressable
                    onPress={handleBook}
                    disabled={bookMutation.isPending}
                    className="bg-dark-card py-4 rounded-xl flex-row items-center justify-center mb-3"
                  >
                    {bookMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Calendar size={18} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Book Now - Pay Later</Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleNegotiate}
                    className="bg-green-600 py-4 rounded-xl flex-row items-center justify-center mb-3"
                  >
                    <DollarSign size={18} color="#fff" />
                    <Text className="text-white font-semibold ml-2">Negotiate Price</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleScheduleVisit}
                    className="bg-dark-card py-4 rounded-xl flex-row items-center justify-center border border-dark-border mb-3"
                  >
                    <Calendar size={18} color="#9CA3AF" />
                    <Text className="text-dark-text font-semibold ml-2">Schedule Visit</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSaveForLater}
                    disabled={saveMutation.isPending}
                    className="bg-dark-card py-4 rounded-xl flex-row items-center justify-center border border-dark-border mb-3"
                  >
                    <Bookmark size={18} color={isSaved ? "#F97316" : "#9CA3AF"} fill={isSaved ? "#F97316" : "transparent"} />
                    <Text className={`font-semibold ml-2 ${isSaved ? 'text-primary-500' : 'text-dark-text'}`}>
                      {isSaved ? 'Saved' : 'Save for Later'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleShare}
                    className="bg-dark-card py-4 rounded-xl flex-row items-center justify-center border border-dark-border mb-3"
                  >
                    <Share2 size={18} color="#9CA3AF" />
                    <Text className="text-dark-text font-semibold ml-2">Share Room</Text>
                  </Pressable>

                  <Pressable
                    onPress={handlePostForSharing}
                    className="bg-dark-card py-4 rounded-xl flex-row items-center justify-center border border-dark-border"
                  >
                    <UserPlus size={18} color="#F97316" />
                    <Text className="text-primary-500 font-semibold ml-2">Post for Room Sharing</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            {/* Reviews Section */}
            <Animated.View entering={FadeInDown.delay(380).duration(500)} className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white text-lg font-bold">Reviews</Text>
                {reviews.length > 0 && (
                  <Pressable onPress={() => setShowReviewsModal(true)}>
                    <Text className="text-primary-500 font-medium">See All ({reviews.length})</Text>
                  </Pressable>
                )}
              </View>
              
              {reviews.length === 0 ? (
                <View className="bg-dark-surface rounded-2xl p-6 items-center">
                  <Star size={32} color="#71717A" />
                  <Text className="text-dark-text text-center mt-2">No reviews yet</Text>
                  <Text className="text-dark-muted text-center text-sm mt-1">
                    Be the first to review after your stay!
                  </Text>
                </View>
              ) : (
                <View className="bg-dark-surface rounded-2xl p-4">
                  {/* Summary */}
                  <View className="flex-row items-center mb-4">
                    <View className="flex-row items-center">
                      <Star size={24} color="#F59E0B" fill="#F59E0B" />
                      <Text className="text-white text-2xl font-bold ml-2">
                        {room.rating?.toFixed(1) || '4.5'}
                      </Text>
                    </View>
                    <Text className="text-dark-text ml-2">
                      based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  {/* Latest Reviews (show first 2) */}
                  {reviews.slice(0, 2).map((review: any, idx: number) => (
                    <View key={review._id || idx} className={`${idx > 0 ? 'border-t border-dark-border pt-4 mt-4' : ''}`}>
                      <View className="flex-row items-center mb-2">
                        <View className="w-10 h-10 bg-primary-500/20 rounded-full items-center justify-center">
                          <Text className="text-primary-500 font-bold">
                            {review.user?.fullName?.charAt(0) || 'U'}
                          </Text>
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-white font-medium">
                            {review.user?.fullName || 'Anonymous'}
                          </Text>
                          <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                color="#F59E0B"
                                fill={star <= review.rating ? "#F59E0B" : "transparent"}
                              />
                            ))}
                            <Text className="text-dark-muted text-xs ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {review.comment && (
                        <Text className="text-dark-text" numberOfLines={3}>
                          {review.comment}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Room Features */}
            {((room.location?.nearbyUniversities?.length ?? 0) > 0 || (room.location?.nearbyFacilities?.length ?? 0) > 0) && (
              <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Nearby Places</Text>
                <View className="bg-dark-surface rounded-2xl p-4">
                  {room.location.nearbyUniversities?.map((uni, idx) => (
                    <View key={`uni-${idx}`} className="flex-row items-center mb-2">
                      <Building size={16} color="#F97316" />
                      <Text className="text-white ml-3">{uni}</Text>
                    </View>
                  ))}
                  {room.location.nearbyFacilities?.map((facility, idx) => (
                    <View key={`fac-${idx}`} className="flex-row items-center mb-2">
                      <MapPin size={16} color="#71717A" />
                      <Text className="text-dark-text ml-3">{facility}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Location Map */}
            {room.location?.coordinates && room.location.coordinates.length === 2 && (
              <Animated.View entering={FadeInDown.delay(450).duration(500)} className="mb-6">
                <Text className="text-white text-lg font-bold mb-3">Location</Text>
                <View className="bg-dark-surface rounded-2xl overflow-hidden">
                  <MapView
                    style={{ width: '100%', height: 200 }}
                    initialRegion={{
                      latitude: room.location.coordinates[1],
                      longitude: room.location.coordinates[0],
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: room.location.coordinates[1],
                        longitude: room.location.coordinates[0],
                      }}
                      title={room.title}
                      description={room.location?.address || room.location?.city}
                    />
                  </MapView>
                  <Pressable
                    onPress={() => {
                      const lat = room.location.coordinates[1];
                      const lng = room.location.coordinates[0];
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      Linking.openURL(url);
                    }}
                    className="p-4 flex-row items-center justify-center bg-dark-card"
                  >
                    <MapPin size={18} color="#F97316" />
                    <Text className="text-primary-500 font-medium ml-2">Get Directions</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <SafeAreaView className="bg-dark-surface border-t border-dark-border" edges={['bottom']}>
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-dark-muted text-sm">Monthly Rent</Text>
              <View className="flex-row items-center">
                <IndianRupee size={18} color="#fff" />
                <Text className="text-white text-xl font-bold">{room.price?.toLocaleString()}</Text>
              </View>
            </View>
            <View className="flex-row">
              <Pressable
                onPress={handleContact}
                className="w-12 h-12 bg-dark-border rounded-xl items-center justify-center mr-3"
              >
                <MessageCircle size={22} color="#F97316" />
              </Pressable>
              <Pressable
                onPress={handleBook}
                disabled={bookMutation.isPending}
                className={`px-6 py-3 rounded-xl ${bookMutation.isPending ? 'bg-primary-700' : 'bg-primary-500'}`}
              >
                {bookMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Book Now</Text>
                )}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

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
                        <Text className="text-white text-xl font-bold">Contact Owner</Text>
                        <Pressable
                          onPress={() => setShowContactModal(false)}
                          className="w-10 h-10 bg-dark-bg rounded-full items-center justify-center"
                        >
                          <X size={20} color="#71717A" />
                        </Pressable>
                      </View>

                      {/* Owner Info */}
                      <View className="flex-row items-center mb-6">
                        <View className="w-14 h-14 bg-primary-500/20 rounded-full items-center justify-center">
                          <Text className="text-primary-500 text-xl font-bold">
                            {room?.owner?.name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="ml-4">
                          <Text className="text-white font-bold text-lg">{room?.owner?.name}</Text>
                          <Text className="text-dark-text">{room?.owner?.phone}</Text>
                        </View>
                      </View>

                      {/* Contact Options */}
                      <View className="space-y-3">
                        <Pressable
                          onPress={handleCall}
                          className="bg-primary-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
                        >
                          <Phone size={20} color="#fff" />
                          <Text className="text-white font-bold text-lg ml-3">Call Now</Text>
                        </Pressable>

                        <Pressable
                          onPress={handleWhatsApp}
                          className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
                        >
                          <MessageCircle size={20} color="#fff" />
                          <Text className="text-white font-bold text-lg ml-3">WhatsApp</Text>
                        </Pressable>

                        {room?.owner?.email && (
                          <Pressable
                            onPress={handleEmail}
                            className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center"
                          >
                            <Mail size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-3">Send Email</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </SafeAreaView>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Negotiate Price Modal */}
        <Modal
          visible={showNegotiateModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNegotiateModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/60"
            onPress={() => setShowNegotiateModal(false)}
          >
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-dark-surface rounded-t-3xl">
                  <SafeAreaView edges={['bottom']}>
                    <View className="p-6">
                      <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-white text-xl font-bold">Negotiate Price</Text>
                        <Pressable
                          onPress={() => setShowNegotiateModal(false)}
                          className="w-10 h-10 bg-dark-bg rounded-full items-center justify-center"
                        >
                          <X size={20} color="#71717A" />
                        </Pressable>
                      </View>

                      <View className="bg-dark-card rounded-xl p-4 mb-4">
                        <Text className="text-dark-text text-sm mb-1">Current Price</Text>
                        <Text className="text-white text-xl font-bold">₹{room?.price?.toLocaleString()}/month</Text>
                      </View>

                      <View className="mb-4">
                        <Text className="text-white font-medium mb-2">Your Proposed Price</Text>
                        <View className="bg-dark-card rounded-xl flex-row items-center px-4">
                          <IndianRupee size={20} color="#71717A" />
                          <TextInput
                            value={proposedPrice}
                            onChangeText={setProposedPrice}
                            placeholder="Enter your offer"
                            placeholderTextColor="#6B7280"
                            keyboardType="numeric"
                            className="flex-1 text-white py-4 ml-2 text-lg"
                          />
                        </View>
                      </View>

                      <View className="mb-6">
                        <Text className="text-white font-medium mb-2">Message (Optional)</Text>
                        <TextInput
                          value={negotiateMessage}
                          onChangeText={setNegotiateMessage}
                          placeholder="Add a message for the owner..."
                          placeholderTextColor="#6B7280"
                          multiline
                          numberOfLines={3}
                          className="bg-dark-card text-white p-4 rounded-xl"
                          style={{ textAlignVertical: 'top' }}
                        />
                      </View>

                      <Pressable
                        onPress={() => negotiateMutation.mutate()}
                        disabled={negotiateMutation.isPending || !proposedPrice}
                        className={`py-4 rounded-xl flex-row items-center justify-center ${
                          proposedPrice ? 'bg-green-600' : 'bg-dark-border'
                        }`}
                      >
                        {negotiateMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <DollarSign size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-2">Send Offer</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </SafeAreaView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Schedule Visit Modal */}
        <Modal
          visible={showScheduleModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/60"
            onPress={() => setShowScheduleModal(false)}
          >
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View className="bg-dark-surface rounded-t-3xl">
                  <SafeAreaView edges={['bottom']}>
                    <View className="p-6">
                      <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-white text-xl font-bold">Schedule Visit</Text>
                        <Pressable
                          onPress={() => setShowScheduleModal(false)}
                          className="w-10 h-10 bg-dark-bg rounded-full items-center justify-center"
                        >
                          <X size={20} color="#71717A" />
                        </Pressable>
                      </View>

                      <View className="mb-4">
                        <Text className="text-white font-medium mb-2">Preferred Date</Text>
                        <View className="bg-dark-card rounded-xl flex-row items-center px-4">
                          <Calendar size={20} color="#71717A" />
                          <TextInput
                            value={visitDate}
                            onChangeText={setVisitDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#6B7280"
                            className="flex-1 text-white py-4 ml-2"
                          />
                        </View>
                      </View>

                      <View className="mb-4">
                        <Text className="text-white font-medium mb-2">Preferred Time</Text>
                        <View className="flex-row flex-wrap">
                          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                            <Pressable
                              key={time}
                              onPress={() => setVisitTime(time)}
                              className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                                visitTime === time ? 'bg-primary-500' : 'bg-dark-card'
                              }`}
                            >
                              <Text className={visitTime === time ? 'text-white font-medium' : 'text-dark-text'}>
                                {time}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View className="mb-6">
                        <Text className="text-white font-medium mb-2">Message (Optional)</Text>
                        <TextInput
                          value={visitMessage}
                          onChangeText={setVisitMessage}
                          placeholder="Any specific requests..."
                          placeholderTextColor="#6B7280"
                          multiline
                          numberOfLines={2}
                          className="bg-dark-card text-white p-4 rounded-xl"
                          style={{ textAlignVertical: 'top' }}
                        />
                      </View>

                      <Pressable
                        onPress={() => visitMutation.mutate()}
                        disabled={visitMutation.isPending || !visitDate || !visitTime}
                        className={`py-4 rounded-xl flex-row items-center justify-center ${
                          visitDate && visitTime ? 'bg-primary-500' : 'bg-dark-border'
                        }`}
                      >
                        {visitMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Calendar size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-2">Request Visit</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </SafeAreaView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Reviews Modal */}
        <Modal
          visible={showReviewsModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowReviewsModal(false)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-dark-surface rounded-t-3xl max-h-[80%]">
              <View className="flex-row items-center justify-between p-4 border-b border-dark-border">
                <Text className="text-white text-lg font-bold">All Reviews ({reviews.length})</Text>
                <Pressable
                  onPress={() => setShowReviewsModal(false)}
                  className="w-8 h-8 bg-dark-card rounded-full items-center justify-center"
                >
                  <X size={18} color="#9CA3AF" />
                </Pressable>
              </View>

              <ScrollView className="max-h-[500px]" contentContainerClassName="p-4">
                {reviews.map((review: any, idx: number) => (
                  <View key={review._id || idx} className={`bg-dark-card rounded-xl p-4 ${idx > 0 ? 'mt-3' : ''}`}>
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
                        <Text className="text-primary-500 font-bold text-lg">
                          {review.user?.fullName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-bold">
                          {review.user?.fullName || 'Anonymous'}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              color="#F59E0B"
                              fill={star <= review.rating ? "#F59E0B" : "transparent"}
                            />
                          ))}
                          <Text className="text-dark-muted text-xs ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {review.comment && (
                      <Text className="text-dark-text leading-5">{review.comment}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
