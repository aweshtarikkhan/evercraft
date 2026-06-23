const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/constants/data.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/ServicesPage.tsx',
  'src/pages/ContactPage.tsx'
];

filesToFix.forEach(relPath => {
  const p = path.join(__dirname, relPath);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace desc: "some text." with desc: "some text"
  content = content.replace(/desc: "([^"]+)\."/g, 'desc: "$1"');
  
  // Replace title: "some text." with title: "some text"
  content = content.replace(/title: "([^"]+)\."/g, 'title: "$1"');

  // Let's also look for HTML elements with short text ending in dot.
  // E.g. <h3>Something.</h3>
  content = content.replace(/(<h[1-6][^>]*>.*?\b)\.(<\/h[1-6]>)/g, '$1$2');

  // Section titles
  content = content.replace(/(className="section-title"[^>]*>.*?\b)\.(<\/h[1-6]>)/g, '$1$2');
  
  // Section badges
  content = content.replace(/(className="section-badge"[^>]*>.*?\b)\.(<\/span>)/g, '$1$2');

  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed', p);
});
