const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const idx = appJs.indexOf('assets/images/icons/');
if (idx !== -1) {
  console.log('Context around icons/:');
  console.log(appJs.slice(idx - 200, idx + 400));
}

const idx2 = appJs.indexOf('assets/images/products/');
if (idx2 !== -1) {
  console.log('\nContext around products/:');
  console.log(appJs.slice(idx2 - 400, idx2 + 200));
}
