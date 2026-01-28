import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import studentsData from '@/data/demo-students.json';
import type { Student } from '@/types';

export default function StudentsDemo() {
    const students = studentsData.students as Student[];

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-xs">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs">
                        <XCircle className="w-3 h-3" />
                        Not Verified
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="border-b border-[#2a2a2b] bg-[#0a0a0b]/90 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/demo"
                            className="p-2 hover:bg-[#1a1a1b] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Students Demo</h1>
                        <span className="px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-sm">
                            {students.length} Students
                        </span>
                    </div>
                </div>
            </header>

            {/* Students Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map((student) => (
                            <div
                                key={student._id}
                                className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-6 hover:scale-105 transition-all duration-300"
                            >
                                {/* Profile Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-2xl font-bold">
                                        {student.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white">{student.fullName}</h3>
                                        <p className="text-sm text-[#a1a1aa]">{student.course}</p>
                                        {getVerificationBadge(student.verification.status)}
                                    </div>
                                </div>

                                {/* College Info */}
                                <div className="flex items-start gap-2 mb-3">
                                    <GraduationCap className="w-4 h-4 text-[#7c3aed] mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <div className="text-white font-medium">{student.collegeName}</div>
                                        <div className="text-[#a1a1aa]">Year {student.yearOfStudy}</div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                                        <Mail className="w-4 h-4 text-[#3b82f6]" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                                        <Phone className="w-4 h-4 text-[#10b981]" />
                                        <span>{student.phone}</span>
                                    </div>
                                    {student.city && (
                                        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                                            <MapPin className="w-4 h-4 text-[#f59e0b]" />
                                            <span>{student.city}, {student.state}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Preferences */}
                                <div className="border-t border-[#3a3a3b] pt-4">
                                    <div className="text-xs text-[#a1a1aa] mb-2">Budget Range</div>
                                    <div className="text-sm font-semibold text-white">
                                        ₹{student.preferences.budgetMin.toLocaleString()} - ₹{student.preferences.budgetMax.toLocaleString()}/month
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#3a3a3b]">
                                    <div>
                                        <div className="text-xs text-[#a1a1aa]">Saved Rooms</div>
                                        <div className="text-lg font-bold text-white">{student.savedRooms.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#a1a1aa]">Profile</div>
                                        <div className="text-lg font-bold text-white">{student.profileCompleteness}%</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
