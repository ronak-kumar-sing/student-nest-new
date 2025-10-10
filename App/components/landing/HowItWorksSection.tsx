import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const steps = [
  {
    icon: 'magnifyingglass' as const,
    title: '1. Search',
    description: 'Browse verified properties near your college',
  },
  {
    icon: 'message.fill' as const,
    title: '2. Connect',
    description: 'Chat with property owners directly',
  },
  {
    icon: 'checkmark.seal.fill' as const,
    title: '3. Book',
    description: 'Secure your accommodation with ease',
  },
];

export default function HowItWorksSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How It Works</Text>
      <Text style={styles.subtitle}>Find your student home in three simple steps</Text>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.iconContainer}>
              <IconSymbol name={step.icon} size={28} color="#7c3aed" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    marginBottom: 32,
  },
  stepsContainer: {
    gap: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2b',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
});