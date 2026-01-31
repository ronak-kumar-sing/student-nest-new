import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Network connection lost. Please check your internet and try again.',
}) => {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-dark-bg">
      <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6">
        <WifiOff size={48} color="#EF4444" />
      </View>
      
      <Text className="text-white text-xl font-bold text-center mb-2">
        No Internet Connection
      </Text>
      
      <Text className="text-dark-text text-center mb-8 leading-6">
        {message}
      </Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-primary-500 px-6 py-3 rounded-xl flex-row items-center"
        >
          <RefreshCw size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
};

export default React.memo(NetworkError);