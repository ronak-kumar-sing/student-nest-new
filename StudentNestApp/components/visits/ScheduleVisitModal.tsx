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
import { visitRequestsApi } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Clock, MessageSquare, MapPin } from 'lucide-react-native';

interface ScheduleVisitModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle: string;
  roomAddress?: string;
  ownerId?: string; // Owner ID for the visit request
  onSuccess?: () => void;
}

export default function ScheduleVisitModal({
  visible,
  onClose,
  roomId,
  roomTitle,
  roomAddress,
  ownerId,
  onSuccess,
}: ScheduleVisitModalProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return days;
  };

  const days = getNextDays();

  const createVisitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate) {
        throw new Error('Please select a date');
      }
      if (!selectedTime) {
        throw new Error('Please select a time');
      }
      
      return visitRequestsApi.create({
        propertyId: roomId,
        recipientId: ownerId,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        message: message.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitRequests'] });
      Alert.alert(
        'Visit Scheduled! 📅',
        'Your visit request has been sent to the owner. They will confirm the appointment soon.',
        [{ text: 'OK', onPress: handleClose }]
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || error.response?.data?.error || 'Failed to schedule visit');
    },
  });

  const handleClose = () => {
    setSelectedDate('');
    setSelectedTime('');
    setMessage('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }
    createVisitMutation.mutate();
  };

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
          <View className="bg-dark-surface rounded-t-3xl max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-6">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-500/20 rounded-full items-center justify-center mr-3">
                      <Calendar size={20} color="#F97316" />
                    </View>
                    <Text className="text-white text-xl font-bold">Schedule Visit</Text>
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
                  {roomAddress && (
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#71717A" />
                      <Text className="text-dark-muted text-sm ml-1" numberOfLines={1}>
                        {roomAddress}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Date Selection */}
                <Text className="text-white font-semibold mb-3">Select Date</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="mb-6"
                >
                  <View className="flex-row gap-2">
                    {days.map((day) => (
                      <Pressable
                        key={day.date}
                        onPress={() => setSelectedDate(day.date)}
                        className={`w-16 py-3 rounded-xl items-center ${
                          selectedDate === day.date
                            ? 'bg-primary-500'
                            : 'bg-dark-card border border-dark-border'
                        }`}
                      >
                        <Text className={`text-xs ${
                          selectedDate === day.date ? 'text-white' : 'text-dark-muted'
                        }`}>
                          {day.dayName}
                        </Text>
                        <Text className={`text-xl font-bold ${
                          selectedDate === day.date ? 'text-white' : 'text-white'
                        }`}>
                          {day.dayNum}
                        </Text>
                        <Text className={`text-xs ${
                          selectedDate === day.date ? 'text-white/80' : 'text-dark-muted'
                        }`}>
                          {day.month}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Time Selection */}
                <Text className="text-white font-semibold mb-3">Select Time</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {timeSlots.map((time) => (
                    <Pressable
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      className={`px-4 py-3 rounded-xl ${
                        selectedTime === time
                          ? 'bg-primary-500'
                          : 'bg-dark-card border border-dark-border'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Clock size={14} color={selectedTime === time ? '#fff' : '#71717A'} />
                        <Text className={`ml-2 font-medium ${
                          selectedTime === time ? 'text-white' : 'text-dark-text'
                        }`}>
                          {time}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* Message Input */}
                <Text className="text-white font-semibold mb-2">Add a Note (Optional)</Text>
                <View className="bg-dark-card rounded-xl px-4 py-3 mb-6">
                  <TextInput
                    className="text-white min-h-[80px]"
                    placeholder="Any specific questions or requirements..."
                    placeholderTextColor="#6B7280"
                    multiline
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                    maxLength={300}
                  />
                  <Text className="text-dark-muted text-xs text-right mt-2">
                    {message.length}/300
                  </Text>
                </View>

                {/* Selected Summary */}
                {selectedDate && selectedTime && (
                  <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <Text className="text-green-500 font-semibold text-center">
                      📅 {new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })} at {selectedTime}
                    </Text>
                  </View>
                )}

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
                    disabled={createVisitMutation.isPending || !selectedDate || !selectedTime}
                  >
                    {createVisitMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">Schedule Visit</Text>
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
