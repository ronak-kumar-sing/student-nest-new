import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { defaultOrganizationSchema, defaultWebSiteSchema, defaultServiceSchema } from '@/lib/utils/schema';
import Header from '@/components/landing/Header';
import SimpleFooter from '@/components/landing/SimpleFooter';

// Only dynamically import truly interactive components
const ModernHeroSection = dynamic(() => import('@/components/landing/ModernHeroSection'), {
  loading: () => <div className="h-screen bg-[#0a0a0b] animate-pulse" />
});

const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), {
  loading: () => <div className="h-96 bg-[#0a0a0b] animate-pulse" />
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection'), {
  loading: () => <div className="h-96 bg-[#0a0a0b] animate-pulse" />
});

const SocialProofSection = dynamic(() => import('@/components/landing/SocialProofSection'), {
  loading: () => <div className="h-96 bg-[#0a0a0b] animate-pulse" />
});

const PricingSectionSimple = dynamic(() => import('@/components/landing/PricingSectionSimple'), {
  loading: () => <div className="h-96 bg-[#0a0a0b] animate-pulse" />
});

const EarlyAdopterSection = dynamic(() => import('@/components/landing/EarlyAdopterSection'), {
  loading: () => <div className="h-48 bg-[#0a0a0b] animate-pulse" />
});

const EssentialFAQ = dynamic(() => import('@/components/landing/EssentialFAQ'), {
  loading: () => <div className="h-96 bg-[#0a0a0b] animate-pulse" />
});

export default function Home() {
  // Generate structured data for SEO
  const organizationSchema = defaultOrganizationSchema();
  const websiteSchema = defaultWebSiteSchema();
  const serviceSchema = defaultServiceSchema();

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />

      <div className="min-h-screen bg-[#0a0a0b] text-white">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        {/* Header - Server Component */}
        <Header />

        {/* Main content with Suspense boundaries for streaming */}
        <main id="main-content" className="relative">
          {/* Hero section - Interactive with CardSwap */}
          <Suspense fallback={<div className="h-screen bg-[#0a0a0b] animate-pulse" />}>
            <ModernHeroSection />
          </Suspense>

          {/* Features section */}
          <Suspense fallback={<div className="h-96 bg-[#0a0a0b] animate-pulse" />}>
            <section id="features">
              <FeaturesSection />
            </section>
          </Suspense>

          {/* How it works */}
          <Suspense fallback={<div className="h-96 bg-[#0a0a0b] animate-pulse" />}>
            <HowItWorksSection />
          </Suspense>

          {/* Social proof */}
          <Suspense fallback={<div className="h-96 bg-[#0a0a0b] animate-pulse" />}>
            <SocialProofSection />
          </Suspense>

          {/* Pricing */}
          <Suspense fallback={<div className="h-96 bg-[#0a0a0b] animate-pulse" />}>
            <section id="pricing">
              <PricingSectionSimple />
            </section>
          </Suspense>

          {/* Early adopter CTA */}
          <Suspense fallback={<div className="h-48 bg-[#0a0a0b] animate-pulse" />}>
            <EarlyAdopterSection />
          </Suspense>

          {/* FAQ */}
          <Suspense fallback={<div className="h-96 bg-[#0a0a0b] animate-pulse" />}>
            <section id="faq">
              <EssentialFAQ />
            </section>
          </Suspense>
        </main>

        {/* Footer - Server Component */}
        <SimpleFooter />
      </div>
    </>
  );
}
