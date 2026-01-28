'use client';

import Link from 'next/link';
import { ArrowRight, Users, Home, Calendar, Star, MessageSquare } from 'lucide-react';
import DemoCredentials from '@/components/demo/DemoCredentials';

export default function DemoPage() {
    const demoPages = [
        {
            title: 'Students Demo',
            description: 'View all 5 demo student profiles with verification status, preferences, and saved properties',
            href: '/demo/students',
            icon: Users,
            color: '#7c3aed',
            count: '5 Students'
        },
        {
            title: 'Property Owners Demo',
            description: 'Explore 3 verified property owner profiles with their portfolios and stats',
            href: '/demo/owners',
            icon: Users,
            color: '#3b82f6',
            count: '3 Owners'
        },
        {
            title: 'Room Listings Demo',
            description: 'Browse 6 diverse property listings across Delhi with complete details and amenities',
            href: '/demo/rooms',
            icon: Home,
            color: '#10b981',
            count: '6 Properties'
        },
        {
            title: 'Bookings Demo',
            description: 'View booking lifecycle from confirmed to active to completed with payment tracking',
            href: '/demo/bookings',
            icon: Calendar,
            color: '#f59e0b',
            count: '3 Bookings'
        },
        {
            title: 'Reviews Demo',
            description: 'Read authentic property reviews with ratings and owner responses',
            href: '/demo/reviews',
            icon: Star,
            color: '#ef4444',
            count: '4 Reviews'
        },
        {
            title: 'Meetings Demo',
            description: 'See scheduled and completed property visits and virtual meetings',
            href: '/demo/meetings',
            icon: MessageSquare,
            color: '#8b5cf6',
            count: '5 Meetings'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="border-b border-[#2a2a2b] bg-[#0a0a0b]/90 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent">
                            StudentNest Demo
                        </Link>
                        <Link
                            href="/"
                            className="px-4 py-2 border border-[#2a2a2b] rounded-lg hover:bg-[#1a1a1b] transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                        <span className="text-sm text-[#10b981] font-medium">Demo Data Loaded</span>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent">
                            Explore Demo Data
                        </span>
                    </h1>

                    <p className="text-xl text-[#a1a1aa] max-w-3xl mx-auto mb-8">
                        Test the complete Student Nest platform with realistic demo data including students,
                        owners, properties, bookings, reviews, and meetings.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#a1a1aa]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]"></div>
                            <span>26 Total Records</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                            <span>6 Data Categories</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                            <span>100% Type-Safe</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Credentials Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <DemoCredentials />
            </section>

            {/* Demo Pages Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demoPages.map((page, index) => (
                            <Link
                                key={index}
                                href={page.href}
                                className="group relative bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                                style={{
                                    boxShadow: `0 0 0 1px ${page.color}20`
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${page.color}20`, border: `1px solid ${page.color}40` }}
                                >
                                    <page.icon className="w-6 h-6" style={{ color: page.color }} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-2">{page.title}</h3>
                                <p className="text-[#a1a1aa] text-sm mb-4 leading-relaxed">
                                    {page.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: page.color }}>
                                        {page.count}
                                    </span>
                                    <ArrowRight
                                        className="w-5 h-5 text-[#a1a1aa] group-hover:translate-x-1 transition-transform"
                                    />
                                </div>

                                {/* Bottom accent */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ backgroundColor: page.color }}
                                ></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Overview */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Demo Data Overview</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Students</h3>
                                <ul className="space-y-2 text-sm text-[#a1a1aa]">
                                    <li>• IIT Delhi - B.Tech CSE</li>
                                    <li>• DU Ramjas - B.A. Economics</li>
                                    <li>• AIIMS Delhi - MBBS</li>
                                    <li>• JNU - M.A. Political Science</li>
                                    <li>• NIFT Delhi - B.Des Fashion</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Properties</h3>
                                <ul className="space-y-2 text-sm text-[#a1a1aa]">
                                    <li>• Model Town (DU North)</li>
                                    <li>• GTB Nagar (DU North)</li>
                                    <li>• Satya Niketan (DU South)</li>
                                    <li>• Hauz Khas (IIT/JNU)</li>
                                    <li>• ₹7,500 - ₹18,000/month</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                                <ul className="space-y-2 text-sm text-[#a1a1aa]">
                                    <li>• Complete verification flow</li>
                                    <li>• Booking lifecycle tracking</li>
                                    <li>• Review system with ratings</li>
                                    <li>• Meeting scheduling</li>
                                    <li>• Payment tracking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
