const fs = require('fs');
const path = require('path');
const https = require('https');

const videos = [
  'assets/videos/world1.mp4',
  'assets/videos/world2.mp4',
  'assets/videos/world3.mp4'
];

const outDir = path.join(__dirname, 'assets', 'videos');
fs.mkdirSync(outDir, { recursive: true });

async function download(rel) {
  const dest = path.join(__dirname, rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log('Already downloaded:', rel, fs.statSync(dest).size);
    return;
  }
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get('https://adidaschile20.com/' + rel, res => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Downloaded:', rel, fs.statSync(dest).size, 'bytes');
          resolve();
        });
      });
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  for (const v of videos) {
    await download(v);
  }
  console.log('All videos downloaded!');
})();
