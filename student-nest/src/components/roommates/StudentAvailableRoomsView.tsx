'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  GraduationCap,
  MessageCircle,
  Eye,
} from 'lucide-react';
import StudentRoomModal from './StudentRoomModal';
import { useChat } from '@/context/ChatContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  matches: any[];
}

export default function StudentAvailableRoomsView({ matches }: Props) {
  const { openChat } = useChat();
  const [selectedRoomMatch, setSelectedRoomMatch] = useState<any | null>(null);

  // Filter only matches that have rooms
  const roomMatches = matches.filter((m) => m.request?.hasRoom && m.request?.room);

  if (roomMatches.length === 0) {
    return (
      <Card className="rounded-3xl p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          🛏️
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">No student rooms listed yet</h3>
        <p className="text-xs text-neutral-500 mb-6">
          Be the first to post a student shared room or switch to the Roommate Profiles tab to find scholars looking to team up.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <span>Available Student Rooms &amp; Flats</span>
            <Badge variant="violet" className="font-bold">
              {roomMatches.length} Rooms
            </Badge>
          </h2>
          <p className="text-xs text-neutral-500">
            Rooms offered directly by verified students looking for a co-tenant
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roomMatches.map((match: any) => {
          const { request, compatibilityPercent } = match;
          const { room } = request;
          const student = request.student;
          const profile = student?.studentProfile;
          const studentName = profile?.fullName || student?.email?.split('@')[0] || 'Student';
          const college = profile?.collegeName || 'University Student';
          const avatar =
            profile?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

          const currencySymbol = room.currency || (room.rentShare > 4000 ? '₹' : '$');
          const heroImage =
            room.images?.[0] ||
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

          return (
            <Card
              key={room.id || request.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative w-full h-48 bg-neutral-100 overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={room.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <Badge variant="default" className="bg-neutral-900/90 backdrop-blur-xs font-bold shadow-xs">
                      {room.roomType}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-neutral-900 text-xs font-black shadow-xs">
                    {currencySymbol}{room.rentShare.toLocaleString()}
                    <span className="text-[10px] font-normal text-neutral-500">/mo</span>
                  </div>

                  {room.distanceToCampus && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-violet-400" />
                      <span>{room.distanceToCampus}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-neutral-900 line-clamp-1 group-hover:text-violet-700 transition">
                      {room.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="line-clamp-1">{room.neighborhood}, {room.city}</span>
                    </div>
                  </div>

                  {/* Key Amenities */}
                  {room.amenities && (
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {room.amenities.slice(0, 3).map((a: string) => (
                        <Badge key={a} variant="secondary" className="font-normal text-[10px]">
                          ✓ {a}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-neutral-400 text-xs px-1">+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Student Roommate Banner */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="w-8 h-8 rounded-full">
                        <AvatarImage src={avatar} alt={studentName} />
                        <AvatarFallback>{studentName[0]?.toUpperCase() || 'S'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900 truncate">
                          {studentName}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate">{college}</div>
                      </div>
                    </div>

                    {compatibilityPercent && (
                      <Badge variant="emerald" className="font-black text-[10px] shrink-0">
                        {compatibilityPercent}% Match
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <Button
                  variant="violet"
                  size="sm"
                  onClick={() => setSelectedRoomMatch(match)}
                  className="flex-1 rounded-xl text-xs font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Room Details</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    openChat(undefined, undefined, {
                      partnerId: student?.id || match.request.id,
                      partnerName: studentName,
                      partnerRole: 'student',
                      partnerAvatar: avatar,
                      initialMessage: `Hi ${studentName}! I saw your available room in ${room.neighborhood} on StudentNest and would love to connect.`,
                    });
                  }}
                  title="Direct Chat"
                  className="rounded-xl h-8 w-8"
                >
                  <MessageCircle className="w-4 h-4 text-violet-600" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Room Modal */}
      {selectedRoomMatch && (
        <StudentRoomModal
          isOpen={Boolean(selectedRoomMatch)}
          onClose={() => setSelectedRoomMatch(null)}
          room={selectedRoomMatch.request.room}
          student={{
            id: selectedRoomMatch.request.student?.id || selectedRoomMatch.request.id,
            name: selectedRoomMatch.request.student?.studentProfile?.fullName || 'Student',
            college: selectedRoomMatch.request.student?.studentProfile?.collegeName || 'Scholar',
            avatar:
              selectedRoomMatch.request.student?.studentProfile?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            compatibilityPercent: selectedRoomMatch.compatibilityPercent,
            bio: selectedRoomMatch.request.bio,
          }}
          onConnect={() => {
            // Can trigger connect
          }}
        />
      )}
    </div>
  );
}
