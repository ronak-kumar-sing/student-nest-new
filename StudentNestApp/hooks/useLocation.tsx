import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  error: string | null;
  loading: boolean;
  permissionStatus: Location.PermissionStatus | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
    loading: true,
    permissionStatus: null,
  });

  const requestPermission = async () => {
    try {
      setLocation(prev => ({ ...prev, loading: true, error: null }));

      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      setLocation(prev => ({ ...prev, permissionStatus: status }));

      if (status !== 'granted') {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied',
        }));
        return false;
      }

      // Get current location
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city
      let cityName = null;
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        cityName = address?.city || address?.subregion || null;
      } catch (geocodeError) {
        console.log('Geocoding error:', geocodeError);
      }

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: cityName,
        error: null,
        loading: false,
        permissionStatus: status,
      });

      return true;
    } catch (error: any) {
      console.error('Location error:', error);
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to get location',
      }));
      return false;
    }
  };

  const openSettings = () => {
    Alert.alert(
      'Location Permission Required',
      'To show rooms near you, please enable location permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const refresh = async () => {
    return requestPermission();
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    ...location,
    requestPermission,
    openSettings,
    refresh,
  };
}
