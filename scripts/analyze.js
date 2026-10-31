const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

console.log('App code length:', code.length);

// 1. Detect libraries & frameworks
const indicators = [
  'THREE', 'Three.js', 'WebGLRenderer', 'PerspectiveCamera',
  'GSAP', 'TweenMax', 'TweenLite', 'TimelineMax',
  'Pixi', 'PIXI',
  'Howl', 'Howler',
  'Cannon', 'CANNON', 'Ammo', 'Oimo',
  'OrbitControls', 'GLTFLoader', 'DRACOLoader',
  'Vue', 'React', 'Angular', 'Svelte',
  'PostProcessing', 'EffectComposer',
  'ShaderMaterial', 'RawShaderMaterial',
  'createProgram', 'compileShader'
];

console.log('\n--- Frameworks / Libraries Found ---');
for (const ind of indicators) {
  const count = (code.match(new RegExp('\\b' + ind + '\\b', 'g')) || []).length;
  if (count > 0) {
    console.log(`- ${ind}: ${count} occurrences`);
  }
}

// 2. Find asset strings
const assetRegex = /['"`]([^'"`]*?\.(?:png|jpg|jpeg|webp|glb|gltf|bin|json|mp3|wav|ogg|hdr|ktx2|basis|woff2?|svg|obj|fbx|drc))['"`]/gi;
const matches = new Set();
let m;
while ((m = assetRegex.exec(code)) !== null) {
  matches.add(m[1]);
}

console.log('\n--- Assets Found (' + matches.size + ' unique) ---');
console.log(Array.from(matches).sort());

// 3. Find URL endpoints or paths starting with assets/ or storage
const pathRegex = /['"`]((?:assets\/|https?:\/\/storage\.googleapis\.com\/|https?:\/\/[^'"`]+\/)[^'"`]+)['"`]/gi;
const paths = new Set();
while ((m = pathRegex.exec(code)) !== null) {
  paths.add(m[1]);
}

console.log('\n--- Paths / URLs Found (' + paths.size + ' unique) ---');
console.log(Array.from(paths).filter(p => !p.includes('sentry') && !p.includes('google')).slice(0, 50));
