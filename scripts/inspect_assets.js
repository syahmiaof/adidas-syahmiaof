const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Find all fetch/load calls
console.log('--- Analyzing AssetLoader and Assets calls ---');
const fetchRegex = /(?:fetch|get|load|Assets\.getPath|Thread\.load|GeomThread\.loadGeometry)\s*\(\s*([^)]+)\)/g;
let m;
const dynamicAssets = new Set();
while ((m = fetchRegex.exec(appJs)) !== null) {
  const call = m[0];
  if (call.includes('assets/') || call.includes('.json') || call.includes('.png') || call.includes('.jpg') || call.includes('.mp3')) {
    dynamicAssets.add(call.trim());
  }
}
console.log('Dynamic asset calls found:', dynamicAssets.size);
for (const item of Array.from(dynamicAssets).slice(0, 40)) {
  console.log('  ', item);
}

// Let's also check all geometry paths
console.log('\n--- Checking all Geometry in app.js and uil.json ---');
const uil = JSON.parse(fs.readFileSync(path.join(__dirname, 'uil.json'), 'utf8'));

const geometryFiles = new Set();
function findGeom(obj) {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (obj.includes('geometry') || obj.endsWith('.json')) {
      if (!obj.startsWith('{') && !obj.includes('figma') && !obj.includes('arealights') && obj !== '.json' && obj !== 'uil.json' && obj !== 'uil-partial.json') {
        geometryFiles.add(obj);
      }
    }
  } else if (typeof obj === 'object') {
    for (let k in obj) {
      if (k === 'geometry' && typeof obj[k] === 'string') {
        geometryFiles.add(obj[k]);
      }
      findGeom(obj[k]);
    }
  }
}
findGeom(uil);
console.log('Geometry candidates in uil.json:', geometryFiles.size);
console.log(Array.from(geometryFiles).sort());
