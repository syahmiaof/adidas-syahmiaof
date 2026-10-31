const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const regex = /initClass\s*\(\s*ProductBlock/g;
let m;
while ((m = regex.exec(appJs)) !== null) {
  console.log('initClass(ProductBlock match at', m.index, ':', appJs.slice(m.index - 100, m.index + 200));
}
// Or check where ProductBlock is referenced:
const regex2 = /\bProductBlock\b/g;
while ((m = regex2.exec(appJs)) !== null) {
  console.log('Regex2 match at', m.index, ':', appJs.slice(m.index - 50, m.index + 100));
}
