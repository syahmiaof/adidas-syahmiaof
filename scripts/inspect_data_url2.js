const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const idx = appJs.indexOf('DATA_URL=window._DATA_URL_');
console.log('DATA_URL context:');
console.log(appJs.slice(idx - 100, idx + 200));

const idx2 = appJs.indexOf('new Worker(Thread.PATH+file)');
console.log('Worker context:');
console.log(appJs.slice(idx2 - 100, idx2 + 200));
