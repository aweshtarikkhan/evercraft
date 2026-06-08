const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public', 'Images');

async function processImages() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputName = file.replace(/\.png$/i, '.webp');
      const outputPath = path.join(dir, outputName);
      
      console.log(`Converting ${file} to WebP...`);
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Success: ${outputName}`);
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
}

processImages();
