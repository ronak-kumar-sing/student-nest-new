import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';

export default function RegisterScreen() {
  const { role } = useLocalSearchParams<{ role: 'student' | 'owner' }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as {role}</Text>
      <Text style={styles.subtitle}>Create your account to get started</Text>
      
      {/* Registration form will be added here */}
      <Text style={styles.info}>Registration form coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0a0a0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 32,
  },
  info: {
    color: '#a1a1aa',
    marginTop: 16,
  },
});