import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  CreditCard,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  ChevronRight,
  Wallet,
  TrendingUp,
} from 'lucide-react-native';

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-500',
    icon: Clock,
    label: 'Pending',
  },
  processing: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-500',
    icon: Clock,
    label: 'Processing',
  },
  completed: {
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    icon: CheckCircle,
    label: 'Completed',
  },
  failed: {
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    icon: XCircle,
    label: 'Failed',
  },
  refunded: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-500',
    icon: ArrowDownLeft,
    label: 'Refunded',
  },
};

const TYPE_CONFIG: Record<string, { icon: any; label: string }> = {
  booking: { icon: Building2, label: 'Booking' },
  rent: { icon: CreditCard, label: 'Rent' },
  deposit: { icon: Wallet, label: 'Deposit' },
  maintenance: { icon: AlertCircle, label: 'Maintenance' },
  late_fee: { icon: AlertCircle, label: 'Late Fee' },
  refund: { icon: ArrowDownLeft, label: 'Refund' },
};

interface Payment {
  _id: string;
  amount: number;
  type: string;
  status: keyof typeof STATUS_CONFIG;
  paymentMethod: string;
  dueDate?: string;
  paidDate?: string;
  description?: string;
  createdAt: string;
  property?: {
    _id: string;
    title: string;
    location?: {
      city?: string;
    };
  };
}

export default function PaymentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll(),
    enabled: isAuthenticated,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['paymentsSummary'],
    queryFn: () => paymentsApi.getSummary(),
    enabled: isAuthenticated,
  });

  // Handle nested API response
  const payments: Payment[] = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.payments || []);

  const summary = summaryData?.data || {
    totalPaid: 0,
    totalPending: 0,
    nextDue: null,
  };

  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'processing'].includes(p.status);
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const PaymentCard = ({ item, index }: { item: Payment; index: number }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.rent;
    const TypeIcon = typeConfig.icon;

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
        <Pressable className="bg-dark-surface rounded-2xl overflow-hidden mb-3 p-4">
          <View className="flex-row items-center">
            {/* Type Icon */}
            <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
              <TypeIcon size={22} color="#F97316" />
            </View>

            {/* Details */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-bold text-base">
                  {typeConfig.label}
                </Text>
                <Text className={`font-bold text-lg ${
                  item.type === 'refund' ? 'text-green-500' : 'text-white'
                }`}>
                  {item.type === 'refund' ? '+' : ''}{formatAmount(item.amount)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-dark-muted text-sm" numberOfLines={1}>
                  {item.property?.title || item.description || 'Payment'}
                </Text>
                <View className={`${statusConfig.bg} px-2 py-0.5 rounded-full flex-row items-center`}>
                  <StatusIcon size={10} color={
                    statusConfig.text.includes('yellow') ? '#EAB308' :
                    statusConfig.text.includes('green') ? '#22C55E' :
                    statusConfig.text.includes('red') ? '#EF4444' :
                    statusConfig.text.includes('blue') ? '#3B82F6' :
                    '#A855F7'
                  } />
                  <Text className={`text-xs font-medium ml-1 ${statusConfig.text}`}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-dark-border">
            <View className="flex-row items-center">
              <Calendar size={12} color="#71717A" />
              <Text className="text-dark-muted text-xs ml-1.5">
                {item.paidDate ? `Paid ${formatDate(item.paidDate)}` : item.dueDate ? `Due ${formatDate(item.dueDate)}` : formatDate(item.createdAt)}
              </Text>
            </View>
            <Text className="text-dark-muted text-xs capitalize">
              {item.paymentMethod?.replace('_', ' ')}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <CreditCard size={64} color="#71717A" />
        <Text className="text-white text-xl font-bold mt-4">Sign In Required</Text>
        <Text className="text-dark-text text-center mt-2">
          Please sign in to view your payment history
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
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-dark-surface items-center justify-center mr-3"
        >
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Payment History</Text>
      </View>

      {/* Summary Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3">
          {/* Total Paid */}
          <View className="flex-1 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mb-2">
              <TrendingUp size={20} color="#22C55E" />
            </View>
            <Text className="text-green-500 text-xl font-bold">
              {formatAmount(summary.totalPaid)}
            </Text>
            <Text className="text-dark-muted text-sm">Total Paid</Text>
          </View>

          {/* Pending */}
          <View className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <View className="w-10 h-10 bg-yellow-500/20 rounded-full items-center justify-center mb-2">
              <Clock size={20} color="#EAB308" />
            </View>
            <Text className="text-yellow-500 text-xl font-bold">
              {formatAmount(summary.totalPending)}
            </Text>
            <Text className="text-dark-muted text-sm">Pending</Text>
          </View>
        </View>

        {/* Next Due */}
        {summary.nextDue && (
          <View className="mt-3 bg-dark-surface rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 bg-primary-500/20 rounded-full items-center justify-center">
              <AlertCircle size={22} color="#F97316" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-dark-muted text-sm">Next Payment Due</Text>
              <Text className="text-white font-bold text-lg">
                {formatAmount(summary.nextDue.amount)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-dark-muted text-xs">Due Date</Text>
              <Text className="text-primary-500 font-medium">
                {formatDate(summary.nextDue.dueDate)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-2 gap-2">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === tab.key ? 'bg-primary-500' : 'bg-dark-surface'
            }`}
          >
            <Text className={`font-medium ${activeTab === tab.key ? 'text-white' : 'text-dark-text'}`}>
              {tab.label}
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
          data={filteredPayments}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <PaymentCard item={item} index={index} />}
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
              <CreditCard size={64} color="#71717A" />
              <Text className="text-white text-xl font-bold mt-4">No Payments</Text>
              <Text className="text-dark-muted text-center mt-2 px-6">
                {activeTab === 'pending'
                  ? 'No pending payments'
                  : activeTab === 'completed'
                  ? 'No completed payments'
                  : 'Your payment history will appear here'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
