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
import { authApi } from '../../lib/api';
import OTPModal from '../../components/OTPModal';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Home, User, CheckCircle, Shield } from 'lucide-react-native';

type UserRole = 'student' | 'owner';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');
  const [sendingOtp, setSendingOtp] = useState<'email' | 'phone' | null>(null);

  // Validation helpers
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const sendOtp = async (type: 'email' | 'phone') => {
    const value = type === 'email' ? email : `+91${phone}`;

    if (type === 'email' && !isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (type === 'phone' && !isValidPhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(type);
    try {
      if (type === 'email') {
        await authApi.sendEmailOtp(value, 'verification');
      } else {
        await authApi.sendPhoneOtp(value, 'verification');
      }
      setOtpType(type);
      setShowOtpModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || `Failed to send OTP to ${type}`);
    } finally {
      setSendingOtp(null);
    }
  };

  const handleOtpVerified = () => {
    if (otpType === 'email') {
      setEmailVerified(true);
    } else {
      setPhoneVerified(true);
    }
    setShowOtpModal(false);
  };

  const handleSignup = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!phone.trim() || !isValidPhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!emailVerified) {
      Alert.alert('Verification Required', 'Please verify your email address');
      return;
    }
    if (!phoneVerified) {
      Alert.alert('Verification Required', 'Please verify your phone number');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: `+91${phone}`,
        password,
        role,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A0B', '#1A1A1B', '#0A0A0B']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16">
            {/* Header */}
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-dark-surface rounded-full items-center justify-center mb-6"
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            {/* Logo */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-4">
                <Home size={32} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-white">Create Account</Text>
              <Text className="text-dark-text mt-2">Join StudentNest today</Text>
            </View>

            {/* Role Toggle */}
            <View className="flex-row bg-dark-surface rounded-xl p-1 mb-6">
              <Pressable
                onPress={() => setRole('student')}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${role === 'student' ? 'bg-secondary-700' : ''}`}
              >
                <User size={18} color={role === 'student' ? '#fff' : '#71717A'} />
                <Text className={`ml-2 font-semibold ${role === 'student' ? 'text-white' : 'text-dark-text'}`}>
                  Student
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole('owner')}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${role === 'owner' ? 'bg-primary-500' : ''}`}
              >
                <Home size={18} color={role === 'owner' ? '#fff' : '#71717A'} />
                <Text className={`ml-2 font-semibold ${role === 'owner' ? 'text-white' : 'text-dark-text'}`}>
                  Owner
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Name */}
              <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                <User size={20} color="#71717A" />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#71717A"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>

              {/* Email with Verify Button */}
              <View>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1 bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                    <Mail size={20} color="#71717A" />
                    <TextInput
                      placeholder="Email address"
                      placeholderTextColor="#71717A"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!emailVerified}
                      className={`flex-1 ml-3 text-base ${emailVerified ? 'text-dark-muted' : 'text-white'}`}
                    />
                    {emailVerified && <CheckCircle size={20} color="#22C55E" />}
                  </View>
                  {!emailVerified && (
                    <Pressable
                      onPress={() => sendOtp('email')}
                      disabled={sendingOtp === 'email' || !email.trim()}
                      className={`px-4 py-3.5 rounded-xl ${sendingOtp === 'email' || !email.trim()
                          ? 'bg-dark-surface'
                          : 'bg-primary-500'
                        }`}
                    >
                      {sendingOtp === 'email' ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold">Verify</Text>
                      )}
                    </Pressable>
                  )}
                </View>
                {emailVerified && (
                  <View className="flex-row items-center mt-1 ml-1">
                    <Shield size={12} color="#22C55E" />
                    <Text className="text-green-500 text-xs ml-1">Email verified successfully</Text>
                  </View>
                )}
              </View>

              {/* Phone with Verify Button */}
              <View>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1 bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                    <Phone size={20} color="#71717A" />
                    <Text className="text-dark-text ml-3">+91</Text>
                    <TextInput
                      placeholder="Phone number"
                      placeholderTextColor="#71717A"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!phoneVerified}
                      className={`flex-1 ml-2 text-base ${phoneVerified ? 'text-dark-muted' : 'text-white'}`}
                    />
                    {phoneVerified && <CheckCircle size={20} color="#22C55E" />}
                  </View>
                  {!phoneVerified && (
                    <Pressable
                      onPress={() => sendOtp('phone')}
                      disabled={sendingOtp === 'phone' || phone.length !== 10}
                      className={`px-4 py-3.5 rounded-xl ${sendingOtp === 'phone' || phone.length !== 10
                          ? 'bg-dark-surface'
                          : 'bg-primary-500'
                        }`}
                    >
                      {sendingOtp === 'phone' ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold">Verify</Text>
                      )}
                    </Pressable>
                  )}
                </View>
                {phoneVerified && (
                  <View className="flex-row items-center mt-1 ml-1">
                    <Shield size={12} color="#22C55E" />
                    <Text className="text-green-500 text-xs ml-1">Phone verified successfully</Text>
                  </View>
                )}
              </View>

              {/* Password */}
              <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                <Lock size={20} color="#71717A" />
                <TextInput
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor="#71717A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
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

              {/* Confirm Password */}
              <View className="bg-dark-surface rounded-xl px-4 py-3.5 flex-row items-center">
                <Lock size={20} color="#71717A" />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#71717A"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>

              {/* Verification Status */}
              {(!emailVerified || !phoneVerified) && (
                <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex-row items-center">
                  <Shield size={18} color="#EAB308" />
                  <Text className="text-yellow-500 text-sm ml-2 flex-1">
                    Please verify your email and phone number to continue
                  </Text>
                </View>
              )}

              {/* Signup Button */}
              <Pressable
                onPress={handleSignup}
                disabled={isLoading || !emailVerified || !phoneVerified}
                className={`mt-4 py-4 rounded-2xl ${isLoading || !emailVerified || !phoneVerified
                    ? 'bg-dark-surface border border-dark-border'
                    : 'bg-primary-500'
                  }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className={`text-center font-bold text-lg ${!emailVerified || !phoneVerified ? 'text-dark-muted' : 'text-white'
                    }`}>
                    Create Account
                  </Text>
                )}
              </Pressable>

              {/* Terms */}
              <Text className="text-dark-muted text-center text-sm mt-2 px-4">
                By signing up, you agree to our{' '}
                <Text className="text-primary-500">Terms of Service</Text> and{' '}
                <Text className="text-primary-500">Privacy Policy</Text>
              </Text>

              {/* Sign In Link */}
              <View className="flex-row justify-center mt-4 pb-8">
                <Text className="text-dark-text">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text className="text-primary-500 font-semibold">Sign In</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        type={otpType}
        value={otpType === 'email' ? email : `+91${phone}`}
        purpose="verification"
      />
    </LinearGradient>
  );
}
