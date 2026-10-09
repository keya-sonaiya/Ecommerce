import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const productUrls = {
  'atn-ts-001': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ts-002': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ts-003': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ts-004': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop&auto=format&q=80',

  'atn-sh-001': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-sh-002': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-sh-003': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-sh-004': 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop&auto=format&q=80',

  'atn-tr-001': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-tr-002': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-tr-003': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-tr-004': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop&auto=format&q=80',

  'atn-ow-001': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ow-002': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ow-003': 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ow-004': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1000&fit=crop&auto=format&q=80',

  'atn-kn-001': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-kn-002': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-kn-003': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-kn-004': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&h=1000&fit=crop&auto=format&q=80',

  'atn-ac-001': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-002': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-003': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-004': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-005': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-006': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-007': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=1000&fit=crop&auto=format&q=80',
  'atn-ac-008': 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&h=1000&fit=crop&auto=format&q=80',
};

const siteUrls = {
  hero: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop&auto=format&q=80',
  editorial: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop&auto=format&q=80',
  't-shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop&auto=format&q=80',
  shirts: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=1000&fit=crop&auto=format&q=80',
  trousers: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop&auto=format&q=80',
  outerwear: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1000&fit=crop&auto=format&q=80',
  knitwear: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop&auto=format&q=80',
  accessories: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=1000&fit=crop&auto=format&q=80',
};

const productsDir = path.join(rootDir, 'public', 'images', 'products');
const siteDir = path.join(rootDir, 'public', 'images', 'site');

fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(siteDir, { recursive: true });

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    console.log(`[Already exists] ${path.basename(destPath)}`);
    return true;
  }

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          const fileStream = fs.createWriteStream(destPath);
          redirectRes.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`[Downloaded] ${path.basename(destPath)}`);
            resolve(true);
          });
        }).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`[Downloaded] ${path.basename(destPath)}`);
        resolve(true);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- Downloading Products Images ---');
  for (const [id, url] of Object.entries(productUrls)) {
    const dest = path.join(productsDir, `${id}.jpg`);
    await downloadFile(url, dest);
  }

  console.log('--- Downloading Site Images ---');
  for (const [name, url] of Object.entries(siteUrls)) {
    const dest = path.join(siteDir, `${name}.jpg`);
    await downloadFile(url, dest);
  }

  console.log('All images downloaded successfully into public/images/!');
}

main().catch((err) => {
  console.error('Download error:', err);
  process.exit(1);
});

