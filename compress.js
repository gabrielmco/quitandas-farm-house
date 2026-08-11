import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imgDir = path.join(process.cwd(), 'public', 'img');
const productsDir = path.join(imgDir, 'products');

async function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const ext = path.extname(file);
      const webpPath = fullPath.replace(ext, '.webp');
      
      try {
        await sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`Converted: ${file} -> ${path.basename(webpPath)}`);
        // Optional: remove original to save space
        // fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
}

async function run() {
  console.log('Starting WebP compression...');
  await processDirectory(imgDir);
  console.log('Compression complete!');
}

run();
