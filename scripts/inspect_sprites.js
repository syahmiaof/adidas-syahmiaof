const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find all occurrences of sprites
const spriteMatches = appJs.match(/assets\/images\/sprites\/[^'"`]+/g) || [];
console.log('Sprite occurrences:', Array.from(new Set(spriteMatches)));

// Find references to sprite IDs or how sprites are loaded
const spriteClass = appJs.split('Sprite').slice(1, 10);
spriteClass.forEach((sc, i) => {
  console.log(`\nSprite snippet ${i}:`, sc.slice(0, 150));
});
