const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find all occurrences of assets/
const assetRegex = /assets\/[a-zA-Z0-9_\-\.\/]+/g;
const matchedAssets = new Set(code.match(assetRegex) || []);
console.log('Total static assets path matches:', matchedAssets.size);
console.log(Array.from(matchedAssets).sort());

// Search for CinemaConfig and FigmaConfig definitions
console.log('\n--- Searching for _cinemaConfig & _figmaConfig ---');
const regexC = /[a-zA-Z0-9_$]+\._cinemaConfig\s*=\s*['"`]([^'"`]+)['"`]/g;
let match;
while ((match = regexC.exec(code)) !== null) {
  console.log('cinemaConfig match:', match[0]);
}

const regexF = /[a-zA-Z0-9_$]+\._figmaConfig\s*=\s*['"`]([^'"`]+)['"`]/g;
while ((match = regexF.exec(code)) !== null) {
  console.log('figmaConfig match:', match[0]);
}

// Search for load / Asset loader / Manifest
console.log('\n--- Manifest / Preload search ---');
const manifestRegex = /([a-zA-Z0-9_$]+(?:\.load|\.add|\.preload|Assets|Manifest)[^;{}]*)/g;
// Let's search for snippets with 'assets/'
const lines = code.split(';');
const assetLines = lines.filter(l => l.includes('assets/data') || l.includes('assets/geometry') || l.includes('assets/images'));
console.log('Found asset-related code statements:', assetLines.length);
assetLines.slice(0, 30).forEach(l => {
  if (l.length < 300) console.log(' -> ', l.trim());
  else console.log(' -> [long] ', l.slice(0, 200).trim() + '...');
});
