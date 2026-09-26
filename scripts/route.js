#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const manifestFile = path.join(ROOT, 'src/schemas/agent_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const queryTerms = args.filter(a => a !== '--json').join(' ').toLowerCase().trim().split(/\s+/).filter(Boolean);

if (queryTerms.length === 0) {
  if (isJson) {
    console.log(JSON.stringify({ error: "Missing query. Usage: node scripts/route.js <keyword> [--json]" }, null, 2));
  } else {
    console.log("Usage: node scripts/route.js <keyword or multi-word intent> [--json]");
    console.log("Examples: 'button size', 'stepper input', 'tabs icon-only', 'showcase'");
  }
  process.exit(0);
}

const matches = [];
function scan(obj, prefix = '') {
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      const targetStr = `${fullKey} ${val}`.toLowerCase();
      if (queryTerms.every(term => targetStr.includes(term))) {
        matches.push({ key: fullKey, path: val });
      }
    } else if (typeof val === 'object' && val !== null) {
      scan(val, fullKey);
    }
  }
}

scan(manifest.routing || {});

if (isJson) {
  console.log(JSON.stringify({ query: queryTerms.join(' '), count: matches.length, results: matches }, null, 2));
} else {
  console.log(`\x1b[36mTarget Routes for query: '${queryTerms.join(' ')}' (${matches.length} found)\x1b[0m`);
  if (matches.length === 0) {
    console.log("  No matches found in manifest. Available categories: tokens, blocks, navigation, pages, scripts, showcase, documentation.");
  } else {
    for (const m of matches) {
      console.log(`  \x1b[32m✔\x1b[0m [${m.key}] -> \x1b[33m${m.path}\x1b[0m`);
    }
  }
}
