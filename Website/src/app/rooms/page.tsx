import type { Metadata } from 'next';
import RoomBrowser from "../../components/room/RoomBrowser";
import Header from "@/components/landing/Header";
import SimpleFooter from "@/components/landing/SimpleFooter";

export const metadata: Metadata = {
    title: 'Browse Student Accommodation Near Top Universities',
    description: 'Find verified student rooms, PG, and hostels near IIT, NIT, and other top universities. Compare 500+ properties with transparent pricing, verified owners, and honest reviews.',
    keywords: [
        'student rooms near me',
        'pg near college',
        'student accommodation',
        'hostel near university',
        'rooms for students',
        'verified student housing',
        'affordable pg',
        'student apartments',
    ],
    openGraph: {
        title: 'Browse Student Accommodation | Student Nest',
        description: 'Find your perfect student room near top universities. 500+ verified properties with transparent pricing.',
        url: '/rooms',
        siteName: 'Student Nest',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Browse Student Accommodation on Student Nest',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Browse Student Accommodation | Student Nest',
        description: 'Find verified student rooms near top universities. 500+ properties available.',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: '/rooms',
    },
};

export default function PublicRoomsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 pt-24 pb-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">Browse Available Rooms</h1>
                    <p className="text-gray-600">
                        Find your perfect student accommodation near top universities
                    </p>
                </div>

                {/* Room Browser Component */}
                <RoomBrowser />
            </main>

            <SimpleFooter />
        </div>
    );
}
