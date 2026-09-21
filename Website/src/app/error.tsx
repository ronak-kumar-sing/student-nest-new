'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="relative max-w-lg w-full text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {error?.message && process.env.NODE_ENV !== 'production'
              ? error.message
              : 'An unexpected issue occurred while rendering this page. Our team has been notified.'}
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-muted-foreground/60 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} size="lg" className="w-full sm:w-auto gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="w-4 h-4" /> Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
