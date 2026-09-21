"use client";

import CardSwap, { Card } from './components/CardSwap';
import { Button } from '../ui/button';
import { ArrowRight, Star, Users, Shield, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import TrustBadges from './TrustBadges';

// Clean Application Preview Bar Component
function ApplicationPreviewBar({ title = "StudentNest Verified Portal" }: { title?: string }) {
  return (
    <div className="w-full h-9 bg-card/90 border-b border-border/60 flex items-center justify-between px-4 text-xs text-muted-foreground backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-foreground text-[11px] tracking-wide">{title}</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
        <span>Verified Accommodation</span>
      </div>
    </div>
  );
}

export default function ModernHeroSection() {
  return (
    <section className="relative min-h-screen bg-background text-foreground overflow-hidden" aria-label="Hero section">
      {/* Subtle ambient light glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-visible">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">

          {/* Left side - Text content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">Verified Student Housing • 100% Broker-Free</span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                <span className="text-primary">
                  Find Your
                </span>
                <br />
                <span className="text-foreground">Perfect</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  Student Home
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect directly with verified property owners near your campus.
                Zero brokerage, transparent pricing, and instant booking with student-friendly amenities.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Sign up and find student accommodation"
              >
                <Link href="/rooms">
                  Browse Rooms
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-card hover:bg-muted/80 text-foreground h-14 px-8 text-lg font-semibold rounded-xl transition-all duration-200"
              >
                <Link href="/pricing">
                  View Plans
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8">
              <TrustBadges />
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-muted-foreground text-sm font-medium">500+ Verified Students</span>
              </div>

              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-emerald-500 fill-current" />
                <span className="text-muted-foreground text-sm font-medium">Verified Owner Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right side - CardSwap component */}
          <div className="relative flex justify-end items-end h-full">
            <div className="relative lg:translate-x-43 lg:-translate-y-10">
              <CardSwap
                width={760}
                height={650}
                cardDistance={100}
                verticalDistance={120}
                delay={4000}
                pauseOnHover={false}
                skewAmount={7}
                easing="elastic"
              >
                <Card customClass="bg-[#2a2a2a] border-[#3a3a3a] shadow-2xl overflow-hidden rounded-xl">
                  <div className="w-full h-full flex flex-col">
                    <ApplicationPreviewBar />
                    <div className="flex-1 relative">
                      <Image
                        src="/screenshots/dashboard-view.svg"
                        alt="Student dashboard interface showing available rooms, filters, and booking options"
                        width={700}
                        height={568}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-6 h-6 text-[#7c3aed]" />
                          <h3 className="text-lg font-bold text-white">Student Dashboard</h3>
                        </div>
                        <p className="text-[#a1a1aa] text-sm">Browse verified properties and manage your applications</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card customClass="bg-[#2a2a2a] border-[#3a3a3a] shadow-2xl overflow-hidden rounded-xl">
                  <div className="w-full h-full flex flex-col">
                    <ApplicationPreviewBar />
                    <div className="flex-1 relative">
                      <Image
                        src="/screenshots/room-search.svg"
                        alt="Room search interface with map view, filters by price, location, and amenities"
                        width={700}
                        height={568}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="w-6 h-6 text-[#10b981]" />
                          <h3 className="text-lg font-bold text-white">Smart Search</h3>
                        </div>
                        <p className="text-[#a1a1aa] text-sm">Find properties with advanced filters and location-based search</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card customClass="bg-[#2a2a2a] border-[#3a3a3a] shadow-2xl overflow-hidden rounded-xl">
                  <div className="w-full h-full flex flex-col">
                    <ApplicationPreviewBar />
                    <div className="flex-1 relative">
                      <Image
                        src="/screenshots/property-details.svg"
                        alt="Property details page showing photos gallery, amenities, pricing, and verified owner contact information"
                        width={700}
                        height={568}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Star className="w-6 h-6 text-[#3b82f6]" />
                          <h3 className="text-lg font-bold text-white">Property Details</h3>
                        </div>
                        <p className="text-[#a1a1aa] text-sm">Detailed information, photos, and verified owner contact</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent"></div>
    </section>
  );
}
