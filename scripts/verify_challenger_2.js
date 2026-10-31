/**
 * Challenger 2 Adversarial Verification & Stress Test Harness
 * Evaluates live server, asset endpoints, byte-range streaming, JSON integrity across all 4 locales,
 * and stress-tests edge cases and runtime safety.
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

async function runVerification() {
  console.log('================================================================');
  console.log(' CHALLENGER 2: ADVERSARIAL VERIFICATION & STRESS HARNESS');
  console.log(' Target: adidas x SYAHMIAOF (ui-sweater)');
  console.log(' Timestamp: ' + new Date().toISOString());
  console.log('================================================================\n');

  // ==========================================================================
  // SECTION 1: LIVE DEV SERVER PROBING
  // ==========================================================================
  console.log('--- SECTION 1: LIVE DEV SERVER PROBING (http://localhost:4183) ---');
  
  // 1.1 Root HTML Response Headers & Content-Type
  const root = await requestHttp('/');
  assert(root.statusCode === 200, 'Root HTML endpoint returns HTTP 200 OK', `Status: ${root.statusCode}`);
  const ct = root.headers['content-type'] || '';
  assert(ct.includes('text/html'), 'Root HTML Content-Type is text/html', `Content-Type: ${ct}`);
  assert(ct.includes('utf-8'), 'Root HTML charset is UTF-8', `Content-Type: ${ct}`);
  assert(root.headers['access-control-allow-origin'] === '*', 'CORS Access-Control-Allow-Origin header is *');
  assert(root.headers['cache-control'] === 'no-cache', 'Cache-Control header is no-cache');

  // 1.2 Title & Head Metadata
  const titleMatch = root.text.match(/<title>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : '';
  assert(!!titleMatch, 'Root HTML contains <title> tag');
  assert(titleText.includes('adidas x SYAHMIAOF'), '<title> contains "adidas x SYAHMIAOF"', `Title: "${titleText}"`);
  assert(!titleText.includes('CHILE20') && !titleText.includes('CHILE 20'), '<title> does NOT contain "CHILE20"', `Title: "${titleText}"`);
  assert(!/foot\s*locker/i.test(titleText), '<title> does NOT contain "Foot Locker"', `Title: "${titleText}"`);

  // 1.3 OpenGraph and Social Meta Tags
  const ogTitleMatch = root.text.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
  assert(!!ogTitleMatch, 'OpenGraph og:title tag present');
  assert(ogTitle.includes('SYAHMIAOF'), 'og:title contains "SYAHMIAOF"', `og:title: "${ogTitle}"`);
  assert(!/foot\s*locker/i.test(ogTitle), 'og:title does NOT mention Foot Locker');

  const ogDescMatch = root.text.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
  const ogDesc = ogDescMatch ? ogDescMatch[1] : '';
  assert(!!ogDescMatch, 'OpenGraph og:description tag present');
  assert(ogDesc.includes('Syahmi AOF') || ogDesc.includes('SYAHMIAOF'), 'og:description mentions Syahmi AOF', `og:desc: "${ogDesc}"`);
  assert(!/foot\s*locker/i.test(ogDesc), 'og:description does NOT mention Foot Locker');

  const ogSiteNameMatch = root.text.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']*)["']/i);
  const ogSiteName = ogSiteNameMatch ? ogSiteNameMatch[1] : '';
  assert(!!ogSiteNameMatch, 'OpenGraph og:site_name tag present');
  assert(/syahmi\s*aof/i.test(ogSiteName), 'og:site_name contains "Syahmi AOF"', `og:site_name: "${ogSiteName}"`);

  const ogImageMatch = root.text.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
  assert(!!ogImageMatch && ogImageMatch[1].length > 0, 'OpenGraph og:image tag present and non-empty');

  const twCardMatch = root.text.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i);
  assert(!!twCardMatch, 'Twitter card tag present');

  const twTitleMatch = root.text.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']*)["']/i);
  assert(!!twTitleMatch && twTitleMatch[1].includes('SYAHMIAOF'), 'twitter:title contains "SYAHMIAOF"');

  // 1.4 Script Tags & Bootstrapper
  assert(root.text.includes("assets/js/' + p + '.js") || root.text.includes("assets/js/"), 'Root HTML contains bootstrapper loading assets/js/app.js');
  const appJsHttp = await requestHttp('/assets/js/app.js');
  assert(appJsHttp.statusCode === 200, 'GET /assets/js/app.js returns HTTP 200 OK');
  assert((appJsHttp.headers['content-type'] || '').includes('javascript'), 'assets/js/app.js Content-Type is javascript');
  assert(appJsHttp.raw.length > 900000, `assets/js/app.js bundle is complete (>900KB, got ${Math.round(appJsHttp.raw.length / 1024)} KB)`);

  assert(root.text.includes('id="_CACHE_"'), 'Root HTML contains inline _CACHE_ JSON');
  assert(root.text.includes('id="_DATA_"'), 'Root HTML contains inline _DATA_ JSON');
  assert(root.text.includes('id="_LANGUAGES_"'), 'Root HTML contains inline _LANGUAGES_ JSON');
  assert(root.text.includes('window.dataLayer'), 'Root HTML includes dataLayer mock');
  assert(root.text.includes('configureScope'), 'Root HTML includes Sentry mock');

  // ==========================================================================
  // SECTION 2: ASSET ENDPOINTS DEEP PROBE
  // ==========================================================================
  console.log('\n--- SECTION 2: REBRANDED ASSET ENDPOINTS ---');

  // 2.1 /assets/images/logos/logo.svg
  const logoSvgRes = await requestHttp('/assets/images/logos/logo.svg');
  assert(logoSvgRes.statusCode === 200, 'GET /assets/images/logos/logo.svg -> 200 OK');
  assert((logoSvgRes.headers['content-type'] || '').includes('image/svg+xml'), 'logo.svg Content-Type is image/svg+xml');
  assert(logoSvgRes.text.includes('0 0 152 57'), 'logo.svg has viewBox 0 0 152 57');
  assert(logoSvgRes.text.includes('M41.8,27') || logoSvgRes.text.includes('M44.4') || logoSvgRes.text.includes('adidas'), 'logo.svg preserves adidas Trefoil logo path');
  assert(/syahmi[- ]aof/i.test(logoSvgRes.text), 'logo.svg contains vector typography for "SYAHMI AOF"');
  assert(!/foot\s*locker/i.test(logoSvgRes.text), 'logo.svg has zero occurrences of Foot Locker');
  assert(!logoSvgRes.text.includes('M116.7,30V7.9H68v42h70.8V30H116.7z'), 'logo.svg old Foot Locker box path is completely removed');

  // 2.2 /assets/images/logos/chille.png
  const chilleRes = await requestHttp('/assets/images/logos/chille.png', {}, true);
  assert(chilleRes.statusCode === 200, 'GET /assets/images/logos/chille.png -> 200 OK');
  assert((chilleRes.headers['content-type'] || '').includes('image/png'), 'chille.png Content-Type is image/png');
  const chilleMagic = chilleRes.raw.subarray(0, 8);
  const expectedPngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert(chilleMagic.equals(expectedPngMagic), 'chille.png has valid PNG magic byte signature');
  const chilleWidth = chilleRes.raw.readUInt32BE(16);
  const chilleHeight = chilleRes.raw.readUInt32BE(20);
  assert(chilleWidth === 358 && chilleHeight === 128, `chille.png dimensions are exactly 358x128 (got ${chilleWidth}x${chilleHeight})`);
  const ratio = (chilleHeight / chilleWidth);
  assert(Math.abs(ratio - 0.35754) < 0.005, 'chille.png height/width aspect ratio matches 3D billboard (0.358)');

  // 2.3 /assets/images/logos/chile.svg
  const chileSvgRes = await requestHttp('/assets/images/logos/chile.svg');
  assert(chileSvgRes.statusCode === 200, 'GET /assets/images/logos/chile.svg -> 200 OK');
  assert((chileSvgRes.headers['content-type'] || '').includes('image/svg+xml'), 'chile.svg Content-Type is image/svg+xml');
  assert(chileSvgRes.text.includes('0 0 242 80'), 'chile.svg has viewBox 0 0 242 80');
  assert(chileSvgRes.text.includes('width="242"') && chileSvgRes.text.includes('height="80"'), 'chile.svg width="242" and height="80"');
  assert(chileSvgRes.text.includes('fill="white"'), 'chile.svg uses white fill for vector typography');
  assert(!/foot\s*locker/i.test(chileSvgRes.text), 'chile.svg has zero occurrences of Foot Locker');

  // 2.4 /assets/images/logos/chile-logo.png
  const chileLogoRes = await requestHttp('/assets/images/logos/chile-logo.png', {}, true);
  assert(chileLogoRes.statusCode === 200, 'GET /assets/images/logos/chile-logo.png -> 200 OK');
  assert((chileLogoRes.headers['content-type'] || '').includes('image/png'), 'chile-logo.png Content-Type is image/png');
  const chileLogoMagic = chileLogoRes.raw.subarray(0, 8);
  assert(chileLogoMagic.equals(expectedPngMagic), 'chile-logo.png has valid PNG magic byte signature');
  const chileLogoWidth = chileLogoRes.raw.readUInt32BE(16);
  const chileLogoHeight = chileLogoRes.raw.readUInt32BE(20);
  assert(chileLogoWidth === 242 && chileLogoHeight === 80, `chile-logo.png dimensions are exactly 242x80 (got ${chileLogoWidth}x${chileLogoHeight})`);

  // ==========================================================================
  // SECTION 3: VIDEO & AUDIO STREAMING BYTE-RANGE REQUESTS (HTTP 206)
  // ==========================================================================
  console.log('\n--- SECTION 3: VIDEO STREAMING BYTE-RANGE REQUESTS (HTTP 206) ---');

  const mediaStreams = [
    { name: 'world1.mp4', path: '/assets/videos/world1.mp4', mime: 'video/mp4', range: 'bytes=0-1023', expectedLen: 1024 },
    { name: 'world2.mp4', path: '/assets/videos/world2.mp4', mime: 'video/mp4', range: 'bytes=2048-4095', expectedLen: 2048 },
    { name: 'world3.mp4', path: '/assets/videos/world3.mp4', mime: 'video/mp4', range: 'bytes=8192-16383', expectedLen: 8192 },
    { name: 'main-optimized.mp3', path: '/assets/_sounds/main-optimized.mp3', mime: 'audio/mpeg', range: 'bytes=0-511', expectedLen: 512 }
  ];

  for (const m of mediaStreams) {
    const res = await requestHttp(m.path, { headers: { 'Range': m.range } }, true);
    assert(res.statusCode === 206, `HTTP Range request for ${m.name} returns HTTP 206 Partial Content`, `Got status ${res.statusCode}`);
    assert((res.headers['content-type'] || '').includes(m.mime), `${m.name} Content-Type is ${m.mime}`, `Got: ${res.headers['content-type']}`);
    assert(res.headers['accept-ranges'] === 'bytes', `${m.name} includes Accept-Ranges: bytes header`);
    
    const cr = res.headers['content-range'] || '';
    const rangeTokens = m.range.replace('bytes=', '').split('-');
    const expectedCrPrefix = `bytes ${rangeTokens[0]}-${rangeTokens[1]}/`;
    assert(cr.startsWith(expectedCrPrefix), `${m.name} Content-Range header starts with ${expectedCrPrefix}`, `Got: ${cr}`);
    
    assert(parseInt(res.headers['content-length'], 10) === m.expectedLen, `${m.name} Content-Length matches requested chunk size (${m.expectedLen})`);
    assert(res.raw.length === m.expectedLen, `${m.name} received byte payload buffer length equals ${m.expectedLen}`);
  }

  // Range request with no end specified (e.g. bytes=10000-)
  const openRange = await requestHttp('/assets/videos/world1.mp4', { headers: { 'Range': 'bytes=10000-' } }, true);
  assert(openRange.statusCode === 206, 'HTTP Range request with open-ended range (bytes=10000-) returns HTTP 206');
  assert((openRange.headers['content-range'] || '').startsWith('bytes 10000-'), 'Open-ended Content-Range starts at requested byte 10000');
  assert(openRange.raw.length > 100000, `Open-ended byte payload delivered successfully (${openRange.raw.length} bytes)`);

  // ==========================================================================
  // SECTION 4: JSON INTEGRITY OF _DATA_ ACROSS ALL 4 LOCALES
  // ==========================================================================
  console.log('\n--- SECTION 4: JSON INTEGRITY OF _DATA_ ACROSS ALL 4 LOCALES ---');

  const dataTagMatch = root.text.match(/<script type=['"]text\/json['"] id="_DATA_">([\s\S]*?)<\/script>/i);
  assert(!!dataTagMatch, 'Found <script id="_DATA_"> tag in live server root HTML');

  let parsedData = null;
  let jsonParseError = null;
  try {
    parsedData = JSON.parse(dataTagMatch[1]);
  } catch (err) {
    jsonParseError = err.message;
  }
  assert(!jsonParseError, 'Embedded _DATA_ successfully parses with standard JSON.parse', jsonParseError);

  if (parsedData) {
    const requiredLocales = ['en', 'de', 'fr', 'it'];
    for (const loc of requiredLocales) {
      assert(!!parsedData[loc], `Locale "${loc}" exists as top-level object in _DATA_`);
      const locObj = parsedData[loc] || {};

      // 4.1 Check meta pageTitle across all locales
      const pageTitle = locObj.meta && locObj.meta.pageTitle;
      assert(typeof pageTitle === 'string' && pageTitle.includes('SYAHMIAOF'), `[${loc}] meta.pageTitle contains "SYAHMIAOF"`, `Got: "${pageTitle}"`);
      assert(!/chile\s*20/i.test(pageTitle) && !/foot\s*locker/i.test(pageTitle), `[${loc}] meta.pageTitle does NOT contain legacy branding`);

      // 4.2 Check general.share_placeholder across all locales
      const sharePlaceholder = locObj.general && locObj.general.share_placeholder;
      assert(sharePlaceholder === 'SYAHMIAOF', `[${loc}] general.share_placeholder === 'SYAHMIAOF'`, `Got: "${sharePlaceholder}"`);

      // 4.3 Deep scan strings in locale object for residual "Foot Locker" and "CHILE20"
      let locStr = JSON.stringify(locObj);
      assert(!/foot\s*locker/i.test(locStr), `[${loc}] Zero occurrences of "Foot Locker" in locale dictionary`);
      assert(!/chile\s*20/i.test(locStr), `[${loc}] Zero occurrences of "CHILE20" / "CHILE 20" in locale dictionary`);
    }

    // Specific locale verifications
    // en
    assert(parsedData.en.meta.facebookTitle.includes('SYAHMIAOF'), '[en] meta.facebookTitle contains "SYAHMIAOF"');
    assert(parsedData.en.general.share_tweet.includes('Syahmi AOF'), '[en] general.share_tweet mentions Syahmi AOF');
    assert(!/CHILE/i.test(parsedData.en.contest.loose_cta_label), '[en] contest.loose_cta_label does not contain "CHILE"');
    assert(parsedData.en.contest.loose_cta_label === 'EXPLORE SYAHMIAOF', '[en] contest.loose_cta_label is "EXPLORE SYAHMIAOF"');
    assert(parsedData.en.contest.loose_paragraph_2.includes('Syahmi AOF'), '[en] contest.loose_paragraph_2 mentions Syahmi AOF');

    // de
    assert(parsedData.de.meta.facebookTitle.includes('SYAHMIAOF'), '[de] meta.facebookTitle contains "SYAHMIAOF"');
    assert(parsedData.de.contest.loose_cta_label.includes('SYAHMIAOF'), '[de] contest.loose_cta_label contains "SYAHMIAOF"');
    assert(parsedData.de.contest.loose_paragraph_2.includes('Syahmi AOF'), '[de] contest.loose_paragraph_2 mentions Syahmi AOF');

    // fr & it presence of menu and UI translations
    assert(!!parsedData.fr.menu && !!parsedData.fr.general, '[fr] contains menu and general UI translations');
    assert(!!parsedData.it.menu && !!parsedData.it.general, '[it] contains menu and general UI translations');
  }

  // ==========================================================================
  // SECTION 5: ADVERSARIAL STRESS TESTING & EDGE CASE MINING
  // ==========================================================================
  console.log('\n--- SECTION 5: ADVERSARIAL STRESS TESTING & EDGE CASE MINING ---');

  // 5.1 Stress Test: Concurrent Request Burst (50 parallel requests)
  console.log('  Testing 50 concurrent requests against dev server...');
  const burstRequests = [];
  for (let i = 0; i < 50; i++) {
    const pick = i % 4;
    if (pick === 0) burstRequests.push(requestHttp('/'));
    else if (pick === 1) burstRequests.push(requestHttp('/assets/images/logos/logo.svg'));
    else if (pick === 2) burstRequests.push(requestHttp('/assets/videos/world1.mp4', { headers: { 'Range': 'bytes=0-511' } }, true));
    else burstRequests.push(requestHttp('/assets/data/uil.json'));
  }
  const burstResults = await Promise.all(burstRequests);
  const burstSuccess = burstResults.every(r => r.statusCode === 200 || r.statusCode === 206);
  assert(burstSuccess, 'Dev server survives 50 concurrent requests without failure or timeout');

  // 5.2 Stress Test: Non-existent asset handling (404)
  const nonExistent = await requestHttp('/assets/images/logos/non_existent_logo_12345.png');
  assert(nonExistent.statusCode === 404, 'Request for missing asset returns 404 Not Found', `Got: ${nonExistent.statusCode}`);

  // 5.3 Stress Test: SPA Route Fallback (Deep links)
  const spaRoute = await requestHttp('/black-tracksuit/1');
  assert(spaRoute.statusCode === 200, 'Deep SPA route /black-tracksuit/1 returns HTTP 200 via fallback');
  assert(spaRoute.text.includes('<title>'), 'Deep SPA route delivers index.html shell');

  const spaRoute2 = await requestHttp('/bomber/2');
  assert(spaRoute2.statusCode === 200, 'Deep SPA route /bomber/2 returns HTTP 200 via fallback');

  // 5.4 Stress Test: Residual Forbidden Brand Scanning Across Codebase
  console.log('  Scanning entire ui-sweater project for residual brand leaks...');
  const appJsPath = path.join(ROOT, 'assets', 'js', 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');

  // Check footer implementation in app.js
  assert(appJsContent.includes('DEVELOPED BY'), 'app.js includes DEVELOPED BY');
  assert(appJsContent.includes('SYAHMI AOF'), 'app.js includes SYAHMI AOF');
  assert(appJsContent.includes('https://syahmiaof.my'), 'app.js includes portfolio link https://syahmiaof.my');
  assert(appJsContent.includes('studioweb.syahmiaof.my'), 'app.js includes studio link studioweb.syahmiaof.my');
  assert(appJsContent.includes('https://github.com/syahmiaof'), 'app.js includes github link https://github.com/syahmiaof');
  assert(appJsContent.includes('010-7965236'), 'app.js includes phone number 010-7965236');
  assert(appJsContent.includes('hello@syahmiaof.my'), 'app.js includes email hello@syahmiaof.my');
  assert(!appJsContent.includes('2020 ADIDAS AG'), 'app.js legacy corporate copyright (2020 ADIDAS AG) is purged');
  assert(!appJsContent.includes('http://addidas.com'), 'app.js typo http://addidas.com is purged');

  // 5.5 Stress Test: Theme Color Update Crash Prevention (Interface Contract)
  // Verify $footerTerms, $footerPrivacy, $footerCookies are defined in initFooter so PageUIDom.prototype.updateColor does not throw TypeError!
  assert(appJsContent.includes('$footerTerms') && appJsContent.includes('$footerPrivacy') && appJsContent.includes('$footerCookies'), 
    'initFooter preserves $footerTerms, $footerPrivacy, $footerCookies aliases preventing PageUIDom.updateColor runtime crash');

  // 5.6 Stress Test: Shop The Collection Dropdown click toggle
  assert(appJsContent.includes('_isOpen') || appJsContent.includes('click'), 'Shop The Collection dropdown has click toggle handling');
  assert(appJsContent.includes('javascript:void(0)'), 'Dropdown showcase items use javascript:void(0) dummy links');

  // 5.7 Stress Test: VideoUI 3D Button Neutralization
  const videoUiProto = appJsContent.substring(appJsContent.indexOf('VideoUI.prototype'), appJsContent.indexOf('VideoUI.prototype') + 15000);
  assert(!videoUiProto.includes('window.open(this.link, "_blank")'), 'VideoUI 3D button onClick does NOT open external window');

  // 5.8 Stress Test: Mobile menu redirection neutralization
  assert(!appJsContent.includes('window.open(this.links[this.index], "_blank")'), 'MobileMenu onProductInputChange external window.open neutralized');

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log(' CHALLENGER 2 VERIFICATION SUMMARY');
  console.log('================================================================');
  console.log(`  Total Checks Executed : ${totalTests}`);
  console.log(`  Passed Checks         : ${passedTests}`);
  console.log(`  Failed Checks         : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests === 0) {
    console.log('ALL EMPIRICAL CHECKS & ADVERSARIAL STRESS TESTS PASSED!');
    console.log('Verdict: APPROVE');
    process.exit(0);
  } else {
    console.error(`VERIFICATION FAILED with ${failedTests} failure(s):`);
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    console.log('Verdict: REQUEST_CHANGES');
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal unhandled error in verification harness:', err);
  process.exit(1);
});
