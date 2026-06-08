import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  // Generate JSON-LD for structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.evercraft.co.in/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.title,
        "item": `https://www.evercraft.co.in${item.path}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" style={{ padding: '16px 0', fontSize: '14px', color: '#666' }}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <li>
            <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <li style={{ color: '#ccc' }}>/</li>
              <li aria-current={index === items.length - 1 ? 'page' : undefined}>
                {index === items.length - 1 ? (
                  <span style={{ color: '#333', fontWeight: 500 }}>{item.title}</span>
                ) : (
                  <Link to={item.path} style={{ color: '#D4AF37', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    {item.title}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
};
