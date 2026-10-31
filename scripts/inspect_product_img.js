const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find ProductImg or class containing ProductImg
const idx = appJs.indexOf('ProductImg');
console.log('ProductImg context:');
console.log(appJs.slice(idx - 600, idx + 400));
