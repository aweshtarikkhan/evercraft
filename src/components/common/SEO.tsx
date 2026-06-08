import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: object;
}

// Organization + LocalBusiness JSON-LD (appears on every page)
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "name": "EverCraft Publications",
  "alternateName": "EverCraft",
  "url": "https://www.evercraft.co.in",
  "logo": "https://www.evercraft.co.in/Images/Evercraft Logo.webp",
  "image": "https://www.evercraft.co.in/Images/Evercraft Logo 2.webp",
  "description": "EverCraft Publications is India's premium book publishing house. We help authors publish, print, edit, and distribute books globally on Amazon, Flipkart, and more.",
  "foundingDate": "2026",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Vrindavan Nagar",
    "addressLocality": "Bhopal",
    "addressRegion": "Madhya Pradesh",
    "postalCode": "462022",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "23.2599",
    "longitude": "77.4126"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-90090-36633",
    "contactType": "customer service",
    "email": "evercraft2026@gmail.com",
    "availableLanguage": ["English", "Hindi"],
    "areaServed": "IN"
  },
  "sameAs": [
    "https://www.facebook.com/EvercraftPublications",
    "https://www.instagram.com/evercraft_publications/",
    "https://www.linkedin.com/company/bookpublishing/about/"
  ],
  "priceRange": "₹₹",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "10:00",
    "closes": "18:00"
  },
  "knowsAbout": [
    "Book Publishing", "Self Publishing India", "Book Printing", 
    "Book Editing", "ISBN Registration", "Book Cover Design",
    "Amazon KDP Publishing", "Flipkart Book Listing"
  ]
};

// WebSite JSON-LD for sitelinks searchbox
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "EverCraft Publications",
  "url": "https://www.evercraft.co.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.evercraft.co.in/shop?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "EverCraft Publications is India's premium book publishing house. Publish, print, edit, and distribute your books globally on Amazon, Flipkart & more. Best book publisher in Indore, Bhopal & all over India.", 
  keywords = "best book publishing house, publish book in indore, publish book in bhopal, book publishing India, print your book, edit your book, get your ideas into book, self publishing India, book publisher near me, academic publishing India, ISBN registration India, book printing services, amazon book publishing India", 
  image = "https://www.evercraft.co.in/Images/Evercraft Logo 2.webp",
  url,
  type = "website",
  noindex = false,
  jsonLd
}) => {
  const location = useLocation();
  const fullTitle = `${title} | EverCraft Publications – Get Your Ideas Published into Books`;
  const canonicalUrl = url || `https://www.evercraft.co.in${location.pathname}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Language & Locale */}
      <meta httpEquiv="content-language" content="en-IN" />
      <html lang="en" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="EverCraft Publications" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Organization JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(ORGANIZATION_SCHEMA)}
      </script>

      {/* WebSite JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(WEBSITE_SCHEMA)}
      </script>

      {/* Page-specific JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
