import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi, paymentsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  Shield,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  ExternalLink,
  IndianRupee,
} from 'lucide-react-native';
import { API_URL } from '../../constants/config';
import { tokenStorage } from '../../lib/storage';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const bookingId = params.bookingId as string;
  const amount = params.amount as string;
  const roomTitle = params.roomTitle as string;

  // Fetch booking details
  const { data: bookingData, isLoading, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getById(bookingId!),
    enabled: !!bookingId && isAuthenticated,
  });

  const booking = bookingData?.data;

  const totalAmount = amount ? parseFloat(amount) : (booking?.totalAmount || 0);

  const createRazorpayOrder = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        throw new Error('Please login to continue');
      }

      // Create order on backend
      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          bookingId: bookingId,
          description: `Booking Payment for ${roomTitle || 'Room'}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      return result.data;
    } catch (error: any) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const orderData = await createRazorpayOrder();

      // For React Native, we'll use a web view based approach or Razorpay's RN SDK
      // Here we're using a simpler approach - opening in browser
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?key=${orderData.keyId}&order_id=${orderData.orderId}&amount=${orderData.amount}`;

      // Show payment options modal
      Alert.alert(
        'Complete Payment',
        'You will be redirected to complete the payment securely.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsProcessing(false);
              setPaymentStatus('idle');
            },
          },
          {
            text: 'Pay ₹' + totalAmount.toLocaleString('en-IN'),
            onPress: async () => {
              try {
                // Simulate payment processing in dev mode
                if (__DEV__) {
                  // Simulate payment flow
                  await new Promise(resolve => setTimeout(resolve, 2000));

                  // Verify payment (simulated)
                  await handlePaymentSuccess({
                    orderId: orderData.orderId,
                    paymentId: 'pay_' + Date.now(),
                    signature: 'simulated_signature',
                  });
                } else {
                  // In production, open Razorpay checkout
                  const supported = await Linking.canOpenURL(checkoutUrl);
                  if (supported) {
                    await Linking.openURL(checkoutUrl);
                  } else {
                    throw new Error('Cannot open payment page');
                  }
                }
              } catch (err: any) {
                console.error('Payment error:', err);
                setPaymentStatus('failed');
                Alert.alert('Payment Failed', err.message || 'Something went wrong');
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      Alert.alert('Error', error.message || 'Failed to initiate payment');
    }
  };

  const handlePaymentSuccess = async (response: { orderId: string; paymentId: string; signature: string }) => {
    try {
      const token = await tokenStorage.getAccessToken();

      // Verify payment with backend
      const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: response.orderId,
          paymentId: response.paymentId,
          signature: response.signature,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.success) {
        setPaymentStatus('success');
        Alert.alert(
          'Payment Successful! 🎉',
          'Your booking has been confirmed.',
          [
            {
              text: 'View Booking',
              onPress: () => {
                refetch();
                router.back();
              },
            },
          ]
        );
      } else {
        throw new Error(verifyResult.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setPaymentStatus('failed');
      Alert.alert('Error', error.message || 'Payment verification failed');
    }
  };

  const handleOfflinePayment = async () => {
    setIsProcessing(true);

    try {
      // Update booking with offline payment selection
      Alert.alert(
        'Offline Payment Selected',
        'Please contact the owner to arrange payment. Your booking will be confirmed once the owner verifies the payment.\n\nNote: Online payments are faster and more secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              // In a real implementation, this would update the booking
              setPaymentStatus('success');
              Alert.alert(
                'Request Sent',
                'The owner has been notified. Please arrange payment directly.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <CreditCard size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Sign In Required</Text>
        <Text className="text-dark-text text-center mt-2">
          Please sign in to make payments
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-dark-text mt-4">Loading payment details...</Text>
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
        <Text className="text-white text-xl font-bold">Complete Payment</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        {/* Payment Amount Card */}
        <Animated.View entering={FadeInDown.delay(100)} className="bg-dark-surface rounded-2xl p-6 mb-6">
          <View className="items-center">
            <Text className="text-dark-muted text-sm mb-2">Total Amount</Text>
            <View className="flex-row items-center">
              <IndianRupee size={32} color="#F97316" />
              <Text className="text-white text-4xl font-bold ml-1">
                {totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text className="text-dark-text text-sm mt-2">
              {roomTitle || 'Room Booking Payment'}
            </Text>
          </View>

          {/* Payment Breakdown */}
          {booking && (
            <View className="mt-6 pt-6 border-t border-dark-border">
              <View className="flex-row justify-between mb-2">
                <Text className="text-dark-text">Monthly Rent</Text>
                <Text className="text-white font-medium">₹{booking.monthlyRent?.toLocaleString('en-IN')}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-dark-text">Security Deposit</Text>
                <Text className="text-white font-medium">₹{booking.securityDeposit?.toLocaleString('en-IN')}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-dark-border">
                <Text className="text-white font-bold">Total</Text>
                <Text className="text-primary-500 font-bold">₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Security Badge */}
        <Animated.View entering={FadeInDown.delay(200)} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex-row items-center mb-6">
          <Shield size={24} color="#22C55E" />
          <View className="flex-1 ml-3">
            <Text className="text-green-500 font-medium">Secure Payment</Text>
            <Text className="text-dark-muted text-xs">Your payment is secured by Razorpay</Text>
          </View>
        </Animated.View>

        {/* Payment Methods */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="text-white text-lg font-bold mb-4">Payment Method</Text>

          {/* Online Payment Option */}
          <Pressable
            onPress={() => setPaymentMethod('online')}
            className={`bg-dark-surface rounded-2xl p-4 mb-3 border-2 ${paymentMethod === 'online' ? 'border-primary-500' : 'border-transparent'
              }`}
          >
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${paymentMethod === 'online' ? 'bg-primary-500' : 'bg-dark-border'
                }`}>
                <CreditCard size={24} color={paymentMethod === 'online' ? '#fff' : '#71717A'} />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-bold">Pay Online</Text>
                <Text className="text-dark-muted text-sm">UPI, Cards, Net Banking</Text>
              </View>
              {paymentMethod === 'online' && (
                <CheckCircle size={24} color="#F97316" />
              )}
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3 ml-16">
              <View className="bg-dark-bg px-3 py-1 rounded-lg">
                <Text className="text-dark-text text-xs">UPI</Text>
              </View>
              <View className="bg-dark-bg px-3 py-1 rounded-lg">
                <Text className="text-dark-text text-xs">Cards</Text>
              </View>
              <View className="bg-dark-bg px-3 py-1 rounded-lg">
                <Text className="text-dark-text text-xs">Net Banking</Text>
              </View>
              <View className="bg-dark-bg px-3 py-1 rounded-lg">
                <Text className="text-dark-text text-xs">Wallets</Text>
              </View>
            </View>
          </Pressable>

          {/* Offline Payment Option */}
          <Pressable
            onPress={() => setPaymentMethod('offline')}
            className={`bg-dark-surface rounded-2xl p-4 border-2 ${paymentMethod === 'offline' ? 'border-primary-500' : 'border-transparent'
              }`}
          >
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${paymentMethod === 'offline' ? 'bg-primary-500' : 'bg-dark-border'
                }`}>
                <Wallet size={24} color={paymentMethod === 'offline' ? '#fff' : '#71717A'} />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-bold">Pay Offline</Text>
                <Text className="text-dark-muted text-sm">Cash, Bank Transfer</Text>
              </View>
              {paymentMethod === 'offline' && (
                <CheckCircle size={24} color="#F97316" />
              )}
            </View>
            <View className="bg-yellow-500/10 rounded-lg p-2 mt-3 ml-16 flex-row items-center">
              <AlertCircle size={14} color="#EAB308" />
              <Text className="text-yellow-500 text-xs ml-2">Requires owner confirmation</Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Pay Button */}
      <View className="px-6 pb-6 pt-4 border-t border-dark-border">
        <Pressable
          onPress={paymentMethod === 'online' ? handleOnlinePayment : handleOfflinePayment}
          disabled={isProcessing}
          className={`py-4 rounded-2xl flex-row items-center justify-center ${isProcessing ? 'bg-dark-surface' : 'bg-primary-500'
            }`}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
            </>
          ) : (
            <>
              {paymentMethod === 'online' ? (
                <CreditCard size={20} color="#fff" />
              ) : (
                <Wallet size={20} color="#fff" />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {paymentMethod === 'online'
                  ? `Pay ₹${totalAmount.toLocaleString('en-IN')}`
                  : 'Request Offline Payment'}
              </Text>
            </>
          )}
        </Pressable>

        {paymentMethod === 'online' && (
          <Text className="text-dark-muted text-center text-xs mt-3">
            You will be redirected to secure Razorpay checkout
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
