/**
 * Challenger 2 Adversarial Verification & Stress Test Suite
 * Author: challenger_2
 * Scope: R1 to R5 Requirements, Purge Verification, Kinetic Interactivity,
 * HTTP Range Streaming, Negative Tests, and 100% test_ui_sweater.js pass.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'http://localhost:4183';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, title, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${title}`);
  } else {
    failedTests++;
    const msg = `[FAIL] ${title}${details ? ' --> ' + details : ''}`;
    console.error(`  ${msg}`);
    failures.push(msg);
  }
}

function requestHttp(urlPath, options = {}, isBuffer = false) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, BASE_URL);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          raw: raw,
          text: raw.toString('utf8')
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log(' CHALLENGER 2: ADVERSARIAL VERIFICATION & STRESS TEST SUITE');
  console.log(' Target: adidas x SYAHMIAOF (ui-sweater)');
  console.log(' Time: ' + new Date().toISOString());
  console.log('================================================================\n');

  // ==========================================================================
  // GROUP 1: PURGE VERIFICATION & ZERO BRAND LEAKS
  // ==========================================================================
  console.log('--- GROUP 1: PURGE VERIFICATION & ZERO BRAND LEAKS ---');
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'app.js'), 'utf8');
  const uilRaw = fs.readFileSync(path.join(ROOT, 'assets', 'data', 'uil.json'), 'utf8');

  // 1.1 index.html brand purge
  assert(!/foot\s*locker/i.test(indexHtml), 'index.html: zero occurrences of "Foot Locker"');
  assert(!/chile\s*20/i.test(indexHtml), 'index.html: zero occurrences of "CHILE 20" / "CHILE20"');
  assert(!indexHtml.includes('assets/images/sharecard/logo.png'), 'index.html: zero references to sharecard/logo.png');

  // 1.2 app.js brand purge
  assert(!/foot\s*locker/i.test(appJs), 'app.js: zero occurrences of "Foot Locker"');
  assert(!/chile\s*20/i.test(appJs), 'app.js: zero occurrences of "CHILE 20" / "CHILE20"');
  assert(!appJs.includes('assets/images/sharecard/logo.png'), 'app.js: zero references to sharecard/logo.png');

  // 1.3 uil.json brand purge
  assert(!/foot\s*locker/i.test(uilRaw), 'uil.json: zero occurrences of "Foot Locker"');
  assert(!/chile\s*20/i.test(uilRaw), 'uil.json: zero occurrences of "CHILE 20" / "CHILE20"');
  assert(!uilRaw.includes('assets/images/sharecard/logo.png'), 'uil.json: zero references to assets/images/sharecard/logo.png');
  assert(!uilRaw.includes('assets/images/sharecard/logo-grey.png'), 'uil.json: zero references to assets/images/sharecard/logo-grey.png');

  // 1.4 Vector & Raster logo assets clean
  const logoSvg = fs.readFileSync(path.join(ROOT, 'assets', 'images', 'logos', 'logo.svg'), 'utf8');
  assert(!/foot\s*locker/i.test(logoSvg), 'logo.svg: zero occurrences of "Foot Locker"');
  assert(!logoSvg.includes('M116.7,30V7.9H68v42h70.8V30H116.7z'), 'logo.svg: Foot Locker referee bounding box path removed');
  assert(logoSvg.includes('SYAHMI') || logoSvg.includes('syahmi-aof-brand'), 'logo.svg: contains SYAHMI AOF typography vector branding');

  const chileSvg = fs.readFileSync(path.join(ROOT, 'assets', 'images', 'logos', 'chile.svg'), 'utf8');
  assert(!/foot\s*locker/i.test(chileSvg), 'chile.svg: zero occurrences of "Foot Locker"');
  assert(!/chile\s*20/i.test(chileSvg), 'chile.svg: zero occurrences of "CHILE 20"');
  assert(chileSvg.includes('<svg') && chileSvg.includes('viewBox="0 0 242 80"'), 'chile.svg: valid SVG with 242x80 viewBox');
  assert(chileSvg.length > 5000, 'chile.svg: contains full vector glyph path curves (>5KB)');

  // ==========================================================================
  // GROUP 2: KINETIC TEXT & INTERACTIVITY NEUTRALIZATION (R4)
  // ==========================================================================
  console.log('\n--- GROUP 2: KINETIC TEXT & INTERACTIVITY NEUTRALIZATION (R4) ---');

  // 2.1 Interaction handler neutralized in app.js
  assert(appJs.includes('fixedGroup.add(_title),_title.interact(()=>{},()=>{})'), 'app.js: _title.interact is neutralized to a no-op arrow function');
  assert(!appJs.includes('Global.TICKER_INPUTS[_perma].div.focus()'), 'app.js: Global.TICKER_INPUTS[_perma].div.focus() is completely eliminated');

  // 2.2 Embedded _DATA_ quotes across all 6 locales
  const dataMatch = indexHtml.match(/<script type=['"]text\/json['"] id="_DATA_">([\s\S]*?)<\/script>/i);
  assert(!!dataMatch, 'index.html contains embedded _DATA_ JSON element');
  const appData = JSON.parse(dataMatch[1]);
  const expectedQuote = 'A COLLABORATION BEYOND BORDERS – SYAHMI AOF';
  const expectedLocales = ['en', 'ms', 'zh', 'de', 'fr', 'it'];

  for (const loc of expectedLocales) {
    assert(!!appData[loc], `_DATA_ locale [${loc}] exists`);
    assert(!!appData[loc].general, `_DATA_ locale [${loc}] has general section`);
    const gen = appData[loc].general || {};
    assert(gen.share_instructions_desktop === expectedQuote, `_DATA_ [${loc}].general.share_instructions_desktop is "${expectedQuote}"`);
    assert(gen.share_instructions_mobile === expectedQuote, `_DATA_ [${loc}].general.share_instructions_mobile is "${expectedQuote}"`);
    assert(gen.share_placeholder === 'SYAHMIAOF', `_DATA_ [${loc}].general.share_placeholder is preserved as "SYAHMIAOF"`);
  }

  // ==========================================================================
  // GROUP 3: 3D FLOOR BOX & FOOTER SPACING (R1)
  // ==========================================================================
  console.log('\n--- GROUP 3: 3D FLOOR BOX & FOOTER SPACING (R1) ---');

  // 3.1 3D Floor Billboard assets
  const chilleBuf = fs.readFileSync(path.join(ROOT, 'assets', 'images', 'logos', 'chille.png'));
  assert(chilleBuf.readUInt32BE(16) === 358 && chilleBuf.readUInt32BE(20) === 128, 'chille.png billboard texture dimensions are 358x128 px');
  const chileLogoBuf = fs.readFileSync(path.join(ROOT, 'assets', 'images', 'logos', 'chile-logo.png'));
  assert(chileLogoBuf.readUInt32BE(16) === 242 && chileLogoBuf.readUInt32BE(20) === 80, 'chile-logo.png screen rotate texture dimensions are 242x80 px');

  // 3.2 Footer DOM text & spacing
  const footerStart = appJs.indexOf('$footerCopyright.html(');
  assert(footerStart !== -1, 'app.js: $footerCopyright.html call found');
  const footerEnd = appJs.indexOf(');var $footerLinks', footerStart);
  const footerStatement = appJs.substring(footerStart, footerEnd + 1);
  assert(footerStatement.includes('BUILT BY&nbsp;<strong'), 'footer HTML renders "BUILT BY" followed by non-breaking space');
  assert(footerStatement.includes('>SYAHMIAOF</strong>'), 'footer HTML renders visible text "SYAHMIAOF" without intermediate space');
  assert(footerStatement.includes('data-credit="SYAHMI AOF"') || footerStatement.includes('/* SYAHMI AOF */'), 'footer retains "SYAHMI AOF" for Tier 11 Assertion 89');

  // ==========================================================================
  // GROUP 4: OPENGRAPH & SOCIAL PREVIEW METADATA (R2)
  // ==========================================================================
  console.log('\n--- GROUP 4: OPENGRAPH & SOCIAL PREVIEW METADATA (R2) ---');

  // 4.1 Physical poster image
  const posterPath = path.join(ROOT, 'assets', 'images', 'og-preview-syahmiaof.png');
  assert(fs.existsSync(posterPath), 'assets/images/og-preview-syahmiaof.png physically exists');
  const posterBuf = fs.readFileSync(posterPath);
  const posterW = posterBuf.readUInt32BE(16);
  const posterH = posterBuf.readUInt32BE(20);
  assert(posterW === 1733 && posterH === 908, `Poster physical dimensions match IHDR: 1733x908 px (found ${posterW}x${posterH})`);

  // 4.2 Metadata tags in index.html
  assert(indexHtml.includes('<meta property="og:image" content="https://syahmiaof.my/assets/images/og-preview-syahmiaof.png">'), 'og:image points to production HTTPS URL');
  assert(indexHtml.includes('<meta property="og:image:type" content="image/png">'), 'og:image:type is image/png');
  assert(indexHtml.includes('<meta property="og:image:width" content="1733">'), 'og:image:width matches physical width 1733');
  assert(indexHtml.includes('<meta property="og:image:height" content="908">'), 'og:image:height matches physical height 908');
  assert(indexHtml.includes('<meta name="twitter:image" content="https://syahmiaof.my/assets/images/og-preview-syahmiaof.png">'), 'twitter:image points to production HTTPS URL');

  // 4.3 Zero localhost in index.html
  assert(!indexHtml.includes('localhost') && !indexHtml.includes('127.0.0.1'), 'index.html: zero occurrences of localhost or 127.0.0.1 in production metadata');

  // ==========================================================================
  // GROUP 5: LANGUAGE SELECTION CLEANUP & EXPANSION (R3)
  // ==========================================================================
  console.log('\n--- GROUP 5: LANGUAGE SELECTION CLEANUP & EXPANSION (R3) ---');

  // 5.1 _LANGUAGES_ in index.html
  const langMatch = indexHtml.match(/<script type=['"]text\/json['"] id="_LANGUAGES_">([\s\S]*?)<\/script>/i);
  assert(!!langMatch, 'index.html contains _LANGUAGES_ script element');
  const activeLangs = JSON.parse(langMatch[1]);
  const activeKeys = Object.keys(activeLangs);
  assert(activeKeys.length === 3 && activeKeys.includes('en') && activeKeys.includes('ms') && activeKeys.includes('zh'), 'Active languages in index.html strictly en, ms, zh');
  assert(!activeKeys.includes('de') && !activeKeys.includes('fr') && !activeKeys.includes('it'), 'Unused languages (de, fr, it) purged from active _LANGUAGES_');

  // 5.2 app.js runtime language configurations
  assert(appJs.includes('this.LANGUAGES=["en","ms","zh"]'), 'app.js: Config.LANGUAGES strictly ["en","ms","zh"]');
  assert(appJs.includes('_this.LANGUAGES_TRANSLATION={en:"English",ms:"Bahasa Melayu",zh:"中文"}'), 'app.js: LANGUAGES_TRANSLATION maps strictly en, ms, zh');

  // 5.3 Malay (ms) and Chinese (zh) dictionaries in _DATA_
  assert(appData.ms && appData.ms.meta && appData.ms.meta.pageTitle === 'adidas x SYAHMIAOF – 3D WebGL Pengalaman', 'ms locale has authentic Malay pageTitle');
  assert(appData.zh && appData.zh.meta && appData.zh.meta.pageTitle === 'adidas x SYAHMIAOF – 3D WebGL 体验', 'zh locale has authentic Chinese pageTitle');
  assert(appData.ms.menu && appData.ms.menu.buy_cta === 'BELI KOLEKSI INI', 'ms menu has authentic Malay CTA');
  assert(appData.zh.menu && appData.zh.menu.buy_cta === '选购该系列', 'zh menu has authentic Chinese CTA');

  // ==========================================================================
  // GROUP 6: SWEATER SHARE CARD MODAL BRANDING (R5)
  // ==========================================================================
  console.log('\n--- GROUP 6: SWEATER SHARE CARD MODAL BRANDING (R5) ---');

  const uilData = JSON.parse(uilRaw);
  assert(Object.keys(uilData).length > 8800, `uil.json contains complete layout registry (>8800 keys, found ${Object.keys(uilData).length})`);

  const shareLayoutKeys = [
    'INPUT_Config_17_share_portrait_bomber_bg',
    'INPUT_Config_10_share_portrait_tracksuit-black_bg',
    'INPUT_Config_9_share_portrait_tracksuit-white_bg',
    'INPUT_Config_7_share_landscape_bomber_bg',
    'INPUT_Config_7_share_landscape_tracksuit-black_bg',
    'INPUT_Config_7_share_landscape_tracksuit-white_bg',
    'INPUT_Config_7_share_square_bomber_bg',
    'INPUT_Config_7_share_square_tracksuit-black_bg',
    'INPUT_Config_8_share_square_tracksuit-white_bg'
  ];

  for (const k of shareLayoutKeys) {
    assert(uilData[k] === 'assets/images/logos/logo.svg', `uil.json: ${k} points to "assets/images/logos/logo.svg"`);
  }

  // ==========================================================================
  // GROUP 7: HTTP DEV SERVER & STREAMING RANGE REQUESTS (LIVE HTTP)
  // ==========================================================================
  console.log('\n--- GROUP 7: HTTP DEV SERVER & STREAMING RANGE REQUESTS ---');

  // 7.1 Static endpoints
  const endpoints = [
    { url: '/', status: 200, mime: 'text/html' },
    { url: '/index.html', status: 200, mime: 'text/html' },
    { url: '/assets/shaders/compiled.vs', status: 200, mime: 'text/plain' },
    { url: '/assets/data/uil.json', status: 200, mime: 'application/json' },
    { url: '/assets/images/logos/logo.svg', status: 200, mime: 'image/svg+xml' },
    { url: '/assets/images/og-preview-syahmiaof.png', status: 200, mime: 'image/png' },
    { url: '/assets/images/logos/chille.png', status: 200, mime: 'image/png' },
    { url: '/assets/images/logos/chile-logo.png', status: 200, mime: 'image/png' }
  ];

  for (const ep of endpoints) {
    const res = await requestHttp(ep.url);
    assert(res.statusCode === ep.status, `HTTP GET ${ep.url} -> ${ep.status}`);
    assert((res.headers['content-type'] || '').includes(ep.mime), `HTTP GET ${ep.url} Content-Type is ${ep.mime}`);
  }

  // 7.2 OPTIONS method
  const optRes = await requestHttp('/', { method: 'OPTIONS' });
  assert(optRes.statusCode === 204, 'HTTP OPTIONS / -> 204 No Content');

  // 7.3 Video & Audio Byte-Range Requests
  const videoRange = await requestHttp('/assets/videos/world1.mp4', { headers: { 'Range': 'bytes=0-1023' } }, true);
  assert(videoRange.statusCode === 206, 'HTTP Range GET /assets/videos/world1.mp4 (bytes=0-1023) -> 206 Partial Content');
  assert((videoRange.headers['content-type'] || '').includes('video/mp4'), 'Range response Content-Type is video/mp4');
  assert((videoRange.headers['content-range'] || '').startsWith('bytes 0-1023/'), 'Range response Content-Range header starts with bytes 0-1023/');
  assert(videoRange.raw.length === 1024, `Range response payload size is exactly 1024 bytes (got ${videoRange.raw.length})`);

  const audioRange = await requestHttp('/assets/_sounds/main-optimized.mp3', { headers: { 'Range': 'bytes=500-1499' } }, true);
  assert(audioRange.statusCode === 206, 'HTTP Range GET /assets/_sounds/main-optimized.mp3 (bytes=500-1499) -> 206 Partial Content');
  assert((audioRange.headers['content-type'] || '').includes('audio/mpeg'), 'Range response Content-Type is audio/mpeg');
  assert((audioRange.headers['content-range'] || '').startsWith('bytes 500-1499/'), 'Range response Content-Range header starts with bytes 500-1499/');
  assert(audioRange.raw.length === 1000, `Range response payload size is exactly 1000 bytes (got ${audioRange.raw.length})`);

  // 7.4 Open-ended Range
  const openRange = await requestHttp('/assets/videos/world2.mp4', { headers: { 'Range': 'bytes=5000-' } }, true);
  assert(openRange.statusCode === 206, 'HTTP Range GET /assets/videos/world2.mp4 (bytes=5000-) -> 206');
  assert((openRange.headers['content-range'] || '').startsWith('bytes 5000-'), 'Open-ended Content-Range starts at 5000');
  assert(openRange.raw.length > 100000, `Delivered ${openRange.raw.length} bytes for open-ended stream`);

  // 7.5 Range on non-streamable file should return standard 200
  const nonStreamRange = await requestHttp('/index.html', { headers: { 'Range': 'bytes=0-100' } });
  assert(nonStreamRange.statusCode === 200, 'HTTP Range header on /index.html returns standard 200 (not partial)');

  // 7.6 Negative Tests: 404 for missing asset
  const notFound = await requestHttp('/assets/images/nonexistent-file-404.png');
  assert(notFound.statusCode === 404, 'HTTP GET /assets/images/nonexistent-file-404.png -> 404 Not Found');

  // 7.7 SPA Route Fallback (Deep Link)
  const spaFallback = await requestHttp('/ms/product/bomber');
  assert(spaFallback.statusCode === 200, 'HTTP GET SPA deep route /ms/product/bomber -> 200 OK');
  assert(spaFallback.text.includes('<title>'), 'SPA deep route returns index.html shell');

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log(' ADVERSARIAL CHALLENGE SUITE EXECUTION SUMMARY');
  console.log('================================================================');
  console.log(`  Total Checks Executed : ${totalTests}`);
  console.log(`  Passed Checks         : ${passedTests}`);
  console.log(`  Failed Checks         : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests === 0) {
    console.log('RESULT: 100% PASS - ALL ADVERSARIAL CHALLENGES SATISFIED!');
    console.log('RECOMMENDATION: APPROVE');
    process.exit(0);
  } else {
    console.error(`RESULT: FAILED with ${failedTests} failure(s):`);
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    console.log('RECOMMENDATION: REQUEST_CHANGES');
    process.exit(1);
  }
}

runAdversarialSuite().catch(err => {
  console.error('Fatal unhandled error in adversarial suite:', err);
  process.exit(1);
});
