import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
    src: string;
    alt: string;
    priority?: boolean;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
}

/**
 * Optimized Image component with sensible defaults
 * Uses next/image with automatic lazy loading and blur placeholder
 */
export default function ImageOptimized({
    src,
    alt,
    priority = false,
    className,
    aspectRatio,
    width,
    height,
    ...props
}: OptimizedImageProps) {
    const aspectRatioClass = aspectRatio ? {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[21/9]',
    }[aspectRatio] : '';

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
            className={cn(aspectRatioClass, 'object-cover', className)}
            {...props}
        />
    );
}
