const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.evercraft.co.in';

const routes = [
  '/',
  '/about',
  '/shop',
  '/services',
  '/publish',
  '/contact',
  '/policies'
];

async function generateSitemap() {
  const date = new Date().toISOString().split('T')[0];
  
  // Fetch books from API to generate dynamic routes
  let bookRoutes = [];
  try {
    const res = await fetch('https://www.evercraft.co.in/api/books');
    if (res.ok) {
      const books = await res.json();
      bookRoutes = books.map((b) => `/book/${b.slug}`);
    }
  } catch (err) {
    console.warn("Could not fetch books for sitemap", err);
  }

  const allRoutes = [...routes, ...bookRoutes];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of allRoutes) {
    let priority = '0.8';
    if (route === '/') priority = '1.0';
    if (route === '/shop' || route === '/publish') priority = '0.9';

    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log('sitemap.xml generated successfully at', sitemapPath);
}

generateSitemap();
