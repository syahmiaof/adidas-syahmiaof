const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find Class definitions: Class((function ClassName() { ... }))
const classRegex = /Class\(\(function\s+([A-Za-z0-9_$]+)\s*\(/g;
const classes = [];
let m;
while ((m = classRegex.exec(code)) !== null) {
  classes.push(m[1]);
}

console.log('Total Classes declared:', classes.length);
console.log('Class list:', classes);

// Also look for Global / Singleton / Controller / View
const controllers = classes.filter(c => c.toLowerCase().includes('controller') || c.toLowerCase().includes('view') || c.toLowerCase().includes('stage') || c.toLowerCase().includes('scene') || c.toLowerCase().includes('world'));
console.log('\nKey Controllers / Views / Worlds:', controllers);
