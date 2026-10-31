const fs = require('fs');
const path = require('path');
const https = require('https');

// Read candidates
const candidates = JSON.parse(fs.readFileSync(path.join(__dirname, 'candidate_assets.json'), 'utf8'));

// Also add geometry files with and without .json
const extraGeom = [
  'assets/geometry/ball/ball.json',
  'assets/geometry/bomberjacket/closed/arms.json',
  'assets/geometry/bomberjacket/closed/back.json',
  'assets/geometry/bomberjacket/closed/buttons.json',
  'assets/geometry/bomberjacket/closed/detail.json',
  'assets/geometry/bomberjacket/closed/front.json',
  'assets/geometry/bomberjacket/floor.json',
  'assets/geometry/bomberjacket/wall.json',
  'assets/geometry/bomberjacket/updated/arms.json',
  'assets/geometry/bomberjacket/updated/back.json',
  'assets/geometry/bomberjacket/updated/detail.json',
  'assets/geometry/bomberjacket/updated/front.json',
  'assets/geometry/bomberjacket/arm_low.json',
  'assets/geometry/bomberjacket/color_low.json',
  'assets/geometry/bomberjacket/main_low.json',
  'assets/geometry/tracksuit/updated/arms.json',
  'assets/geometry/tracksuit/updated/back.json',
  'assets/geometry/tracksuit/updated/detail.json',
  'assets/geometry/tracksuit/updated/front.json',
  'assets/geometry/tracksuit/arms_low.json',
  'assets/geometry/tracksuit/details_low.json',
  'assets/geometry/tracksuit/main_low.json',
  'assets/geometry/tracksuit/pants_low.json',
  'assets/geometry/world1/floor.json',
  'assets/geometry/world1/scene_details.json',
  'assets/geometry/world1/wall.json',
  'assets/geometry/world2/floor.json',
  'assets/geometry/world2/parts.json',
  'assets/geometry/world2/stripes.json',
  'assets/geometry/world3/floor.json',
  'assets/geometry/world3/hover.json',
  'assets/geometry/world3/metals.json',
  'assets/geometry/world3/screen2.json',
  'assets/geometry/world3/speaker2.json',
  'assets/geometry/world3/stripes2.json',
  'assets/geometry/world3/table.json',
  'assets/geometry/world3/table-optimized.json',
  'assets/geometry/world3/wall.json',
  'assets/geometry/world3/window.json',
  'assets/geometry/intro/bg.json',
  'assets/geometry/intro/stripe.json',
  'assets/geometry/skateboard/deck.json',
  'assets/geometry/skateboard/wheels.json'
];

// Also add sprites
const extraSprites = [
  'assets/images/sprites/logo/in.json',
  'assets/images/sprites/logo/in.png',
  'assets/images/sprites/logo/out.json',
  'assets/images/sprites/logo/out.png',
  'assets/images/sprites/drag/white.png',
  'assets/images/sprites/drag/white.json',
  'assets/images/sprites/drag/grey.png',
  'assets/images/sprites/drag/grey.json',
  'assets/images/sprites/scroll/white.png',
  'assets/images/sprites/scroll/white.json',
  'assets/images/sprites/scroll/grey.png',
  'assets/images/sprites/scroll/grey.json',
  'assets/images/sprites/interact/white.png',
  'assets/images/sprites/interact/white.json',
  'assets/images/sprites/interact/grey.png',
  'assets/images/sprites/interact/grey.json',
  'assets/images/sprites/close/white.png',
  'assets/images/sprites/close/white.json',
  'assets/images/sprites/close/grey.png',
  'assets/images/sprites/close/grey.json'
];

// Also add icons
const extraIcons = [
  'assets/images/icons/arrow.png',
  'assets/images/icons/cross.svg',
  'assets/images/icons/cross-black.svg',
  'assets/images/icons/phone.svg',
  'assets/images/icons/facebook.svg',
  'assets/images/icons/facebook-black.svg',
  'assets/images/icons/twitter.svg',
  'assets/images/icons/twitter-black.svg',
  'assets/images/icons/instagram.svg',
  'assets/images/icons/instagram-black.svg'
];

// Meta & Favicon assets
const extraMeta = [
  'assets/meta/apple-touch-icon.png',
  'assets/meta/favicon-32x32.png',
  'assets/meta/favicon-16x16.png',
  'assets/meta/site.webmanifest',
  'assets/meta/safari-pinned-tab.svg',
  'assets/meta/favicon.ico',
  'assets/meta/browserconfig.xml'
];

const allToCheck = Array.from(new Set([
  ...candidates,
  ...extraGeom,
  ...extraSprites,
  ...extraIcons,
  ...extraMeta
])).sort();

console.log('Total assets to check:', allToCheck.length);
fs.writeFileSync(path.join(__dirname, 'all_assets_to_check.json'), JSON.stringify(allToCheck, null, 2));
