const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const regex = /perma\s*:\s*["']([^"']+)["']/gi;
let m;
const permas = new Set();
while ((m = regex.exec(appJs)) !== null) {
  permas.add(m[1]);
}
console.log('permas:', Array.from(permas));

// Also check all page definitions or world names
const pageMatches = appJs.match(/perma\s*=\s*["']([^"']+)["']/gi) || [];
console.log('pageMatches:', pageMatches);

// Let's search for "world1", "world2", "world3", "tracksuit", "bomber", etc.
const candidates = [
  'assets/videos/world1.mp4',
  'assets/videos/world2.mp4',
  'assets/videos/world3.mp4',
  'assets/videos/bomberjacket.mp4',
  'assets/videos/bomber.mp4',
  'assets/videos/tracksuit.mp4',
  'assets/videos/tracksuit-black.mp4',
  'assets/videos/tracksuit-white.mp4',
  'assets/videos/intro.mp4'
];
console.log('Testing candidates...');
