const fs = require('fs');

const html = fs.readFileSync('ui-sweater/index.html', 'utf8');
const match = html.match(/<script type='text\/json' id="_DATA_">([\s\S]*?)<\/script>/);

if (match) {
  const data = JSON.parse(match[1]);
  console.log('Available languages:', Object.keys(data));
  const en = data.en;
  console.log('EN sections:', Object.keys(en));
  for (const k of Object.keys(en)) {
    console.log(`\n=== Section: ${k} ===`);
    console.log(JSON.stringify(en[k], null, 2));
  }
}
