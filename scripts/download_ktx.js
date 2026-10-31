const fs = require('fs');
const path = require('path');
const https = require('https');

// Extract all compressed image definitions from uil.json!
const ROOT = path.resolve(__dirname, '..');
const uil = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'uil.json'), 'utf8'));

const ktxCandidates = new Set();
const exts = ['dxt', 'astc', 'etc'];

function walk(obj) {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (obj.startsWith('{') && obj.includes('"compressed":true')) {
      try {
        const parsed = JSON.parse(obj);
        if (parsed.src && parsed.compressed) {
          // e.g. src: "assets/images/bomberjacket/closed/low/front_MRO_low.png"
          // In app.js:
          // let fileName = data.path.split("/");
          // fileName = fileName[fileName.length-1];
          // `${data.path}/${fileName}-${ext}.ktx`
          let p = parsed.src.replace(/\.(png|jpg|jpeg)$/, '');
          let fn = p.split('/').pop();
          for (const ext of exts) {
            ktxCandidates.add(`${p}/${fn}-${ext}.ktx`);
          }
        }
      } catch(e) {}
    }
  } else if (typeof obj === 'object') {
    for (let k in obj) {
      walk(obj[k]);
    }
  }
}

walk(uil);
console.log('Total KTX candidates extracted from uil.json:', ktxCandidates.size);

// Save list
const ktxList = Array.from(ktxCandidates).sort();
fs.writeFileSync(path.join(__dirname, 'ktx_candidates.json'), JSON.stringify(ktxList, null, 2));

// Concurrency download
const BASE_URL = 'https://adidaschile20.com';
const OUT_DIR = ROOT;

let downloaded = 0;
let skipped = 0;
let failed = 0;

function downloadFile(relPath) {
  return new Promise(resolve => {
    const localFile = path.join(OUT_DIR, relPath);
    const localDir = path.dirname(localFile);

    if (fs.existsSync(localFile) && fs.statSync(localFile).size > 100) {
      skipped++;
      return resolve();
    }

    const url = `${BASE_URL}/${relPath}`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      const ct = res.headers['content-type'] || '';
      if (res.statusCode === 200 && !ct.includes('html')) {
        fs.mkdirSync(localDir, { recursive: true });
        const file = fs.createWriteStream(localFile);
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            downloaded++;
            console.log(`[DOWNLOADED] ${relPath} (${fs.statSync(localFile).size} bytes)`);
            resolve();
          });
        });
      } else {
        failed++;
        res.resume();
        resolve();
      }
    });

    req.on('error', err => {
      failed++;
      resolve();
    });

    req.setTimeout(10000, () => {
      req.destroy();
      failed++;
      resolve();
    });
  });
}

async function run() {
  const queue = [...ktxList];
  const CONCURRENCY = 8;
  const workers = Array(CONCURRENCY).fill(0).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) await downloadFile(item);
    }
  });

  await Promise.all(workers);
  console.log(`\nKTX Download finished! Downloaded: ${downloaded}, Skipped: ${skipped}, 404/Failed: ${failed}`);
}

run();
