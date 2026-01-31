/**
 * JSON-LD Schema.org structured data generators
 * For improved SEO and rich search results
 */

interface Organization {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    contactPoint?: {
        contactType: string;
        email?: string;
    };
}

interface WebSite {
    name: string;
    url: string;
    description: string;
    potentialAction?: {
        target: string;
        queryInput: string;
    };
}

interface Service {
    name: string;
    description: string;
    provider: string;
    areaServed: string;
    serviceType: string;
}

export function generateOrganizationSchema(data: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        logo: data.logo,
        description: data.description,
        contactPoint: data.contactPoint ? {
            '@type': 'ContactPoint',
            contactType: data.contactPoint.contactType,
            email: data.contactPoint.email,
        } : undefined,
    };
}

export function generateWebSiteSchema(data: WebSite) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
        description: data.description,
        potentialAction: data.potentialAction ? {
            '@type': 'SearchAction',
            target: data.potentialAction.target,
            'query-input': data.potentialAction.queryInput,
        } : undefined,
    };
}

export function generateServiceSchema(data: Service) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: data.name,
        description: data.description,
        provider: {
            '@type': 'Organization',
            name: data.provider,
        },
        areaServed: data.areaServed,
        serviceType: data.serviceType,
    };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// Default schemas for Student Nest
export const defaultOrganizationSchema = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';
    return generateOrganizationSchema({
        name: 'Student Nest',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Student housing platform connecting students with verified property owners near colleges',
        contactPoint: {
            contactType: 'Customer Service',
            email: 'support@student-nest.live',
        },
    });
};

export const defaultWebSiteSchema = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';
    return generateWebSiteSchema({
        name: 'Student Nest',
        url: baseUrl,
        description: 'Find safe, affordable student accommodation near your college with verified owners',
        potentialAction: {
            target: `${baseUrl}/student/search?q={search_term_string}`,
            queryInput: 'required name=search_term_string',
        },
    });
};

export const defaultServiceSchema = () => {
    return generateServiceSchema({
        name: 'Student Housing Marketplace',
        description: 'Platform connecting students with verified room owners for safe and affordable accommodation',
        provider: 'Student Nest',
        areaServed: 'India',
        serviceType: 'Student Housing',
    });
};
