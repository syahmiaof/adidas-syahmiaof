const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const idx = appJs.indexOf('ProductImg');
console.log('Class definition around ProductImg:');
console.log(appJs.slice(idx - 2500, idx - 1500));
