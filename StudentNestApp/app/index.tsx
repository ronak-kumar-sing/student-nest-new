import { useEffect } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { Home, User } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0A0A0B', '#1A1A1B', '#0A0A0B']}
      className="flex-1"
    >
      <View className="flex-1 px-6 pt-20">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-primary-500 rounded-3xl items-center justify-center mb-6 shadow-lg">
            <Home size={48} color="#fff" />
          </View>
          <Text className="text-4xl font-bold text-white mb-2">StudentNest</Text>
          <Text className="text-dark-text text-center text-lg">
            Find your perfect home away from home
          </Text>
        </View>

        {/* Features */}
        <View className="space-y-4 mb-12">
          {[
            { icon: '🏠', title: 'Find Rooms', desc: 'Browse verified rooms near your college' },
            { icon: '🗺️', title: 'Map View', desc: 'View rooms on an interactive map' },
            { icon: '💬', title: 'Direct Contact', desc: 'Connect directly with property owners' },
            { icon: '✅', title: 'Verified Listings', desc: 'All properties are verified' },
          ].map((feature, index) => (
            <View key={index} className="flex-row items-center bg-dark-surface p-4 rounded-2xl">
              <Text className="text-3xl mr-4">{feature.icon}</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{feature.title}</Text>
                <Text className="text-dark-text text-sm">{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View className="space-y-4 mt-auto pb-12">
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-500 py-4 rounded-2xl active:bg-primary-600"
          >
            <Text className="text-white text-center font-bold text-lg">
              Sign In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            className="bg-dark-surface border border-dark-border py-4 rounded-2xl active:bg-dark-border"
          >
            <Text className="text-white text-center font-bold text-lg">
              Create Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="py-3"
          >
            <Text className="text-dark-text text-center text-base">
              Browse as Guest →
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
