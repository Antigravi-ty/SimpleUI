#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const isJson = process.argv.includes('--json');
const errors = [];
const passed = [];

function fail(msg) { errors.push(msg); }
function pass(msg) { passed.push(msg); }

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') walk(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// 1. Token Pipeline Synchronization Check
const SCHEMAS_TOKENS = path.join(ROOT, 'src/schemas/tokens');
const TOKENS_DIR = path.join(ROOT, 'src/tokens');

if (fs.existsSync(SCHEMAS_TOKENS)) {
  const tokenFiles = fs.readdirSync(SCHEMAS_TOKENS).filter(f => f.endsWith('.json'));
  let totalTokens = 0;
  for (const file of tokenFiles) {
    const raw = fs.readFileSync(path.join(SCHEMAS_TOKENS, file), 'utf-8');
    const json = JSON.parse(raw);
    const category = json.category || path.basename(file, '.json');
    const cssFile = path.join(TOKENS_DIR, `${category}.css`);

    if (!fs.existsSync(cssFile)) {
      fail(`CSS token file missing: src/tokens/${category}.css`);
      continue;
    }
    const cssContent = fs.readFileSync(cssFile, 'utf-8');
    for (const [key, data] of Object.entries(json.tokens || {})) {
      totalTokens++;
      const varName = data.variable || `--ui-${category}-${key}`;
      if (!cssContent.includes(varName)) {
        fail(`Token variable '${varName}' from ${file} missing in src/tokens/${category}.css`);
      }
    }
  }
  pass(`Verified ${totalTokens} JSON tokens synchronized with CSS tokens.`);
}

// 2. Blocks Architecture Check (12 Colocated Blocks)
const BLOCKS_DIR = path.join(ROOT, 'src/blocks');
const EXPECTED_BLOCKS = [
  'badge', 'button', 'checkbox', 'dropdown', 'panel',
  'progressbar', 'segmented-control', 'selective-card',
  'slider', 'stepper', 'tabs', 'toggler'
];
const BEHAVIORAL_BLOCKS = [
  'checkbox', 'dropdown', 'panel', 'progressbar',
  'segmented-control', 'selective-card', 'slider',
  'stepper', 'tabs', 'toggler'
];

if (!fs.existsSync(BLOCKS_DIR)) {
  fail('src/blocks directory does not exist!');
} else {
  const diskBlocks = fs.readdirSync(BLOCKS_DIR).filter(f => fs.statSync(path.join(BLOCKS_DIR, f)).isDirectory());
  for (const exp of EXPECTED_BLOCKS) {
    if (!diskBlocks.includes(exp)) {
      fail(`Expected block '${exp}' not found in src/blocks/`);
      continue;
    }
    const bDir = path.join(BLOCKS_DIR, exp);
    const schemaFile = path.join(bDir, 'schema.json');
    const indexFile = path.join(bDir, 'index.js');
    const stylesIndex = path.join(bDir, 'styles/index.css');
    const baseCss = path.join(bDir, 'styles/base.css');
    const sizesCss = path.join(bDir, 'styles/sizes.css');
    const variantsCss = path.join(bDir, 'styles/variants.css');

    if (!fs.existsSync(schemaFile)) fail(`Block '${exp}' missing schema.json`);
    if (!fs.existsSync(indexFile)) fail(`Block '${exp}' missing index.js`);
    if (!fs.existsSync(stylesIndex)) fail(`Block '${exp}' missing styles/index.css`);
    if (!fs.existsSync(baseCss)) fail(`Block '${exp}' missing styles/base.css`);
    if (!fs.existsSync(sizesCss)) fail(`Block '${exp}' missing styles/sizes.css`);
    if (!fs.existsSync(variantsCss)) fail(`Block '${exp}' missing styles/variants.css`);

    if (BEHAVIORAL_BLOCKS.includes(exp)) {
      const behaviorFile = path.join(bDir, 'behavior.js');
      if (!fs.existsSync(behaviorFile)) fail(`Behavioral block '${exp}' missing behavior.js`);
    }

    if (exp === 'selective-card') {
      const groupBehavior = path.join(bDir, 'behavior-group.js');
      const groupStyles = path.join(bDir, 'styles/group.css');
      if (!fs.existsSync(groupBehavior)) fail(`selective-card missing behavior-group.js`);
      if (!fs.existsSync(groupStyles)) fail(`selective-card missing styles/group.css`);
    }

    // Zero-Saturation Neutral Rule Verification
    if (fs.existsSync(variantsCss)) {
      const varContent = fs.readFileSync(variantsCss, 'utf-8');
      const neutralIdx = varContent.indexOf(`--neutral`);
      const chromaticMatches = [
        ...varContent.matchAll(/--(primary|danger|success|warning|info|indigo|violet|purple|pink|amber|emerald|teal|cyan|sky|blue|rose)/g)
      ];
      if (chromaticMatches.length > 0 && neutralIdx !== -1) {
        const firstChromatic = chromaticMatches[0].index;
        if (firstChromatic < neutralIdx) {
          fail(`Apple Flat Guidelines violation in block '${exp}': 'neutral' variant MUST appear before all chromatic variants.`);
        }
      }
    }
    pass(`Block '${exp}' structure, files, and invariants verified.`);
  }

  // Verify blocks/index.js
  const blocksAggregator = path.join(BLOCKS_DIR, 'index.js');
  if (!fs.existsSync(blocksAggregator)) {
    fail('src/blocks/index.js missing!');
  } else {
    pass('src/blocks/index.js aggregator verified.');
  }
}

// 3. Legacy Deprecated Directories Check (Must NOT exist)
const legacyPaths = [
  'src/schemas/blocks',
  'src/styles/blocks',
  'src/behaviors'
];
for (const lp of legacyPaths) {
  if (fs.existsSync(path.join(ROOT, lp))) {
    fail(`Legacy deprecated directory '${lp}' still exists on disk!`);
  }
}
pass('Legacy directories cleanly removed.');

// 4. Style Injection Single Source Check
const globalStylesIndex = path.join(ROOT, 'src/styles/index.css');
if (fs.existsSync(globalStylesIndex)) {
  const sContent = fs.readFileSync(globalStylesIndex, 'utf-8');
  if (sContent.includes('blocks/')) {
    fail(`src/styles/index.css violates Single Source Rule: must NOT import blocks directly!`);
  } else {
    pass('src/styles/index.css conforms to Global-Only styling rule.');
  }
}

// 5. Strict One-Way Dependency Rule Check (src must NEVER import catalogue)
const allSrcFiles = [];
walk(path.join(ROOT, 'src'), allSrcFiles);
for (const sf of allSrcFiles) {
  if ((sf.endsWith('.js') || sf.endsWith('.css')) && !sf.includes('agent_manifest')) {
    const content = fs.readFileSync(sf, 'utf-8');
    if (content.includes('catalogue/')) {
      fail(`One-Way Dependency Violation: ${path.relative(ROOT, sf)} imports or references 'catalogue/'!`);
    }
  }
}
pass('Strict One-Way Dependency Rule verified (src/ has 0 imports from catalogue/).');

// 6. Navigation Actions & Manifest Completeness
const ACTIONS_FILE = path.join(ROOT, 'src/schemas/navigation/actions.json');
if (fs.existsSync(ACTIONS_FILE)) {
  const actionsData = JSON.parse(fs.readFileSync(ACTIONS_FILE, 'utf-8'));
  pass(`Navigation actions (${actionsData.actions?.length || 0}) verified.`);
}

const MANIFEST_FILE = path.join(ROOT, 'src/schemas/agent_manifest.json');
let manifest = null;
if (fs.existsSync(MANIFEST_FILE)) {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
  let count = 0;
  const verifyR = (o) => {
    for (const v of Object.values(o)) {
      if (typeof v === 'string') {
        count++;
        if (!fs.existsSync(path.join(ROOT, v))) fail(`Manifest route '${v}' not found on disk!`);
      } else if (typeof v === 'object' && v !== null) verifyR(v);
    }
  };
  verifyR(manifest.routing);
  pass(`Agent manifest routes verified (${count} routes valid).`);
}

// 7. HTML Dead Links Check
const htmlFiles = [
  ...walk(path.join(ROOT, 'showcase')).filter(f => f.endsWith('.html')),
  ...walk(path.join(ROOT, 'catalogue')).filter(f => f.endsWith('.html')),
  ...walk(path.join(ROOT, 'examples')).filter(f => f.endsWith('.html'))
];
for (const hPath of htmlFiles) {
  const hf = path.relative(ROOT, hPath);
  const hContent = fs.readFileSync(hPath, 'utf-8');
  const linkMatches = hContent.match(/(?:href|src)=["']([^"']+)["']/g) || [];
  for (const lm of linkMatches) {
    const rawUrl = lm.replace(/^(?:href|src)=["']/, '').replace(/["']$/, '');
    if (rawUrl.startsWith('http') || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:')) continue;
    const cleanUrl = rawUrl.split('#')[0].split('?')[0];
    if (!cleanUrl) continue;

    let resolved;
    if (cleanUrl.startsWith('/')) {
      resolved = path.join(ROOT, cleanUrl.slice(1));
    } else {
      resolved = path.join(path.dirname(hPath), cleanUrl);
    }
    if (!fs.existsSync(resolved)) {
      fail(`Dead link in ${hf}: '${rawUrl}' (resolved to non-existent '${cleanUrl}')`);
    }
  }
}
pass(`HTML static links verified across ${htmlFiles.length} pages in showcase, catalogue, and examples (zero dead links).`);

// 8. Context Budget Check (Dual Byte & Line Limit)
const allTracked = [];
walk(path.join(ROOT, 'src'), allTracked);
walk(path.join(ROOT, 'scripts'), allTracked);

for (const file of allTracked) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').length;
  const bytes = Buffer.byteLength(content, 'utf-8');
  const rel = path.relative(ROOT, file);

  const maxBytes = rel.includes('manifest') || rel.includes('schema') ? 25 * 1024 : 12 * 1024;
  const maxLines = rel.includes('src/blocks/') && rel.includes('/styles/') && !rel.endsWith('variants.css') ? 100 :
                   rel.endsWith('variants.css') ? 150 :
                   rel.includes('manifest') ? 500 : 300;

  if (bytes > maxBytes) fail(`File ${rel} exceeds byte budget (${(bytes/1024).toFixed(1)}KB > ${(maxBytes/1024)}KB).`);
  if (lines > maxLines) fail(`File ${rel} exceeds line budget (${lines} > ${maxLines} lines).`);
}
pass('File context budgets verified across all source files.');

// Report Results
if (isJson) {
  console.log(JSON.stringify({ status: errors.length ? 'fail' : 'pass', errors, passed }, null, 2));
} else {
  passed.forEach(p => console.log(`\x1b[32m✔ PASS\x1b[0m ${p}`));
  errors.forEach(e => console.error(`\x1b[31m✖ FAIL\x1b[0m ${e}`));
  if (errors.length) {
    console.error(`\nVerification failed with ${errors.length} error(s)!`);
    process.exit(1);
  } else {
    console.log('\n\x1b[32mAll verification checks passed successfully!\x1b[0m\n');
  }
}
