import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { useRouter, Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import type { AppRoutes } from '@/src/types/navigation';

export default function ModernHeroSection() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.2)', 'transparent', 'rgba(59, 130, 246, 0.2)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>New Launch - Join Early Adopters</Text>
        </View>

        {/* Main headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.gradientText1}>Find Your</Text>
          <Text style={styles.whiteText}>Perfect</Text>
          <Text style={styles.gradientText2}>Student Home</Text>
        </View>

        <Text style={styles.subheadline}>
          Connect with verified property owners near your college.
          Secure, transparent, and student-focused accommodation platform.
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttonContainer}>
              <Button
                style={styles.primaryButton}
                textStyle={styles.buttonText}
                onPress={() => {
                  router.push('/(auth)/student/signup' as any);
                }}>
                Find Accommodation
                <IconSymbol name="arrow.right" size={20} color="#fff" />
              </Button>

            <Button
              style={styles.secondaryButton}
              textStyle={styles.buttonText}
              onPress={() => {
                router.push('/(tabs)');
              }}>
              View Pricing
            </Button>
        </View>

        {/* Social proof */}
        <View style={styles.socialProof}>
          <View style={styles.userCount}>
            <View style={styles.avatarStack}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.avatar, { marginLeft: i > 1 ? -15 : 0 }]} />
              ))}
            </View>
            <Text style={styles.socialText}>500+ Students Joined</Text>
          </View>

          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={16} color="#10b981" />
            <Text style={styles.socialText}>Early Access Program</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: Dimensions.get('window').height,
    backgroundColor: '#0a0a0b',
    position: 'relative',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1b',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a2a2b',
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  headlineContainer: {
    marginTop: 24,
  },
  gradientText1: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  whiteText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gradientText2: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  subheadline: {
    fontSize: 18,
    color: '#a1a1aa',
    marginTop: 16,
    lineHeight: 28,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    height: 56,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: '#1a1a1b',
    borderWidth: 1,
    borderColor: '#2a2a2b',
    height: 56,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  userCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    borderWidth: 2,
    borderColor: '#0a0a0b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
});