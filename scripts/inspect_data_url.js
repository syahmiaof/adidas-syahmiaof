const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const matches = appJs.match(/DATA_URL\s*=\s*[^;,]+/g) || [];
console.log('DATA_URL matches:', matches);

// Check Assets.getPath or Assets.ROOT or similar
const assetRoot = appJs.match(/Assets\.[A-Za-z0-9_$]+\s*=\s*[^;,]+/g) || [];
console.log('Assets props:', assetRoot);

// Check Thread.absolutePath or Thread worker creation
const workerMatches = appJs.match(/new Worker\([^)]+\)/g) || [];
console.log('Workers:', workerMatches);
