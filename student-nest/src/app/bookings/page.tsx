import StudentBookings from '@/components/bookings/StudentBookings';

export const metadata = {
  title: 'My Bookings | StudentNest',
  description: 'Track and manage your room bookings on StudentNest.',
};

export default function BookingsPage() {
  return <StudentBookings />;
}
