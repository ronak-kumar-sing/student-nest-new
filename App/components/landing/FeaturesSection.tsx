import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const features = [
  {
    icon: 'magnifyingglass' as const,
    title: 'Smart Search',
    description: 'Find accommodation near your college with advanced filters',
  },
  {
    icon: 'shield.fill' as const,
    title: 'Verified Owners',
    description: 'Connect with background-checked property owners',
  },
  {
    icon: 'bolt.fill' as const,
    title: 'Quick Process',
    description: 'Book your accommodation in just a few steps',
  },
  {
    icon: 'creditcard.fill' as const,
    title: 'Secure Payments',
    description: 'Protected transactions with multiple payment options',
  },
];

export default function FeaturesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Key Features</Text>
      <Text style={styles.subtitle}>Everything you need to find your perfect student home</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuresContainer}
      >
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <IconSymbol name={feature.icon} size={24} color="#7c3aed" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0a0a0b',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    paddingHorizontal: 8,
  },
  featureCard: {
    backgroundColor: '#1a1a1b',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    width: 280,
    borderWidth: 1,
    borderColor: '#2a2a2b',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
});