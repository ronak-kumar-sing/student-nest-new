import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ModernHeroSection from '@/components/landing/ModernHeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ModernHeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  contentContainer: {
    flexGrow: 1,
  },
});
