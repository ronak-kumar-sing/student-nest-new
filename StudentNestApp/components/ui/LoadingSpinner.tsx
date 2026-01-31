import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Home } from 'lucide-react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#F97316',
  text,
  fullScreen = false,
}) => {
  const containerStyle = fullScreen
    ? 'flex-1 items-center justify-center bg-dark-bg'
    : 'items-center justify-center py-8';

  return (
    <View className={containerStyle}>
      {fullScreen && (
        <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-6">
          <Home size={32} color="#fff" />
        </View>
      )}
      
      <ActivityIndicator size={size} color={color} />
      
      {text && (
        <Text className="text-dark-text mt-4 text-center">
          {text}
        </Text>
      )}
    </View>
  );
};

export default React.memo(LoadingSpinner);