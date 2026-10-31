const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const regex = /perma\s*:\s*["']([^"']+)["']/g;
let m;
const permas = new Set();
while ((m = regex.exec(appJs)) !== null) {
  permas.add(m[1]);
}
console.log('perma matches:', Array.from(permas));

// Also let's check World / products setup
const worldMatches = appJs.match(/world[123]/gi) || [];
console.log('world count:', worldMatches.length);

// Also let's check icons ${name}
const iconMatches = appJs.match(/icons\/\$\{[^}]+\}[^'"`]*/g) || [];
console.log('icon patterns:', Array.from(new Set(iconMatches)));

// Check what icons ${name} are:
const nameRegex = /assets\/images\/icons\/["']?\s*\+\s*([^+'"]+)/g;
console.log('Looking for icon names:');
const lines = appJs.split(';');
lines.filter(l => l.includes('assets/images/icons')).forEach(l => {
  console.log(' -> icon line:', l.trim().slice(0, 150));
});
