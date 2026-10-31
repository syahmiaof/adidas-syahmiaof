const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const videoRegex = /['"`]([^'"`]*?\.(?:mp4|webm|ogv))['"`]/gi;
let m;
const videos = new Set();
while ((m = videoRegex.exec(appJs)) !== null) {
  videos.add(m[1]);
}
console.log('Videos found in app.js:', Array.from(videos));

// Also check any occurrences of "assets/videos"
let pos = 0;
while (true) {
  const idx = appJs.indexOf('assets/videos', pos);
  if (idx === -1) break;
  console.log('assets/videos match:', appJs.slice(idx - 30, idx + 100));
  pos = idx + 1;
}
