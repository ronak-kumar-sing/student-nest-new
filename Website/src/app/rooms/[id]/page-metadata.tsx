import { Metadata } from 'next';

interface PageProps {
    params: {
        id: string;
    };
}

// Generate dynamic metadata for each room page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = params;

    try {
        // Fetch room data for metadata
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live'}/api/rooms/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return {
                title: 'Room Not Found | Student Nest',
                description: 'The requested room listing could not be found.',
            };
        }

        const room = await response.json();

        // Create SEO-optimized metadata
        const title = `${room.title} - ₹${room.price.toLocaleString()}/month | Student Nest`;
        const description = room.description || `${room.roomType} room in ${room.location?.address || 'prime location'}. Book verified student accommodation with transparent pricing.`;

        return {
            title,
            description: description.slice(0, 160), // Limit to 160 chars
            keywords: [
                room.title,
                `${room.roomType} room`,
                room.accommodationType,
                'student accommodation',
                'pg near me',
                room.location?.address || '',
            ],
            openGraph: {
                title,
                description: description.slice(0, 160),
                url: `/rooms/${id}`,
                siteName: 'Student Nest',
                images: room.images && room.images.length > 0 ? [
                    {
                        url: room.images[0],
                        width: 1200,
                        height: 630,
                        alt: room.title,
                    }
                ] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description: description.slice(0, 160),
                images: room.images && room.images.length > 0 ? [room.images[0]] : [],
            },
            alternates: {
                canonical: `/rooms/${id}`,
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Student Room | Student Nest',
            description: 'Find verified student accommodation with transparent pricing.',
        };
    }
}

// Export the page component from the existing file
export { default } from './RoomDetailPage';
