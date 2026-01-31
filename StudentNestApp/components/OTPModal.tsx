import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { authApi } from '../lib/api';

interface OTPModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  type: 'email' | 'phone';
  value: string; // email or phone number
  purpose?: string;
}

export default function OTPModal({
  visible,
  onClose,
  onVerified,
  type,
  value,
  purpose = 'verification',
}: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;

  // Animation on mount
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      // Send OTP when modal opens
      sendOTP();
    } else {
      scaleAnimation.setValue(0.8);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccess(false);
    }
  }, [visible]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const sendOTP = async () => {
    if (isSending || resendTimer > 0) return;

    setIsSending(true);
    setError('');

    try {
      if (type === 'email') {
        await authApi.sendEmailOtp(value, purpose);
      } else {
        await authApi.sendPhoneOtp(value, purpose);
      }
      setResendTimer(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
      shakeError();
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    
    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.slice(0, 6).split('');
      pastedCode.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (text && index === 5) {
      const code = newOtp.join('');
      if (code.length === 6) {
        Keyboard.dismiss();
        verifyOTP(code);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      shakeError();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (type === 'email') {
        await authApi.verifyEmailOtp(value, otpCode);
      } else {
        await authApi.verifyPhoneOtp(value, otpCode);
      }
      setSuccess(true);
      
      // Animate success and close
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
      shakeError();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const maskedValue = type === 'email'
    ? value.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : value.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <Animated.View
            style={{
              transform: [
                { translateX: shakeAnimation },
                { scale: scaleAnimation },
              ],
            }}
            className="w-full bg-dark-surface rounded-3xl p-6"
          >
          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-dark-border rounded-full items-center justify-center z-10"
          >
            <X size={16} color="#A1A1AA" />
          </Pressable>

          {success ? (
            // Success State
            <View className="items-center py-8">
              <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4">
                <CheckCircle size={48} color="#22C55E" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Verified!</Text>
              <Text className="text-dark-text text-center">
                Your {type} has been verified successfully
              </Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View className="items-center mb-6">
                <Text className="text-white text-xl font-bold mb-2">Verify {type === 'email' ? 'Email' : 'Phone'}</Text>
                <Text className="text-dark-text text-center">
                  Enter the 6-digit code sent to{'\n'}
                  <Text className="text-white font-semibold">{maskedValue}</Text>
                </Text>
              </View>

              {/* OTP Inputs */}
              <View className="flex-row justify-center space-x-2 mb-6">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    className={`w-12 h-14 bg-dark-bg border-2 rounded-xl text-white text-center text-xl font-bold mx-1 ${
                      digit ? 'border-primary-500' : 'border-dark-border'
                    }`}
                    editable={!isLoading}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Error Message */}
              {error && (
                <View className="flex-row items-center justify-center mb-4">
                  <AlertCircle size={16} color="#EF4444" />
                  <Text className="text-red-500 ml-2">{error}</Text>
                </View>
              )}

              {/* Verify Button */}
              <Pressable
                onPress={() => verifyOTP()}
                disabled={isLoading || otp.join('').length !== 6}
                className={`py-4 rounded-2xl mb-4 ${
                  isLoading || otp.join('').length !== 6
                    ? 'bg-dark-border'
                    : 'bg-primary-500'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Verify Code
                  </Text>
                )}
              </Pressable>

              {/* Resend */}
              <View className="flex-row items-center justify-center">
                <Text className="text-dark-text">Didn't receive code? </Text>
                {resendTimer > 0 ? (
                  <Text className="text-dark-muted">
                    Resend in {resendTimer}s
                  </Text>
                ) : (
                  <Pressable
                    onPress={sendOTP}
                    disabled={isSending}
                    className="flex-row items-center"
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#F97316" />
                    ) : (
                      <>
                        <RefreshCw size={14} color="#F97316" />
                        <Text className="text-primary-500 font-semibold ml-1">
                          Resend
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </>
          )}
        </Animated.View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
