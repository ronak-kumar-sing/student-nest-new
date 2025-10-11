"use client";

import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

export interface NotificationCounts {
  bookings: number;
  negotiations: number;
  messages: number;
  visits: number;
  total: number;
}

export function useNotificationCounts(userRole: 'student' | 'owner' | undefined) {
  const [counts, setCounts] = useState<NotificationCounts>({
    bookings: 0,
    negotiations: 0,
    messages: 0,
    visits: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userRole) {
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        const response = await apiClient.request('/notifications/counts');
        if (response.success && response.data) {
          setCounts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch notification counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCounts, 30000);

    return () => clearInterval(interval);
  }, [userRole]);

  return { counts, loading };
}
