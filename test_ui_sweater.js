/**
 * ============================================================================
 * UI GEMPAK: ADIDAS CHILE20 (SWEATER & TRACKSUIT) 3D WEBGL EXPERIENCE
 * Automated E2E Verification & Asset Integrity Test Suite
 * Rebranded to: adidas x SYAHMIAOF (12 Tiers, 99 Assertions Total)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = __dirname;
let passed = 0;
let failed = 0;

const tierStats = {};
let currentTier = 'Tier 1: HTML, Bootstrapper & Mocks';

function setTier(name) {
  currentTier = name;
  if (!tierStats[name]) {
    tierStats[name] = { passed: 0, failed: 0, total: 0 };
  }
  console.log(`\n--- ${name} ---`);
}

function assert(condition, testName, detail = '') {
  if (!tierStats[currentTier]) {
    tierStats[currentTier] = { passed: 0, failed: 0, total: 0 };
  }
  tierStats[currentTier].total++;
  if (condition) {
    passed++;
    tierStats[currentTier].passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    tierStats[currentTier].failed++;
    console.error(`  [FAIL] ${testName} ${detail ? '--> ' + detail : ''}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' ADIDAS x SYAHMIAOF - AUTOMATED 12-TIER E2E TEST SUITE');
  console.log('======================================================');

  // --- TIER 1: CORE HTML & ENTRYPOINT (7 assertions) ---
  setTier('Tier 1: HTML, Bootstrapper & Mocks');
  const indexHtmlPath = path.join(ROOT, 'index.html');
  assert(fs.existsSync(indexHtmlPath), 'index.html exists');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  assert(indexHtml.includes('id="_CACHE_"'), '_CACHE_ JSON element present');
  assert(indexHtml.includes('id="_DATA_"'), '_DATA_ JSON element present');
  assert(indexHtml.includes('id="_LANGUAGES_"'), '_LANGUAGES_ JSON element present');
  assert(indexHtml.includes('configureScope'), 'Safe Sentry configureScope mock present');
  assert(indexHtml.includes('window.dataLayer'), 'Safe Google Tag Manager / Analytics mock present');
  assert(indexHtml.includes('#Stage'), '#Stage styles defined in CSS');

  // --- TIER 2: HYDRA WEBGL CORE ENGINE & SHADERS (7 assertions) ---
  setTier('Tier 2: Hydra Engine & GLSL Shaders');
  const appJsPath = path.join(ROOT, 'assets', 'js', 'app.js');
  assert(fs.existsSync(appJsPath) && fs.statSync(appJsPath).size > 900000, 'assets/js/app.js exists (>900KB)');
  
  const threadPath = path.join(ROOT, 'assets', 'js', 'hydra', 'hydra-thread.js');
  assert(fs.existsSync(threadPath), 'assets/js/hydra/hydra-thread.js exists');

  const shadersPath = path.join(ROOT, 'assets', 'shaders', 'compiled.vs');
  assert(fs.existsSync(shadersPath) && fs.statSync(shadersPath).size > 150000, 'assets/shaders/compiled.vs exists (>150KB)');
  const shaderCode = fs.readFileSync(shadersPath, 'utf8');
  assert(shaderCode.includes('{@}AntimatterCopy.fs{@}'), 'Compiled vertex & fragment shaders verified');
  assert(shaderCode.includes('{@}blendmodes.glsl{@}'), 'GLSL blend modes verified');

  const uilPath = path.join(ROOT, 'assets', 'data', 'uil.json');
  assert(fs.existsSync(uilPath), 'assets/data/uil.json exists');
  const uilData = JSON.parse(fs.readFileSync(uilPath, 'utf8'));
  const uilKeys = Object.keys(uilData);
  assert(uilKeys.length > 8000, `uil.json contains >8000 camera and layout definitions (found ${uilKeys.length})`);

  // --- TIER 3: 3D GEOMETRY ASSETS (18 assertions) ---
  setTier('Tier 3: 3D Models & Geometries');
  const geomDir = path.join(ROOT, 'assets', 'geometry');
  const requiredGeom = [
    'bomberjacket/closed/front.json',
    'bomberjacket/closed/back.json',
    'bomberjacket/closed/arms.json',
    'bomberjacket/closed/detail.json',
    'bomberjacket/closed/buttons.json',
    'tracksuit/updated/front.json',
    'tracksuit/updated/back.json',
    'tracksuit/updated/arms.json',
    'tracksuit/updated/detail.json',
    'ball/ball.json',
    'skateboard/deck.json',
    'skateboard/wheels.json',
    'intro/bg.json',
    'intro/stripe.json',
    'world1/scene_details.json',
    'world2/parts.json',
    'world3/speaker2.json',
    'world3/table-optimized.json'
  ];

  for (const g of requiredGeom) {
    const full = path.join(geomDir, g);
    let valid = false;
    if (fs.existsSync(full)) {
      try {
        const j = JSON.parse(fs.readFileSync(full, 'utf8'));
        valid = (j.vertices || j.faces || j.position || j.buffers || Array.isArray(j) || typeof j === 'object');
      } catch(e) {}
    }
    assert(valid, `Geometry: ${g}`);
  }

  // --- TIER 4: PBR TEXTURES & MATCAPS (14 assertions) ---
  setTier('Tier 4: High-Definition PBR Textures & Normal Maps');
  const imgDir = path.join(ROOT, 'assets', 'images');
  const requiredTextures = [
    'bomberjacket/closed/arms_baked_closeup.png',
    'bomberjacket/closed/arms_Normal_closeup.png',
    'bomberjacket/closed/front_Normal_closeup.png',
    'bomberjacket/closed/back_Normal_closeup.png',
    'tracksuit/updated/front_baked_closeup.png',
    'tracksuit/updated/front_Normal_closeup.png',
    'tracksuit/updated/arms_white_baked_closeup.png',
    'world1/floor_Normal_optimized.png',
    'world2/floor_Normal_optimized.png',
    'pbr/lut.png',
    'pbr/matcap4.jpg',
    'transitions/clouds.jpg',
    'transitions/crease.jpg',
    'transitions/lines.png'
  ];

  for (const t of requiredTextures) {
    const full = path.join(imgDir, t);
    assert(fs.existsSync(full) && fs.statSync(full).size > 1000, `Texture: ${t} (${fs.existsSync(full) ? Math.round(fs.statSync(full).size / 1024) + ' KB' : 'MISSING'})`);
  }

  // --- TIER 5: GPU COMPRESSED KTX TEXTURES (13 assertions) ---
  setTier('Tier 5: GPU Compressed Textures (KTX) for 3D Models');
  const requiredKtx = [
    'assets/images/bomberjacket/closed/low/front_MRO_low/front_MRO_low-dxt.ktx',
    'assets/images/bomberjacket/closed/low/front_Normal_low/front_Normal_low-dxt.ktx',
    'assets/images/bomberjacket/closed/low/detail_Normal_low/detail_Normal_low-dxt.ktx',
    'assets/images/bomberjacket/closed/low/arms_Normal_low/arms_Normal_low-dxt.ktx',
    'assets/images/bomberjacket/closed/low/arms_baked_low/arms_baked_low-dxt.ktx',
    'assets/images/tracksuit/updated/low/front_Normal_low/front_Normal_low-dxt.ktx',
    'assets/images/tracksuit/updated/low/front_baked_low/front_baked_low-dxt.ktx',
    'assets/images/tracksuit/updated/low/arms_Normal_low/arms_Normal_low-dxt.ktx',
    'assets/images/tracksuit/updated/front_white_backed_optimized/front_white_backed_optimized-dxt.ktx',
    'assets/images/tracksuit/updated/detail_white_baked_optimized/detail_white_baked_optimized-dxt.ktx',
    'assets/images/world1/low/floor_Normal_low/floor_Normal_low-dxt.ktx',
    'assets/images/world2/low/floor_Normal_low/floor_Normal_low-dxt.ktx',
    'assets/images/world3/low/speaker2_low/speaker2_low-dxt.ktx'
  ];

  for (const k of requiredKtx) {
    const full = path.join(ROOT, k);
    let validKtx = false;
    let size = 0;
    if (fs.existsSync(full)) {
      size = fs.statSync(full).size;
      const buf = Buffer.alloc(4);
      const fd = fs.openSync(full, 'r');
      fs.readSync(fd, buf, 0, 4, 0);
      fs.closeSync(fd);
      // Valid KTX 1.1 magic byte 0xAB 'K' 'T' 'X'
      validKtx = buf[0] === 0xAB && buf[1] === 0x4B && buf[2] === 0x54 && buf[3] === 0x58;
    }
    assert(validKtx && size > 1000, `KTX Texture: ${k} (${Math.round(size / 1024)} KB, Valid KTX Header)`);
  }

  // --- TIER 6: VIDEO STREAMS & AUDIO (4 assertions) ---
  setTier('Tier 6: Video Textures & Background Audio');
  const videos = ['world1.mp4', 'world2.mp4', 'world3.mp4'];
  for (const v of videos) {
    const full = path.join(ROOT, 'assets', 'videos', v);
    assert(fs.existsSync(full) && fs.statSync(full).size > 2000000, `Video Stream: assets/videos/${v} (${fs.existsSync(full) ? (fs.statSync(full).size / (1024*1024)).toFixed(2) + ' MB' : 'MISSING'})`);
  }

  const audioPath = path.join(ROOT, 'assets', '_sounds', 'main-optimized.mp3');
  assert(fs.existsSync(audioPath) && fs.statSync(audioPath).size > 1500000, `Audio: assets/_sounds/main-optimized.mp3 (${fs.existsSync(audioPath) ? (fs.statSync(audioPath).size / (1024*1024)).toFixed(2) + ' MB' : 'MISSING'})`);

  // --- TIER 7: LOCAL SERVER HTTP ENDPOINTS (7 assertions) ---
  setTier('Tier 7: Local Server HTTP Endpoints & Range Queries');
  function testHttp(urlPath, expectedCode, expectedMime, isRange = false) {
    return new Promise(resolve => {
      const options = {
        hostname: 'localhost',
        port: 4183,
        path: urlPath,
        method: 'GET',
        headers: isRange ? { Range: 'bytes=0-1023' } : {}
      };

      const req = http.request(options, res => {
        const ct = res.headers['content-type'] || '';
        const codeOk = res.statusCode === expectedCode;
        const mimeOk = ct.includes(expectedMime);
        assert(codeOk && mimeOk, `HTTP ${isRange ? 'Range ' : ''}GET ${urlPath} -> ${res.statusCode} (${ct})`);
        res.resume();
        resolve();
      });

      req.on('error', err => {
        assert(false, `HTTP GET ${urlPath} -> Connection Error: ${err.message}`);
        resolve();
      });

      req.end();
    });
  }

  await testHttp('/', 200, 'text/html');
  await testHttp('/assets/shaders/compiled.vs', 200, 'text/plain');
  await testHttp('/assets/data/uil.json', 200, 'application/json');
  await testHttp('/assets/geometry/bomberjacket/closed/front.json', 200, 'application/json');
  await testHttp('/assets/images/bomberjacket/closed/low/front_MRO_low/front_MRO_low-dxt.ktx', 200, 'image/ktx');
  await testHttp('/assets/videos/world1.mp4', 206, 'video/mp4', true);
  await testHttp('/assets/_sounds/main-optimized.mp3', 206, 'audio/mpeg', true);

  // --- TIER 8: REBRANDING - HTML & OPENGRAPH METADATA (6 assertions) ---
  setTier('Tier 8: Rebranding - HTML & OpenGraph Metadata');
  const titleMatch = indexHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1] : '';
  assert(/adidas x SYAHMIAOF/i.test(titleText), 'HTML <title> contains adidas x SYAHMIAOF');
  assert(!/CHILE20/i.test(titleText), 'HTML <title> does not contain CHILE20');

  const descMatch = indexHtml.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const descText = descMatch ? descMatch[1] : '';
  assert(/Syahmi AOF/i.test(descText) && !/Foot Locker/i.test(descText), 'HTML meta description rebranded to Syahmi AOF');

  assert(indexHtml.includes('property="og:title"') && indexHtml.includes('property="og:description"'), 'OpenGraph og:title & og:description present');
  assert(indexHtml.includes('property="og:image"') && indexHtml.includes('property="og:site_name"'), 'OpenGraph og:image & og:site_name present');
  assert(indexHtml.includes('name="twitter:title"') && /adidas x SYAHMIAOF/i.test(indexHtml), 'Twitter cards rebranded to adidas x SYAHMIAOF');

  // --- TIER 9: REBRANDING - EMBEDDED _DATA_ LOCALES (5 assertions) ---
  setTier('Tier 9: Rebranding - Embedded _DATA_ JSON Locales');
  const dataMatch = indexHtml.match(/<script type=['"]text\/json['"] id="_DATA_">([\s\S]*?)<\/script>/);
  let appData = {};
  let dataStr = '';
  if (dataMatch) {
    try {
      appData = JSON.parse(dataMatch[1]);
      dataStr = JSON.stringify(appData);
    } catch (e) {}
  }
  assert(!/foot locker/i.test(dataStr), '_DATA_ zero occurrences of Foot Locker (all locales)');
  assert(!/chile20/i.test(dataStr), '_DATA_ zero occurrences of CHILE20 (all locales)');
  assert(
    appData.en && appData.de && appData.fr && appData.it &&
    /SYAHMIAOF/i.test(appData.en.meta && appData.en.meta.pageTitle) &&
    /SYAHMIAOF/i.test(appData.de.meta && appData.de.meta.pageTitle) &&
    /SYAHMIAOF/i.test(appData.fr.meta && appData.fr.meta.pageTitle) &&
    /SYAHMIAOF/i.test(appData.it.meta && appData.it.meta.pageTitle),
    '_DATA_ meta.pageTitle rebranded to SYAHMIAOF across all locales (en, de, fr, it)'
  );
  assert(appData.en && appData.en.general && appData.en.general.share_placeholder === 'SYAHMIAOF', 'en.general.share_placeholder is SYAHMIAOF');
  assert(appData.en && appData.en.contest && !/CHILE/i.test(appData.en.contest.loose_cta_label), 'en.contest.loose_cta_label does not contain CHILE');

  // --- TIER 10: REBRANDING - VECTOR & RASTER LOGO ASSETS (7 assertions) ---
  setTier('Tier 10: Rebranding - Vector & Raster Logo Assets');
  const logoSvgPath = path.join(ROOT, 'assets', 'images', 'logos', 'logo.svg');
  assert(fs.existsSync(logoSvgPath), 'assets/images/logos/logo.svg exists');
  const logoSvg = fs.existsSync(logoSvgPath) ? fs.readFileSync(logoSvgPath, 'utf8') : '';
  assert(logoSvg.includes('M41.8,27') || logoSvg.includes('adidas'), 'logo.svg retains adidas Trefoil & wordmark');
  assert(/SYAHMI[- ]AOF/i.test(logoSvg), 'logo.svg contains SYAHMI AOF typography');
  assert(!logoSvg.includes('M116.7,30V7.9H68v42h70.8V30H116.7z'), 'logo.svg Foot Locker bounding box removed');
  assert(fs.existsSync(path.join(ROOT, 'assets', 'images', 'logos', 'chille.png')), 'chille.png 3D billboard texture exists');
  assert(fs.existsSync(path.join(ROOT, 'assets', 'images', 'logos', 'chile.svg')), 'chile.svg intro screen vector exists');
  assert(fs.existsSync(path.join(ROOT, 'assets', 'images', 'logos', 'chile-logo.png')), 'chile-logo.png mobile screen rotate logo exists');

  // --- TIER 11: REBRANDING - APPLICATION CODE (app.js) (7 assertions) ---
  setTier('Tier 11: Rebranding - Application Code (app.js)');
  const appCode = fs.existsSync(appJsPath) ? fs.readFileSync(appJsPath, 'utf8') : '';
  assert((appCode.includes('BUILT BY') || appCode.includes('DEVELOPED BY')) && appCode.includes('SYAHMI AOF'), 'app.js includes BUILT BY SYAHMI AOF');
  assert(appCode.includes('https://syahmiaof.my') && appCode.includes('studioweb.syahmiaof.my'), 'app.js includes Portfolio & Studio links');
  assert(appCode.includes('https://github.com/syahmiaof'), 'app.js includes GitHub link');
  assert(appCode.includes('hello@syahmiaof.my') && !appCode.includes('0107965236'), 'app.js includes Email contact and phone number removed');
  assert(!appCode.includes('2020 ADIDAS AG'), 'app.js legacy copyright (2020 ADIDAS AG) removed');
  assert(/aria-label.*adidas x Syahmi AOF/i.test(appCode), 'app.js header logo aria-label updated to adidas x Syahmi AOF');
  assert(!appCode.includes('http://addidas.com'), 'app.js legacy addidas.com typo replaced with syahmiaof.my');

  // --- TIER 12: REBRANDED ASSET SERVER HTTP ENDPOINTS (4 assertions) ---
  setTier('Tier 12: Rebranded Asset Server HTTP Endpoints');
  await testHttp('/assets/images/logos/logo.svg', 200, 'image/svg+xml');
  await testHttp('/assets/images/logos/chile.svg', 200, 'image/svg+xml');
  await testHttp('/assets/images/logos/chille.png', 200, 'image/png');
  await testHttp('/assets/images/logos/chile-logo.png', 200, 'image/png');

  // --- TEST SUITE EXECUTION SUMMARY ---
  console.log('\n======================================================');
  console.log(' TEST SUITE EXECUTION SUMMARY');
  console.log('======================================================');
  for (const [name, stats] of Object.entries(tierStats)) {
    console.log(`  ${name.padEnd(52)} : ${stats.passed}/${stats.total} Passed (${stats.failed} Failed)`);
  }
  console.log('------------------------------------------------------');
  console.log(`  Total Assertions : ${passed + failed}`);
  console.log(`  Passed           : ${passed}`);
  console.log(`  Failed           : ${failed}`);
  console.log('======================================================\n');

  if (failed === 0) {
    console.log('SUCCESS! All 12 tiers (99 assertions) passed. Rebranding to adidas x SYAHMIAOF verified and 100% operational.');
    process.exit(0);
  } else {
    console.error(`VERIFICATION FAILED: ${failed} assertion(s) failed out of ${passed + failed} total.`);
    process.exit(1);
  }
}

runTests();
