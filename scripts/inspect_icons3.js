const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

console.log('Match 839831 context:');
console.log(appJs.slice(839500, 840200));

console.log('\nMatch 842188 context:');
console.log(appJs.slice(841800, 842600));
