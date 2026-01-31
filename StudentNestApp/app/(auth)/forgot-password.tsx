import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../../lib/api';
import { Mail, ArrowLeft, Home, CheckCircle } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <LinearGradient colors={['#0A0A0B', '#1A1A1B', '#0A0A0B']} className="flex-1">
        <View className="flex-1 px-6 pt-16 items-center justify-center">
          <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Check Your Email</Text>
          <Text className="text-dark-text text-center mb-8">
            We've sent a password reset link to{'\n'}
            <Text className="text-white font-medium">{email}</Text>
          </Text>
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="bg-primary-500 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">Back to Login</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A0B', '#1A1A1B', '#0A0A0B']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-16">
            {/* Header */}
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-dark-surface rounded-full items-center justify-center mb-8"
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            {/* Logo */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-4">
                <Home size={32} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-white">Forgot Password?</Text>
              <Text className="text-dark-text mt-2 text-center px-8">
                Enter your email and we'll send you a link to reset your password
              </Text>
            </View>

            {/* Form */}
            <View className="bg-dark-surface rounded-xl px-4 py-3 flex-row items-center">
              <Mail size={20} color="#71717A" />
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#71717A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="flex-1 ml-3 text-white text-base"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className={`mt-8 py-4 rounded-2xl ${isLoading ? 'bg-primary-700' : 'bg-primary-500'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Send Reset Link
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
