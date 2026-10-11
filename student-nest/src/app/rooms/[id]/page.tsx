import { notFound } from 'next/navigation';
import { fetchListingById, fetchAllListings } from '@/lib/api';
import StudentNestRoomDetailView from '@/components/room/StudentNestRoomDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const listings = await fetchAllListings();
  return listings.map((l) => ({ id: l.id }));
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await fetchListingById(id);

  if (!listing) {
    notFound();
  }

  return <StudentNestRoomDetailView listing={listing} />;
}
