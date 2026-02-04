import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Room } from '../../types';
import { MapPin, Navigation, Star, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Default center - LPU, Phagwara, Punjab (main target location)
const DEFAULT_CENTER = {
  latitude: 31.2550,
  longitude: 75.7066,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

interface RoomsMapProps {
  rooms: Room[];
  onClose?: () => void;
  showCloseButton?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

// Helper function to extract coordinates from various formats
// API can return: { lat, lng }, { latitude, longitude }, [lng, lat] (GeoJSON format), or undefined
const getCoordinates = (coords: any): { lat: number; lng: number } | null => {
  if (!coords) return null;
  
  // Array format (GeoJSON: [longitude, latitude])
  if (Array.isArray(coords)) {
    if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return { lng: coords[0], lat: coords[1] };
    }
    return null;
  }
  
  // Object with lat/lng
  if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    return { lat: coords.lat, lng: coords.lng };
  }
  
  // Object with latitude/longitude
  if (typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  
  return null;
};

export default function RoomsMap({ rooms, onClose, showCloseButton = true, userLocation: propUserLocation }: RoomsMapProps) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [region, setRegion] = useState<Region>(DEFAULT_CENTER);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  // Center map on prop user location if provided
  useEffect(() => {
    if (propUserLocation && mapRef.current && mapReady) {
      setRegion({
        latitude: propUserLocation.lat,
        longitude: propUserLocation.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [propUserLocation, mapReady]);

  useEffect(() => {
    // Fit map to show all rooms when map is ready
    if (rooms.length > 0 && mapRef.current && mapReady) {
      const validRooms = rooms.filter(room => {
        const coords = getCoordinates(room.location?.coordinates);
        return coords?.lat && coords?.lng;
      });
      
      if (validRooms.length > 0) {
        const coordinates = validRooms.map(room => {
          const coords = getCoordinates(room.location?.coordinates)!;
          return {
            latitude: coords.lat,
            longitude: coords.lng,
          };
        });

        // Add user location to bounds if available
        if (userLocation) {
          coordinates.push({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });
        } else if (propUserLocation) {
          coordinates.push({
            latitude: propUserLocation.lat,
            longitude: propUserLocation.lng,
          });
        }

        // Only fit to coordinates if we have valid ones
        if (coordinates.length > 0) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
              animated: true,
            });
          }, 300);
        }
      } else {
        // No valid room coordinates, center on first room if it has location city
        // Or default to LPU area
        console.log('No valid room coordinates found, using default center');
      }
    }
  }, [rooms, userLocation, propUserLocation, mapReady]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      });
    }
  };

  const handleMarkerPress = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleRoomPress = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const getMarkerColor = (room: Room) => {
    // Check availability in different formats
    const isAvailable = room.availability === 'available' || 
                       room.availability?.isAvailable === true ||
                       room.status === 'active';
    const isOccupied = room.availability === 'occupied' || 
                       room.availability?.isAvailable === false ||
                       room.status === 'rented';
    
    if (isAvailable) return '#22C55E';
    if (isOccupied) return '#EF4444';
    return '#F97316';
  };

  const onMapReady = () => {
    setMapReady(true);
  };

  // Filter rooms with valid coordinates
  const validRooms = rooms.filter(room => {
    const coords = getCoordinates(room.location?.coordinates);
    return coords?.lat && coords?.lng;
  });

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onMapReady={onMapReady}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        rotateEnabled
        zoomEnabled
        pitchEnabled
        mapType="standard"
      >
        {validRooms.map((room) => {
          const coords = getCoordinates(room.location?.coordinates);
          
          if (!coords?.lat || !coords?.lng) return null;

          const roomId = room.id || room._id;
          if (!roomId) return null;

          return (
            <Marker
              key={roomId}
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              onPress={() => handleMarkerPress(room)}
            >
              <View style={styles.customMarker}>
                <View style={[styles.markerDot, { backgroundColor: getMarkerColor(room) }]}>
                  <Text style={styles.markerPrice}>₹{(room.price / 1000).toFixed(0)}k</Text>
                </View>
                <View style={[styles.markerArrow, { borderTopColor: getMarkerColor(room) }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Close Button */}
      {showCloseButton && onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#fff" />
        </Pressable>
      )}

      {/* Center on User Button */}
      {userLocation && (
        <Pressable style={styles.locationButton} onPress={centerOnUser}>
          <Navigation size={22} color="#F97316" />
        </Pressable>
      )}

      {/* Loading Indicator */}
      {isLoadingLocation && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F97316" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}

      {/* Selected Room Card */}
      {selectedRoom && (
        <View style={styles.roomCardContainer}>
          <Pressable
            style={styles.roomCard}
            onPress={() => handleRoomPress(selectedRoom.id || selectedRoom._id!)}
          >
            <Image
              source={{ uri: selectedRoom.images?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.roomImage}
              contentFit="cover"
            />
            <View style={styles.roomInfo}>
              <Text style={styles.roomTitle} numberOfLines={1}>
                {selectedRoom.title}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#71717A" />
                <Text style={styles.roomLocation} numberOfLines={1}>
                  {selectedRoom.location?.city || 'Unknown'}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.roomPrice}>₹{selectedRoom.price}/mo</Text>
                <View style={styles.ratingContainer}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.rating}>{selectedRoom.rating?.toFixed(1) || '4.5'}</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={styles.closeCardButton}
              onPress={() => setSelectedRoom(null)}
            >
              <X size={16} color="#71717A" />
            </Pressable>
          </Pressable>
        </View>
      )}

      {/* Room Count Badge */}
      <View style={styles.countBadge}>
        <MapPin size={14} color="#fff" />
        <Text style={styles.countText}>
          {validRooms.length} room{validRooms.length !== 1 ? 's' : ''} on map
        </Text>
      </View>

      {/* No Rooms Message */}
      {validRooms.length === 0 && rooms.length > 0 && (
        <View style={styles.noRoomsMessage}>
          <Text style={styles.noRoomsText}>
            Rooms found but no map coordinates available
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  countBadge: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noRoomsMessage: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noRoomsText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  customMarker: {
    alignItems: 'center',
  },
  markerDot: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  markerPrice: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  roomCardContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1B',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  roomImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  roomTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomLocation: {
    color: '#71717A',
    fontSize: 13,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomPrice: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#fff',
    fontSize: 13,
  },
  closeCardButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
