import RoomDetailView from '@/components/room/RoomDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <RoomDetailView roomId={resolvedParams.id} />;
}
