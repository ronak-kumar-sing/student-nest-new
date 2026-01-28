import type { Metadata } from 'next';
import PricingSectionSimple from '@/components/landing/PricingSectionSimple';
import Header from '@/components/landing/Header';
import SimpleFooter from '@/components/landing/SimpleFooter';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Simple, transparent pricing for students and property owners. Free for students, affordable for owners.',
    openGraph: {
        title: 'Pricing | Student Nest',
        description: 'Simple, transparent pricing for students and property owners',
    },
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>

            {/* Header */}
            <Header />

            {/* Main content */}
            <main id="main-content" className="relative pt-24">
                {/* Back navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors duration-300"
                        aria-label="Go back to home page"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent">
                            Simple Pricing
                        </span>
                    </h1>
                    <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed mb-8">
                        Built for students with transparent, affordable pricing. No hidden fees, no surprises.
                    </p>
                </section>

                {/* Pricing section */}
                <PricingSectionSimple />

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Why is it free for students?</h3>
                            <p className="text-[#a1a1aa]">
                                We believe finding a safe and affordable home should never cost money. Students already face enough financial pressure,
                                so we make our platform completely free for them to browse, connect, and schedule visits.
                            </p>
                        </div>

                        <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">How does the 4-month listing work for owners?</h3>
                            <p className="text-[#a1a1aa]">
                                For ₹99, property owners can list one room for 4 months. This gives them ample time to find quality tenants.
                                The listing includes unlimited photos, direct messaging, and full access to our verified student database.
                            </p>
                        </div>

                        <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">What is the Room Partner Search add-on?</h3>
                            <p className="text-[#a1a1aa]">
                                For ₹99, students get access to our AI-powered roommate matching algorithm that connects you with 6 compatible
                                roommates based on your lifestyle, study habits, and preferences. Perfect for students new to the city.
                            </p>
                        </div>

                        <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Are there any booking fees?</h3>
                            <p className="text-[#a1a1aa]">
                                No booking fees for students! Property owners only pay a small commission when a booking is successfully completed.
                                This success-based model ensures we only earn when we deliver value.
                            </p>
                        </div>

                        <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Can I list multiple properties?</h3>
                            <p className="text-[#a1a1aa]">
                                Yes! Each listing is ₹99 per room for 4 months, or you can opt for the annual plan at ₹199 per room to save ₹197.
                                Bulk discounts are available for owners with 5+ properties—contact our support team.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-2xl p-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                        <p className="text-[#a1a1aa] text-lg mb-8 max-w-2xl mx-auto">
                            Join hundreds of students who have already found their perfect accommodation through Student Nest.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/student/signup"
                                className="inline-block px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold rounded-xl hover:from-[#6d28d9] hover:to-[#2563eb] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Sign Up as Student
                            </Link>
                            <Link
                                href="/owner/signup"
                                className="inline-block px-8 py-4 bg-[#1a1a1b] border-2 border-[#2a2a2b] text-white font-semibold rounded-xl hover:bg-[#2a2a2b] transition-all duration-300"
                            >
                                List Your Property
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <SimpleFooter />
        </div>
    );
}
