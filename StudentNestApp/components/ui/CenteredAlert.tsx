import { Modal, View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react-native';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CenteredAlertProps {
  visible: boolean;
  onClose: () => void;
  type?: AlertType;
  title?: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

const ALERT_CONFIG = {
  success: {
    icon: CheckCircle,
    iconColor: '#22C55E',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    buttonBg: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    iconColor: '#EF4444',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    buttonBg: 'bg-red-500',
  },
  warning: {
    icon: AlertCircle,
    iconColor: '#F59E0B',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    buttonBg: 'bg-yellow-500',
  },
  info: {
    icon: Info,
    iconColor: '#3B82F6',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    buttonBg: 'bg-blue-500',
  },
};

export function CenteredAlert({
  visible,
  onClose,
  type = 'info',
  title,
  message,
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
}: CenteredAlertProps) {
  const config = ALERT_CONFIG[type];
  const IconComponent = config.icon;

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    }
    onClose();
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 bg-black/60 items-center justify-center px-6"
      >
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className={`w-full max-w-sm bg-dark-surface rounded-3xl overflow-hidden border ${config.border}`}
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 items-center justify-center rounded-full bg-dark-border/50"
          >
            <X size={16} color="#71717A" />
          </Pressable>

          {/* Content */}
          <View className="px-6 py-8 items-center">
            {/* Icon */}
            <View className={`w-16 h-16 rounded-full ${config.bg} items-center justify-center mb-4`}>
              <IconComponent size={32} color={config.iconColor} />
            </View>

            {/* Title */}
            {title && (
              <Text className="text-white text-xl font-bold text-center mb-2">
                {title}
              </Text>
            )}

            {/* Message */}
            <Text className="text-dark-text text-base text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View className="px-6 pb-6 flex-row gap-3">
            {secondaryButtonText && (
              <Pressable
                onPress={handleSecondaryPress}
                className="flex-1 bg-dark-border py-3.5 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">{secondaryButtonText}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handlePrimaryPress}
              className={`flex-1 ${config.buttonBg} py-3.5 rounded-xl items-center`}
            >
              <Text className="text-white font-semibold">{primaryButtonText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Hook for easy usage with API responses
import { useState, useCallback } from 'react';

interface AlertState {
  visible: boolean;
  type: AlertType;
  title?: string;
  message: string;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'info',
    message: '',
  });

  const showAlert = useCallback((
    message: string,
    type: AlertType = 'info',
    title?: string
  ) => {
    setAlertState({
      visible: true,
      type,
      title,
      message,
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title || 'Success');
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title || 'Error');
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title || 'Warning');
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title || 'Info');
  }, [showAlert]);

  // Helper to show API error with actual message from response
  const showApiError = useCallback((error: any, fallbackMessage = 'Something went wrong') => {
    const message = error?.response?.data?.error
      || error?.response?.data?.message
      || error?.message
      || fallbackMessage;
    showError(message);
  }, [showError]);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiError,
    hideAlert,
    AlertComponent: (
      <CenteredAlert
        visible={alertState.visible}
        onClose={hideAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />
    ),
  };
}

export default CenteredAlert;
