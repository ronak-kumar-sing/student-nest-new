import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { View, Text } from 'react-native';
import { ImageOff } from 'lucide-react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  fallback?: React.ReactNode;
  showPlaceholder?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallback,
  showPlaceholder = true,
  style,
  ...props
}) => {
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  if (isError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showPlaceholder) {
      return (
        <View 
          style={[
            { backgroundColor: '#1F1F23', alignItems: 'center', justifyContent: 'center' },
            style
          ]}
        >
          <ImageOff size={24} color="#6B7280" />
          <Text className="text-dark-muted text-xs mt-1">Image not found</Text>
        </View>
      );
    }
  }

  return (
    <Image
      source={source}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      placeholder={isLoading ? { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' } : undefined}
      transition={200}
      {...props}
    />
  );
};

export default React.memo(OptimizedImage);