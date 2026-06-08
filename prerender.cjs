const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 4173;
const DIST_DIR = path.join(__dirname, 'dist');

// Define static routes to prerender
const routes = [
  '/',
  '/about',
  '/shop',
  '/services',
  '/publish',
  '/contact',
  '/policies'
];

async function prerender() {
  console.log('Starting prerender process...');
  
  // 1. Start local server serving the dist folder
  const app = express();
  app.use(express.static(DIST_DIR));
  // Fallback to index.html for SPA routing
  app.use((req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  
  const server = app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  
  // 3. Render each route
  for (const route of routes) {
    console.log(`Prerendering ${route}...`);
    const page = await browser.newPage();
    
    // Disable JS execution after initial load to capture static HTML,
    // but we need it to run first to render React.
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Get full HTML including doctype
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    html = `<!DOCTYPE html>\n${html}`;

    // 4. Save HTML to dist folder
    const routeDir = path.join(DIST_DIR, route === '/' ? '' : route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
    console.log(`Saved ${routeDir}/index.html`);
    
    await page.close();
  }

  // 5. Cleanup
  await browser.close();
  server.close();
  console.log('Prerendering complete!');
}

prerender().catch(err => {
  console.error('Error during prerendering:', err);
  process.exit(1);
});
