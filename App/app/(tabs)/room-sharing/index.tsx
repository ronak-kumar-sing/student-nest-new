import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/src/services/api';
import { RoomShare, RoomSharingFilters } from '@/src/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';

export default function RoomSharingScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomShares, setRoomShares] = useState<RoomShare[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters] = useState<RoomSharingFilters>({
    page: 1,
    limit: 20,
  });

  const loadRoomShares = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const currentPage = refresh ? 1 : page;
      const response = await api.getRoomShares({ 
        ...filters, 
        page: currentPage,
      });

      if (refresh) {
        setRoomShares(response.shares);
      } else {
        setRoomShares(prev => [...prev, ...response.shares]);
      }

      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading room shares:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoomShares();
  }, [page]);

  const handleRefresh = () => {
    loadRoomShares(true);
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const renderRoomShareCard = ({ item }: { item: RoomShare }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/room-sharing/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Property Image */}
      <Image
        source={{ 
          uri: item.property?.images?.[0] || 'https://via.placeholder.com/400x200',
        }}
        style={styles.propertyImage}
        resizeMode="cover"
      />

      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        { backgroundColor: item.status === 'active' ? '#10B981' : '#F59E0B' },
      ]}>
        <Text style={styles.statusText}>
          {item.sharing.availableSlots} slot{item.sharing.availableSlots !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.propertyTitle}>
          {item.property?.title || 'Room Share Available'}
        </Text>

        <Text style={styles.location}>
          <Ionicons name="location-outline" size={14} />
          {' '}{item.property?.location?.city || 'Location not specified'}
        </Text>

        {/* Cost Info */}
        <View style={styles.costRow}>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>
              Rent/Person
            </Text>
            <Text style={styles.costValue}>
              ₹{item.cost.rentPerPerson.toLocaleString()}/mo
            </Text>
          </View>

          <View style={styles.costItem}>
            <Text style={styles.costLabel}>
              Deposit/Person
            </Text>
            <Text style={styles.costValueSecondary}>
              ₹{item.cost.depositPerPerson.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.preferencesRow}>
          <View style={styles.preferenceBadge}>
            <Ionicons name="people-outline" size={14} color="#000" />
            <Text style={styles.preferenceText}>
              {item.sharing.currentParticipants}/{item.maxParticipants}
            </Text>
          </View>

          <View style={styles.preferenceBadge}>
            <Ionicons 
              name={item.requirements.gender === 'male' ? 'male' : 
                    item.requirements.gender === 'female' ? 'female' : 'male-female'} 
              size={14} 
              color="#000"
            />
            <Text style={styles.preferenceText}>
              {item.requirements.gender === 'any' ? 'Any' : item.requirements.gender}
            </Text>
          </View>

          <View style={styles.preferenceBadge}>
            <Ionicons name="calendar-outline" size={14} color="#000" />
            <Text style={styles.preferenceText}>
              {item.duration}
            </Text>
          </View>
        </View>

        {/* Posted By */}
        <View style={styles.initiatorRow}>
          <Image
            source={{ 
              uri: item.initiator?.profilePhoto || 'https://via.placeholder.com/40',
            }}
            style={styles.initiatorPhoto}
          />
          <Text style={styles.initiatorName}>
            Posted by {item.initiator?.fullName || 'Student'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>
            Room Sharing
          </Text>
          <Text style={styles.headerSubtitle}>
            Find compatible roommates
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/room-sharing/create')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {roomShares.length}
          </Text>
          <Text style={styles.statLabel}>
            Available
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && page === 1) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="home-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>
          No room shares available
        </Text>
        <Text style={styles.emptySubtext}>
          Be the first to create a room sharing post!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={roomShares}
        renderItem={renderRoomShareCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6366F1"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#6B7280',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  location: {
    fontSize: 14,
    marginBottom: 12,
    color: '#6B7280',
  },
  costRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  costItem: {
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  costValueSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  preferencesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  preferenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  preferenceText: {
    fontSize: 12,
    color: '#111827',
  },
  initiatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  initiatorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  initiatorName: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#111827',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
