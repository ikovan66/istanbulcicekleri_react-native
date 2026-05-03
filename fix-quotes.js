/**
 * Fix mixed backtick/single-quote strings
 * The migration script replaced opening quotes with backtick
 * but left the closing as single quotes.
 */

const fs = require('fs');
const path = require('path');

function walkDir(dir, extensions) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item === 'node_modules' || item === '.git' || item === 'config') continue;
      results.push(...walkDir(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.js', '.tsx']);

let totalFixes = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  
  // Fix pattern: `${...}...something...' → `${...}...something...`
  // Match backtick-opened strings containing template expressions that end with single quote
  content = content.replace(/`(\$\{[^}]+\}[^`']*?)'/g, '`$1`');
  
  if (content !== original) {
    const fixCount = (original.match(/`(\$\{[^}]+\}[^`']*?)'/g) || []).length;
    fs.writeFileSync(file, content, 'utf-8');
    totalFixes += fixCount;
    console.log(`  ✅ ${path.relative(__dirname, file)} (${fixCount} fixes)`);
  }
}

console.log(`\nTotal: ${totalFixes} mixed quotes fixed`);
