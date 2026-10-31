const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find the Class((function Social... or similar
const before = appJs.slice(838000, 838700);
console.log('Class name before:', before);
