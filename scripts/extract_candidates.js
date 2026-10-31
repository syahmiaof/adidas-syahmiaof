const fs = require('fs');
const path = require('path');

const uilStr = fs.readFileSync(path.join(__dirname, 'uil.json'), 'utf8');
const appStr = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const allAssets = new Set();

// 1. Find all JSON objects in uilStr with "src"
const srcRegex = /"src"\s*:\s*"([^"]+)"/g;
let m;
while ((m = srcRegex.exec(uilStr)) !== null) {
  if (m[1]) allAssets.add(m[1]);
}

// 2. Find all assets/... in uilStr
const assetRegex = /assets\/[a-zA-Z0-9_\-\.\/]+/g;
while ((m = assetRegex.exec(uilStr)) !== null) {
  allAssets.add(m[0]);
}

// 3. Find all assets/... in appStr
while ((m = assetRegex.exec(appStr)) !== null) {
  allAssets.add(m[0]);
}

console.log('Total identified asset paths so far:', allAssets.size);

// Clean up and filter
const cleaned = Array.from(allAssets)
  .map(a => a.replace(/\\/g, '/'))
  .filter(a => {
    // filter out pure directories without file names or with placeholders
    if (a.endsWith('/')) return false;
    if (a.includes('${')) return false;
    return true;
  });

console.log('Cleaned file asset paths:', cleaned.length);
fs.writeFileSync(path.join(__dirname, 'candidate_assets.json'), JSON.stringify(cleaned.sort(), null, 2));
console.log('Wrote candidate_assets.json');
