const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const regex = /SocialButton[,\s]*\[?["']([^"']+)["']/g;
let m;
while ((m = regex.exec(appJs)) !== null) {
  console.log('SocialButton match:', m[1]);
}

// Or search for all occurrences of SocialButton
let pos = 0;
while (true) {
  const idx = appJs.indexOf('SocialButton', pos);
  if (idx === -1) break;
  console.log('SocialButton at', idx, ':', appJs.slice(idx - 30, idx + 80));
  pos = idx + 1;
}
