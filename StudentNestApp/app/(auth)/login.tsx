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
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Home } from 'lucide-react-native';

type LoginMethod = 'email' | 'phone';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithPhone } = useAuth();

  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (method === 'email' && !email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (method === 'phone' && !phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      if (method === 'email') {
        await login(email, password);
      } else {
        await loginWithPhone(phone, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text className="text-3xl font-bold text-white">Welcome Back</Text>
              <Text className="text-dark-text mt-2">Sign in to continue</Text>
            </View>

            {/* Method Toggle */}
            <View className="flex-row bg-dark-surface rounded-xl p-1 mb-6">
              <Pressable
                onPress={() => setMethod('email')}
                className={`flex-1 py-3 rounded-lg ${method === 'email' ? 'bg-primary-500' : ''}`}
              >
                <Text className={`text-center font-semibold ${method === 'email' ? 'text-white' : 'text-dark-text'}`}>
                  Email
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMethod('phone')}
                className={`flex-1 py-3 rounded-lg ${method === 'phone' ? 'bg-primary-500' : ''}`}
              >
                <Text className={`text-center font-semibold ${method === 'phone' ? 'text-white' : 'text-dark-text'}`}>
                  Phone
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {method === 'email' ? (
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
              ) : (
                <View className="bg-dark-surface rounded-xl px-4 py-3 flex-row items-center">
                  <Phone size={20} color="#71717A" />
                  <Text className="text-dark-text ml-3">+91</Text>
                  <TextInput
                    placeholder="Phone number"
                    placeholderTextColor="#71717A"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    className="flex-1 ml-2 text-white text-base"
                  />
                </View>
              )}

              <View className="bg-dark-surface rounded-xl px-4 py-3 flex-row items-center">
                <Lock size={20} color="#71717A" />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#71717A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  className="flex-1 ml-3 text-white text-base"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#71717A" />
                  ) : (
                    <Eye size={20} color="#71717A" />
                  )}
                </Pressable>
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable className="self-end">
                  <Text className="text-primary-500 font-medium">Forgot Password?</Text>
                </Pressable>
              </Link>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`mt-8 py-4 rounded-2xl ${isLoading ? 'bg-primary-700' : 'bg-primary-500'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">Sign In</Text>
              )}
            </Pressable>

            {/* Demo Credentials */}
            <View className="mt-6 bg-dark-surface rounded-xl p-4">
              <Text className="text-dark-text text-center text-sm mb-2">Demo Credentials</Text>
              <View className="flex-row justify-between">
                <Pressable
                  onPress={() => {
                    setMethod('email');
                    setEmail('demo.student@studentnest.com');
                    setPassword('Demo@123');
                  }}
                  className="bg-secondary-700 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-sm">Student</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMethod('email');
                    setEmail('demo.owner@studentnest.com');
                    setPassword('Demo@123');
                  }}
                  className="bg-primary-700 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-sm">Owner</Text>
                </Pressable>
              </View>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8 pb-8">
              <Text className="text-dark-text">Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text className="text-primary-500 font-semibold">Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
