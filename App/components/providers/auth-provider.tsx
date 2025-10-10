import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments() as string[];
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inLandingGroup = segments[0] === '(landing)';

    if (!isAuthenticated && !inAuthGroup && !inLandingGroup) {
      // Redirect to the landing page if not authenticated
      router.replace('/(landing)');
    } else if (isAuthenticated && (inAuthGroup || inLandingGroup)) {
      // Redirect to the main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return <>{children}</>;
}