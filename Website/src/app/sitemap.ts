import { MetadataRoute } from 'next';
import dbConnect from '../lib/db/connection';
import Room from '../lib/models/Room';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';
    const currentDate = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/rooms`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/student/signup`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/owner/signup`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/student/login`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/owner/login`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Dynamic room pages
    try {
        await dbConnect();

        // Fetch all active rooms
        const rooms = await Room.find({ status: 'active' })
            .select('_id updatedAt')
            .lean()
            .exec();

        const roomPages: MetadataRoute.Sitemap = rooms.map((room: any) => ({
            url: `${baseUrl}/rooms/${room._id.toString()}`,
            lastModified: room.updatedAt || currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        return [...staticPages, ...roomPages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return static pages if database query fails
        return staticPages;
    }
}
