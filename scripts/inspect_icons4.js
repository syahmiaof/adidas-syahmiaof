const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

console.log('Class declaration before 839831:');
console.log(appJs.slice(838500, 839500));
