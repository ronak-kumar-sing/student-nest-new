import Script from 'next/script';

// Escape </script> to prevent script injection in JSON-LD blocks
function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/<\/script>/gi, '\\u003c/script\\u003e');
}

export default function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Student Nest",
        "url": "https://student-nest.live",
        "logo": "https://student-nest.live/logo.png",
        "description": "India's most trusted student accommodation platform connecting students with verified property owners near top universities.",
        "foundingDate": "2024",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-XXXXXXXXXX",
            "contactType": "Customer Support",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
        },
        "sameAs": [
            "https://twitter.com/studentnest",
            "https://facebook.com/studentnest",
            "https://instagram.com/studentnest"
        ]
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
    );
}
