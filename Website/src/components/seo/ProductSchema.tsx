import Script from 'next/script';

interface ProductSchemaProps {
    name: string;
    description: string;
    price: number;
    currency?: string;
    availability: boolean;
    rating?: number;
    reviewCount?: number;
    images?: string[];
    url: string;
}

export default function ProductSchema({
    name,
    description,
    price,
    currency = 'INR',
    availability,
    rating,
    reviewCount,
    images = [],
    url,
}: ProductSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": description,
        "image": images.length > 0 ? images : undefined,
        "url": url,
        "offers": {
            "@type": "Offer",
            "price": price,
            "priceCurrency": currency,
            "availability": availability
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "url": url,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
        ...(rating && reviewCount && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": rating,
                "reviewCount": reviewCount,
                "bestRating": 5,
                "worstRating": 1,
            }
        })
    };

    return (
        <Script
            id="product-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
