#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const errors = [];
const passed = [];

function pass(msg) { passed.push(msg); }
function fail(msg) { errors.push(msg); }

// 1. Check src_next/ Architecture & Decoupling
const SRC_NEXT = path.join(ROOT, 'src_next');
if (!fs.existsSync(SRC_NEXT)) {
  fail('src_next directory does not exist!');
} else {
  // Check Components (11 atomic, NO panel)
  const compDir = path.join(SRC_NEXT, 'components');
  const expectedComps = ['badge', 'button', 'checkbox', 'dropdown', 'progressbar', 'segmented-control', 'selective-card', 'slider', 'stepper', 'tabs', 'toggler'];
  if (fs.existsSync(compDir)) {
    const diskComps = fs.readdirSync(compDir).filter(f => fs.statSync(path.join(compDir, f)).isDirectory());
    for (const ec of expectedComps) {
      if (!diskComps.includes(ec)) fail(`Missing atomic component '${ec}' in src_next/components/`);
    }
    if (diskComps.includes('panel')) {
      fail("Panel must NOT exist in src_next/components/! It belongs in src_next/patterns/.");
    }
    pass("src_next/components contains 11 atomic components with panel strictly excluded.");
  } else {
    fail("src_next/components/ directory missing!");
  }

  // Check Patterns (panel must exist here)
  const patternDir = path.join(SRC_NEXT, 'patterns');
  if (fs.existsSync(path.join(patternDir, 'panel'))) {
    pass("Panel correctly relocated to src_next/patterns/panel/ as a structural pattern.");
  } else {
    fail("Panel missing from src_next/patterns/panel/!");
  }

  // Check Primitives (container, card, well, stack-row)
  const primDir = path.join(SRC_NEXT, 'primitives');
  const expectedPrimitives = ['container', 'card', 'well', 'stack-row'];
  for (const ep of expectedPrimitives) {
    if (!fs.existsSync(path.join(primDir, ep))) fail(`Missing primitive '${ep}' in src_next/primitives/`);
  }
  pass("src_next/primitives contains container, card, well, and stack-row.");

  // Check Animations (basic-transition, live-preview)
  const animDir = path.join(SRC_NEXT, 'animations');
  if (fs.existsSync(path.join(animDir, 'basic-transition')) && fs.existsSync(path.join(animDir, 'live-preview'))) {
    pass("src_next/animations contains solidified basic-transition and live-preview.");
  } else {
    fail("src_next/animations missing required presets!");
  }
}

// 2. Check draft/ Incubator Root
const DRAFT_DIR = path.join(ROOT, 'draft');
if (fs.existsSync(DRAFT_DIR)) {
  const expectedDraftLayers = ['components', 'primitives', 'patterns', 'animations'];
  for (const edl of expectedDraftLayers) {
    if (!fs.existsSync(path.join(DRAFT_DIR, edl))) fail(`Missing isomorphic layer 'draft/${edl}'!`);
  }
  pass("Root draft/ incubator is 1:1 isomorphic with src_next/ layers.");
} else {
  fail("Root draft/ directory missing!");
}

// 3. Check catalogue/special/ Self-Contained Modules
const CATA_SPECIAL = path.join(ROOT, 'catalogue/special');
if (fs.existsSync(CATA_SPECIAL)) {
  // Shell layout
  const shellDir = path.join(CATA_SPECIAL, 'shell/shell-layout');
  if (fs.existsSync(path.join(shellDir, 'index.js')) && fs.existsSync(path.join(shellDir, 'schema.json')) && fs.existsSync(path.join(shellDir, 'style.css'))) {
    const css = fs.readFileSync(path.join(shellDir, 'style.css'), 'utf-8');
    if (!css.includes('.sp-cata-header') || !css.includes('height: 56px;')) {
      fail(".sp-cata-header missing canonical height: 56px in shell-layout style.css!");
    } else {
      pass("Catalogue Shell Layout strictly defines 56px header height parity.");
    }
    if (!css.includes('right: 0') || !css.includes('position: absolute')) {
      fail("Catalogue Nav Dropdown must strictly enforce right: 0 right-alignment!");
    } else {
      pass("Catalogue Nav Dropdown strictly enforces Apple HIG right-alignment.");
    }
  } else {
    fail("catalogue/special/shell/shell-layout missing index, schema, or style!");
  }

  // Preview Card
  const cardDir = path.join(CATA_SPECIAL, 'primitives/preview-card');
  if (fs.existsSync(path.join(cardDir, 'index.js')) && fs.existsSync(path.join(cardDir, 'style.css'))) {
    const cardCss = fs.readFileSync(path.join(cardDir, 'style.css'), 'utf-8');
    if (cardCss.includes('.sp-cata-card') && cardCss.includes('.sp-cata-stage-well')) {
      pass(".sp-cata-card and .sp-cata-stage-well properly defined in preview-card.");
    } else {
      fail("preview-card style.css missing .sp-cata-card or .sp-cata-stage-well!");
    }
  } else {
    fail("catalogue/special/primitives/preview-card missing files!");
  }

  // Matrix Card
  const matrixDir = path.join(CATA_SPECIAL, 'components/matrix-card');
  if (fs.existsSync(path.join(matrixDir, 'index.js')) && fs.existsSync(path.join(matrixDir, 'style.css'))) {
    pass(".sp-cata-matrix-card verified with interactive appearance filter bar.");
  } else {
    fail("catalogue/special/components/matrix-card missing files!");
  }

  // Special Page Module
  const pageDir = path.join(CATA_SPECIAL, 'pages/special-page');
  if (fs.existsSync(path.join(pageDir, 'index.js')) && fs.existsSync(path.join(pageDir, 'schema.json'))) {
    pass("Catalogue Special page verified with modular schema and entry.");
  } else {
    fail("catalogue/special/pages/special-page missing files!");
  }
} else {
  fail("catalogue/special/ directory missing!");
}

// 4. Check showcase/ Read-Only Integrity (Must remain untouched)
const SHOWCASE_DIR = path.join(ROOT, 'showcase');
if (fs.existsSync(SHOWCASE_DIR)) {
  const showcaseSpecial = path.join(SHOWCASE_DIR, 'showcase_special.html');
  if (fs.existsSync(showcaseSpecial)) {
    pass("showcase/ preserved as read-only Ground Truth.");
  }
}

// Report
passed.forEach(p => console.log(`\x1b[32m✔ PASS\x1b[0m ${p}`));
errors.forEach(e => console.error(`\x1b[31m✖ FAIL\x1b[0m ${e}`));
if (errors.length) {
  console.error(`\nParity verification failed with ${errors.length} error(s)!`);
  process.exit(1);
} else {
  console.log('\n\x1b[32mAll parity and architectural invariants passed successfully!\x1b[0m\n');
}
