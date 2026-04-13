// Publishes all JSON article files from data/batch/ directory
const fs = require('fs');
const path = require('path');
const { publishArticle } = require('./generate-direct');

const BATCH_DIR = path.join(__dirname, 'data', 'batch');

if (!fs.existsSync(BATCH_DIR)) {
  console.log('No batch directory found at ' + BATCH_DIR);
  process.exit(1);
}

const files = fs.readdirSync(BATCH_DIR).filter(f => f.endsWith('.json'));
console.log('Found ' + files.length + ' articles to publish\n');

let published = 0;
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), 'utf-8'));
    const ok = publishArticle(data);
    if (ok) published++;
  } catch (err) {
    console.error('Error with ' + file + ': ' + err.message);
  }
}

console.log('\nPublished ' + published + '/' + files.length + ' articles');
