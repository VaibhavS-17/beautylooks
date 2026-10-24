import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeImage(filePath) {
  const stat = fs.statSync(filePath);
  const origSizeKb = Math.round(stat.size / 1024);
  const ext = path.extname(filePath).toLowerCase();

  const tempPath = filePath + '.tmp';
  const image = sharp(filePath);
  const metadata = await image.metadata();

  // If width is greater than 1600px, resize proportionally
  let pipeline = image;
  if (metadata.width && metadata.width > 1600) {
    pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(tempPath);
  } else if (ext === '.png') {
    await pipeline.png({ quality: 82, compressionLevel: 8 }).toFile(tempPath);
  } else {
    return;
  }

  const newStat = fs.statSync(tempPath);
  const newSizeKb = Math.round(newStat.size / 1024);

  if (newStat.size < stat.size) {
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    console.log(`Optimized ${path.basename(filePath)}: ${origSizeKb}KB -> ${newSizeKb}KB (-${Math.round((1 - newStat.size / stat.size) * 100)}%)`);
  } else {
    fs.unlinkSync(tempPath);
    console.log(`Skipped ${path.basename(filePath)} (already optimal)`);
  }
}

async function run() {
  const targetDirs = [
    'public/images/concerns',
    'public/images/categories',
    'public/images/products',
  ];

  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (/\.(jpe?g|png)$/i.test(file)) {
          await optimizeImage(fullPath);
        }
      }
    }
  }

  const heroImage = 'public/images/hero-beauty.png';
  if (fs.existsSync(heroImage)) {
    await optimizeImage(heroImage);
  }
}

run().catch(console.error);
