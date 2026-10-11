import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="relative max-w-xl w-full text-center space-y-6">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
            404 • Page Not Found
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Looking for a room that doesn't exist?
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you're searching for might have moved, expired, or been leased to another student.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/rooms">
              <Compass className="w-4 h-4" /> Browse Rooms
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-xs text-muted-foreground relative z-10 border-t border-border/60">
          Need assistance? <Link href="/contact" className="underline hover:text-foreground">Reach StudentNest Support</Link>
        </div>
      </div>
    </div>
  );
}
