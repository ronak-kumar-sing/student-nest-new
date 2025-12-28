import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { negotiationsApi } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, DollarSign, TrendingDown, MessageSquare } from 'lucide-react-native';

interface NegotiationModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle: string;
  originalPrice: number;
  onSuccess?: () => void;
}

export default function NegotiationModal({
  visible,
  onClose,
  roomId,
  roomTitle,
  originalPrice,
  onSuccess,
}: NegotiationModalProps) {
  const queryClient = useQueryClient();
  const [proposedPrice, setProposedPrice] = useState('');
  const [message, setMessage] = useState('');

  const discount = proposedPrice 
    ? Math.round(((originalPrice - parseInt(proposedPrice)) / originalPrice) * 100)
    : 0;

  const createNegotiationMutation = useMutation({
    mutationFn: async () => {
      const price = parseInt(proposedPrice);
      if (!price || price <= 0) {
        throw new Error('Please enter a valid price');
      }
      if (price >= originalPrice) {
        throw new Error('Proposed price should be less than original price');
      }
      
      return negotiationsApi.create({
        roomId,
        proposedPrice: price,
        message: message.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
      Alert.alert(
        'Negotiation Sent! 🎉',
        'Your price proposal has been sent to the owner. They will respond soon.',
        [{ text: 'OK', onPress: handleClose }]
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || error.response?.data?.error || 'Failed to submit negotiation');
    },
  });

  const handleClose = () => {
    setProposedPrice('');
    setMessage('');
    onClose();
  };

  const handleSubmit = () => {
    if (!proposedPrice || parseInt(proposedPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    createNegotiationMutation.mutate();
  };

  const suggestedPrices = [
    { label: '5% off', value: Math.round(originalPrice * 0.95) },
    { label: '10% off', value: Math.round(originalPrice * 0.9) },
    { label: '15% off', value: Math.round(originalPrice * 0.85) },
    { label: '20% off', value: Math.round(originalPrice * 0.8) },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-dark-surface rounded-t-3xl">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-6">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-500/20 rounded-full items-center justify-center mr-3">
                      <DollarSign size={20} color="#F97316" />
                    </View>
                    <Text className="text-white text-xl font-bold">Negotiate Price</Text>
                  </View>
                  <Pressable onPress={handleClose} className="p-2">
                    <X size={24} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Room Info */}
                <View className="bg-dark-card rounded-xl p-4 mb-6">
                  <Text className="text-white font-medium mb-1" numberOfLines={1}>
                    {roomTitle}
                  </Text>
                  <Text className="text-dark-muted text-sm">
                    Listed Price: <Text className="text-white font-bold">₹{originalPrice}/month</Text>
                  </Text>
                </View>

                {/* Quick Suggestions */}
                <Text className="text-white font-semibold mb-3">Quick Suggestions</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {suggestedPrices.map((suggestion) => (
                    <Pressable
                      key={suggestion.label}
                      onPress={() => setProposedPrice(suggestion.value.toString())}
                      className={`px-4 py-2 rounded-xl border ${
                        proposedPrice === suggestion.value.toString()
                          ? 'bg-primary-500 border-primary-500'
                          : 'bg-dark-card border-dark-border'
                      }`}
                    >
                      <Text className="text-white font-medium">
                        ₹{suggestion.value}
                      </Text>
                      <Text className={`text-xs ${
                        proposedPrice === suggestion.value.toString()
                          ? 'text-white/80'
                          : 'text-dark-muted'
                      }`}>
                        {suggestion.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Custom Price Input */}
                <Text className="text-white font-semibold mb-2">Your Offer</Text>
                <View className="flex-row items-center bg-dark-card rounded-xl px-4 mb-3">
                  <Text className="text-primary-500 text-xl font-bold">₹</Text>
                  <TextInput
                    className="flex-1 text-white text-xl py-4 ml-2"
                    placeholder="Enter your price"
                    placeholderTextColor="#6B7280"
                    keyboardType="number-pad"
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                  />
                  <Text className="text-dark-muted">/month</Text>
                </View>

                {/* Discount Display */}
                {proposedPrice && parseInt(proposedPrice) < originalPrice && (
                  <View className="flex-row items-center bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-6">
                    <TrendingDown size={18} color="#22C55E" />
                    <Text className="text-green-500 font-medium ml-2">
                      {discount}% discount request
                    </Text>
                    <Text className="text-green-400 text-sm ml-auto">
                      Save ₹{originalPrice - parseInt(proposedPrice)}/mo
                    </Text>
                  </View>
                )}

                {/* Message Input */}
                <Text className="text-white font-semibold mb-2">Add a Message (Optional)</Text>
                <View className="bg-dark-card rounded-xl px-4 py-3 mb-6">
                  <TextInput
                    className="text-white min-h-[80px]"
                    placeholder="Tell the owner why you're interested..."
                    placeholderTextColor="#6B7280"
                    multiline
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                    maxLength={500}
                  />
                  <Text className="text-dark-muted text-xs text-right mt-2">
                    {message.length}/500
                  </Text>
                </View>

                {/* Tips */}
                <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <View className="flex-row items-center mb-2">
                    <MessageSquare size={16} color="#3B82F6" />
                    <Text className="text-blue-400 font-semibold ml-2">Negotiation Tips</Text>
                  </View>
                  <Text className="text-blue-300 text-sm leading-5">
                    • Be polite and professional{'\n'}
                    • Explain why you're interested{'\n'}
                    • Mention if you're a long-term tenant{'\n'}
                    • Keep discount requests reasonable (5-15%)
                  </Text>
                </View>

                {/* Submit Button */}
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 bg-dark-card py-4 rounded-xl border border-dark-border"
                    onPress={handleClose}
                  >
                    <Text className="text-white text-center font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-primary-500 py-4 rounded-xl flex-row items-center justify-center"
                    onPress={handleSubmit}
                    disabled={createNegotiationMutation.isPending || !proposedPrice}
                  >
                    {createNegotiationMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">Send Proposal</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
