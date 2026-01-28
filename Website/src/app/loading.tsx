import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-lg border-b border-[#2a2a2b]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Skeleton className="h-10 w-40 bg-[#1a1a1b]" />
                        <div className="hidden lg:flex items-center gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-4 w-20 bg-[#1a1a1b]" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-32 bg-[#1a1a1b]" />
                    </div>
                </div>
            </div>

            {/* Hero Section Skeleton */}
            <div className="pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
                    <div className="space-y-8">
                        <Skeleton className="h-6 w-64 bg-[#1a1a1b]" />
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full max-w-lg bg-[#1a1a1b]" />
                            <Skeleton className="h-16 w-full max-w-lg bg-[#1a1a1b]" />
                            <Skeleton className="h-16 w-3/4 max-w-md bg-[#1a1a1b]" />
                        </div>
                        <Skeleton className="h-6 w-full max-w-lg bg-[#1a1a1b]" />
                        <div className="flex gap-4">
                            <Skeleton className="h-14 w-48 bg-[#1a1a1b]" />
                            <Skeleton className="h-14 w-32 bg-[#1a1a1b]" />
                        </div>
                    </div>
                    <div className="relative">
                        <Skeleton className="h-[650px] w-full max-w-[760px] bg-[#1a1a1b] rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Content Sections Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Skeleton className="h-12 w-96 mx-auto mb-4 bg-[#1a1a1b]" />
                        <Skeleton className="h-6 w-[600px] mx-auto bg-[#1a1a1b]" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((j) => (
                            <Skeleton key={j} className="h-64 bg-[#1a1a1b] rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
