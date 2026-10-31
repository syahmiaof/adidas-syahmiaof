const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

let pos = 0;
while (true) {
  const idx = appJs.indexOf('assets/images/icons/', pos);
  if (idx === -1) break;
  console.log('Match at', idx, ':', appJs.slice(idx, idx + 80));
  pos = idx + 1;
}
