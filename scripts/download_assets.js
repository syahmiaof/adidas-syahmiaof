const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const rawAssets = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_assets_to_check.json'), 'utf8'));

// Filter out bare directories or items without an extension
const assets = rawAssets.filter(p => {
  const parts = p.split('/');
  const last = parts[parts.length - 1];
  return last.includes('.') && !last.endsWith('.') && !last.startsWith('.');
});

console.log(`Starting download check for ${assets.length} valid file candidates...`);

const BASE_URL = 'https://adidaschile20.com';
const OUT_DIR = __dirname;

let completed = 0;
let successCount = 0;
let failCount = 0;
const results = {
  success: [],
  failed: []
};

function downloadFile(relPath) {
  return new Promise(resolve => {
    let cleanPath = relPath.startsWith('/') ? relPath.slice(1) : relPath;
    cleanPath = cleanPath.split('?')[0].split('#')[0];
    
    const localFile = path.join(OUT_DIR, cleanPath);
    const localDir = path.dirname(localFile);

    if (fs.existsSync(localFile) && fs.statSync(localFile).size > 0) {
      // Check if it's accidentally an html file masquerading as asset
      if (!cleanPath.endsWith('.html') && fs.statSync(localFile).size === 40148) {
        fs.unlinkSync(localFile);
      } else {
        successCount++;
        completed++;
        results.success.push({ path: cleanPath, size: fs.statSync(localFile).size, status: 'cached' });
        return resolve();
      }
    }

    const url = `${BASE_URL}/${cleanPath}`;
    
    const req = https.get(url, { headers: { 'Accept-Encoding': 'gzip, deflate, br', 'User-Agent': 'Mozilla/5.0' } }, res => {
      const ct = res.headers['content-type'] || '';
      
      // If server returns HTML for non-HTML file, it is an SPA 404 rewrite!
      if (!cleanPath.endsWith('.html') && ct.includes('text/html')) {
        failCount++;
        completed++;
        results.failed.push({ path: cleanPath, reason: 'SPA 404 Fallback (returned HTML)' });
        if (completed % 25 === 0 || completed === assets.length) {
          console.log(`Progress: ${completed}/${assets.length} (OK: ${successCount}, Fail: ${failCount})`);
        }
        res.resume();
        return resolve();
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        fs.mkdirSync(localDir, { recursive: true });
        
        let stream = res;
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        const chunks = [];
        stream.on('data', c => chunks.push(c));
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          // Safety check: is it 40148 bytes html?
          if (!cleanPath.endsWith('.html') && buffer.length === 40148 && buffer.toString('utf8', 0, 15).includes('<!DOCTYPE html>')) {
            failCount++;
            completed++;
            results.failed.push({ path: cleanPath, reason: 'SPA 404 Fallback HTML' });
            return resolve();
          }

          fs.writeFileSync(localFile, buffer);
          successCount++;
          completed++;
          results.success.push({ path: cleanPath, size: buffer.length, status: 'downloaded' });
          if (completed % 25 === 0 || completed === assets.length) {
            console.log(`Progress: ${completed}/${assets.length} (OK: ${successCount}, Fail: ${failCount})`);
          }
          resolve();
        });
        stream.on('error', err => {
          failCount++;
          completed++;
          results.failed.push({ path: cleanPath, error: err.message });
          resolve();
        });
      } else {
        failCount++;
        completed++;
        results.failed.push({ path: cleanPath, status: res.statusCode });
        if (completed % 25 === 0 || completed === assets.length) {
          console.log(`Progress: ${completed}/${assets.length} (OK: ${successCount}, Fail: ${failCount})`);
        }
        res.resume();
        resolve();
      }
    });

    req.on('error', err => {
      failCount++;
      completed++;
      results.failed.push({ path: cleanPath, error: err.message });
      resolve();
    });

    req.setTimeout(15000, () => {
      req.destroy();
      failCount++;
      completed++;
      results.failed.push({ path: cleanPath, error: 'timeout' });
      resolve();
    });
  });
}

async function run() {
  const CONCURRENCY = 10;
  const queue = [...assets];
  
  const workers = Array(CONCURRENCY).fill(0).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) {
        await downloadFile(item);
      }
    }
  });

  await Promise.all(workers);

  console.log(`\nDownload finished!`);
  console.log(`Total checked: ${assets.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed (404/SPA): ${failCount}`);

  fs.writeFileSync(path.join(OUT_DIR, 'download_results.json'), JSON.stringify(results, null, 2));
}

run();
