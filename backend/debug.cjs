const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/test-analysis2.json', 'utf8'));

for(const key of Object.keys(data)) {
  console.log(`${key}:`, typeof data[key], data[key] === null, Array.isArray(data[key]));
}
