const https = require('https');

const permas = ['world1', 'world2', 'world3', 'bomber', 'bomberjacket', 'tracksuit', 'tracksuit-black', 'tracksuit-white'];
const indices = [0, 1, 2, 3, 4, 5];

for (const p of permas) {
  for (const i of indices) {
    const url = `/assets/images/products/${p}/${i}.jpg`;
    https.get('https://adidaschile20.com' + url, res => {
      const ct = res.headers['content-type'] || '';
      if (res.statusCode === 200 && !ct.includes('html')) {
        console.log('PRODUCT EXISTS:', url, res.headers['content-length']);
      }
    });
  }
}
