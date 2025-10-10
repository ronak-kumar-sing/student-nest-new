import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/components/providers/auth-provider';

import { useEffect } from 'react';
import { useNavigationStore, useAuthStore } from '@store';

export const unstable_settings = {
  initialRouteName: '(landing)',
  // Define all the route groups that will be loaded
  routes: {
    '(landing)': {
      screens: {
        index: 'Landing',
      },
    },
    '(auth)': {
      screens: {
        'student/login': 'Student Login',
        'student/signup': 'Student Registration',
        'owner/login': 'Owner Login',
        'owner/signup': 'Owner Registration',
      },
    },
    '(tabs)': {
      screens: {
        'index': 'Home',
        'explore': 'Explore',
        'room-sharing': 'Room Sharing',
      },
    },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(landing)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
