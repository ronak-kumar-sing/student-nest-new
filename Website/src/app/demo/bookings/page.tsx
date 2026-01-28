import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import bookingsData from '@/data/demo-bookings.json';
import studentsData from '@/data/demo-students.json';
import roomsData from '@/data/demo-rooms.json';
import type { Booking, Student, Room } from '@/types';

export default function BookingsDemo() {
    const bookings = bookingsData.bookings as Booking[];
    const students = studentsData.students as Student[];
    const rooms = roomsData.rooms as Room[];

    const getStudent = (id: string) => students.find(s => s._id === id);
    const getRoom = (id: string) => rooms.find(r => r._id === id);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Confirmed
                    </span>
                );
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Active
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#a1a1aa]/10 text-[#a1a1aa] text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {status}
                    </span>
                );
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="text-[#10b981] text-sm">✓ Paid</span>;
            case 'partial':
                return <span className="text-[#f59e0b] text-sm">⚠ Partial</span>;
            default:
                return <span className="text-[#ef4444] text-sm">✗ {status}</span>;
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
                        <h1 className="text-2xl font-bold">Bookings Demo</h1>
                        <span className="px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-sm">
                            {bookings.length} Bookings
                        </span>
                    </div>
                </div>
            </header>

            {/* Bookings List */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {bookings.map((booking) => {
                        const student = getStudent(booking.student as string);
                        const room = getRoom(booking.room as string);

                        return (
                            <div
                                key={booking._id}
                                className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{room?.title}</h3>
                                        <p className="text-sm text-[#a1a1aa]">
                                            Booked by {student?.fullName} • {student?.collegeName}
                                        </p>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>

                                {/* Dates */}
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-[#7c3aed] mt-0.5" />
                                        <div>
                                            <div className="text-xs text-[#a1a1aa] mb-1">Move-in Date</div>
                                            <div className="text-sm font-medium text-white">
                                                {new Date(booking.moveInDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {booking.moveOutDate && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                                            <div>
                                                <div className="text-xs text-[#a1a1aa] mb-1">Move-out Date</div>
                                                <div className="text-sm font-medium text-white">
                                                    {new Date(booking.moveOutDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-[#10b981] mt-0.5" />
                                        <div>
                                            <div className="text-xs text-[#a1a1aa] mb-1">Duration</div>
                                            <div className="text-sm font-medium text-white">
                                                {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6 p-4 bg-[#0a0a0b]/50 rounded-xl">
                                    <div>
                                        <div className="text-xs text-[#a1a1aa] mb-3">Payment Breakdown</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[#a1a1aa]">Monthly Rent:</span>
                                                <span className="text-white font-medium">₹{booking.monthlyRent.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#a1a1aa]">Security Deposit:</span>
                                                <span className="text-white font-medium">₹{booking.securityDeposit.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#a1a1aa]">Maintenance:</span>
                                                <span className="text-white font-medium">₹{booking.maintenanceCharges.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-[#3a3a3b]">
                                                <span className="text-white font-semibold">Total Amount:</span>
                                                <span className="text-white font-bold">₹{booking.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-[#a1a1aa] mb-3">Payment Status</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#a1a1aa]">Status:</span>
                                                {getPaymentBadge(booking.paymentStatus)}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#a1a1aa]">Amount Paid:</span>
                                                <span className="text-[#10b981] font-medium">
                                                    ₹{booking.paymentDetails.totalPaid.toLocaleString()}
                                                </span>
                                            </div>
                                            {booking.paymentDetails.paymentMethod && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#a1a1aa]">Method:</span>
                                                    <span className="text-white font-medium capitalize">
                                                        {booking.paymentDetails.paymentMethod.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.paymentDetails.transactionId && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#a1a1aa]">Transaction ID:</span>
                                                    <span className="text-white font-mono text-xs">
                                                        {booking.paymentDetails.transactionId}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {(booking.studentNotes || booking.ownerNotes) && (
                                    <div className="space-y-3">
                                        {booking.studentNotes && (
                                            <div className="p-3 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg">
                                                <div className="text-xs text-[#7c3aed] font-medium mb-1">Student Notes</div>
                                                <p className="text-sm text-white">{booking.studentNotes}</p>
                                            </div>
                                        )}
                                        {booking.ownerNotes && (
                                            <div className="p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-lg">
                                                <div className="text-xs text-[#3b82f6] font-medium mb-1">Owner Notes</div>
                                                <p className="text-sm text-white">{booking.ownerNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
