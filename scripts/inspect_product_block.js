const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

let pos = 0;
while (true) {
  const idx = appJs.indexOf('ProductBlock', pos);
  if (idx === -1) break;
  console.log('ProductBlock at', idx, ':', appJs.slice(idx - 30, idx + 100));
  pos = idx + 1;
}
