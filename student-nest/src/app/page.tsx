import { fetchAllListings } from "@/lib/api";
import StudentNestRoomExplorer from "@/components/room/StudentNestRoomExplorer";

export default async function HomePage() {
  const listings = await fetchAllListings();

  return <StudentNestRoomExplorer initialListings={listings} />;
}

