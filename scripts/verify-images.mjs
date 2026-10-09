import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productImages } from '../src/data/productImages.js';
import { siteImages } from '../src/data/siteImages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

let hasFailure = false;
let verifiedCount = 0;

console.log('Verifying all local product and site image files...');

// 1. Verify 28 Product Images
for (const [id, relPath] of Object.entries(productImages)) {
  const filePath = path.join(publicDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ [MISSING] Product ${id} at ${relPath}`);
    hasFailure = true;
  } else {
    const stat = fs.statSync(filePath);
    if (stat.size < 1000) {
      console.error(`✗ [EMPTY / CORRUPT] Product ${id} (${stat.size} bytes)`);
      hasFailure = true;
    } else {
      console.log(`✓ [LOCAL OK] Product ${id} (${Math.round(stat.size / 1024)} KB)`);
      verifiedCount++;
    }
  }
}

// 2. Verify Site Images
const sitePaths = [
  ['Hero', siteImages.hero],
  ['Editorial', siteImages.editorial],
  ...Object.entries(siteImages.categories).map(([slug, p]) => [`Category: ${slug}`, p]),
];

for (const [label, relPath] of sitePaths) {
  const filePath = path.join(publicDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ [MISSING] ${label} at ${relPath}`);
    hasFailure = true;
  } else {
    const stat = fs.statSync(filePath);
    if (stat.size < 1000) {
      console.error(`✗ [EMPTY / CORRUPT] ${label} (${stat.size} bytes)`);
      hasFailure = true;
    } else {
      console.log(`✓ [LOCAL OK] ${label} (${Math.round(stat.size / 1024)} KB)`);
      verifiedCount++;
    }
  }
}

if (hasFailure) {
  console.error('\nERROR: Image verification failed. Missing or corrupt images found.');
  process.exit(1);
} else {
  console.log(`\nSUCCESS: All ${verifiedCount} local images verified successfully in public/images/.`);
}
