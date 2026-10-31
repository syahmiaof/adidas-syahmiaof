const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const matches = appJs.match(/Thread\.PATH\s*=\s*[^;,]+/g) || [];
console.log('Thread.PATH matches:', matches);

// Let's also check Assets.PATH
const assetPath = appJs.match(/Assets\.PATH\s*=\s*[^;,]+/g) || [];
console.log('Assets.PATH matches:', assetPath);
