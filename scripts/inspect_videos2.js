const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const idx = appJs.indexOf('assets/videos/${_perma}.mp4');
console.log('Video context:');
console.log(appJs.slice(idx - 400, idx + 200));
