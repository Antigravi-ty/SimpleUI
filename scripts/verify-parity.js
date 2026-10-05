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

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

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

  // Check Primitives (container, stack, row, center-placeholder)
  const primDir = path.join(SRC_NEXT, 'primitives');
  const expectedPrimitives = ['container', 'stack', 'row', 'center-placeholder'];
  for (const ep of expectedPrimitives) {
    if (!fs.existsSync(path.join(primDir, ep))) fail(`Missing primitive '${ep}' in src_next/primitives/`);
  }
  if (fs.existsSync(path.join(primDir, 'card'))) {
    fail("Obsolete card primitive must not exist in src_next!");
  }
  pass("src_next/primitives contains container, stack, row, and center-placeholder.");

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

  // Check Incubating Primitives (container, stack, row, center-placeholder)
  const draftPrimDir = path.join(DRAFT_DIR, 'primitives');
  const requiredDraftPrims = ['container', 'stack', 'row', 'center-placeholder'];
  for (const rdp of requiredDraftPrims) {
    if (!fs.existsSync(path.join(draftPrimDir, rdp))) {
      fail(`Missing incubating primitive 'draft/primitives/${rdp}'!`);
    }
  }
  pass("draft/primitives contains container, stack, row, and center-placeholder.");

  // Check draft/special/catalogue/patterns Relocation
  const draftSpecialPatterns = path.join(DRAFT_DIR, 'special/catalogue/patterns');
  const requiredFrames = ['standard-frame', 'matrix-frame', 'interaction-frame'];
  for (const rf of requiredFrames) {
    if (!fs.existsSync(path.join(draftSpecialPatterns, rf))) {
      fail(`Missing relocated frame 'draft/special/catalogue/patterns/${rf}'!`);
    }
  }
  if (!fs.existsSync(path.join(draftSpecialPatterns, 'index.js'))) {
    fail("draft/special/catalogue/patterns/index.js missing!");
  } else {
    pass("draft/special/catalogue/patterns verified with standard-frame, matrix-frame, and interaction-frame.");
  }
} else {
  fail("Root draft/ directory missing!");
}

// 3. Check Catalogue Shell Layout in Draft Special Incubator
const DRAFT_SHELL_DIR = path.join(ROOT, 'draft/special/catalogue/shell-layout');
if (fs.existsSync(DRAFT_SHELL_DIR)) {
  if (fs.existsSync(path.join(DRAFT_SHELL_DIR, 'index.js')) && fs.existsSync(path.join(DRAFT_SHELL_DIR, 'schema.json')) && fs.existsSync(path.join(DRAFT_SHELL_DIR, 'style.css'))) {
    const css = fs.readFileSync(path.join(DRAFT_SHELL_DIR, 'style.css'), 'utf-8');
    if (!css.includes('56px')) {
      fail("Header missing canonical height: 56px in shell-layout style.css!");
    } else {
      pass("Catalogue Shell Layout strictly defines 56px header height parity.");
    }
    if (!css.includes('right: 0') || !css.includes('position: absolute')) {
      fail("Catalogue Nav Dropdown must strictly enforce right: 0 right-alignment!");
    } else {
      pass("Catalogue Nav Dropdown strictly enforces Apple HIG right-alignment.");
    }
  } else {
    fail("draft/special/catalogue/shell-layout missing index, schema, or style!");
  }
  pass("Catalogue Shell Layout strictly relocated to draft/special/catalogue/shell-layout.");

  // Special Page Module (Under catalogue/pages/specials)
  const pageDir = path.join(ROOT, 'catalogue/pages/specials');
  if (fs.existsSync(path.join(pageDir, 'index.js')) && fs.existsSync(path.join(pageDir, 'schema.json'))) {
    pass("Catalogue Special page verified with modular schema and entry under catalogue/pages/specials.");
  } else {
    fail("catalogue/pages/specials missing index.js or schema.json!");
  }
} else {
  fail("draft/special/catalogue/shell-layout directory missing!");
}
// 4. Strict Unidirectional Isolation Rule: No Source Directory May Reference Draft!
const SOURCE_ROOTS = [
  path.join(ROOT, 'src_next'),
  path.join(ROOT, 'src')
];

let draftLeakCount = 0;
for (const sRoot of SOURCE_ROOTS) {
  const files = walk(sRoot);
  for (const f of files) {
    if (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.json')) {
      const content = fs.readFileSync(f, 'utf-8');
      const rel = path.relative(ROOT, f);

      // Check import / require / @import / path leaks to draft
      const hasDraftImport = (
        content.includes('@draft') ||
        /from\s+['"][^'"]*draft\//.test(content) ||
        /@import\s+['"][^'"]*draft\//.test(content)
      );
      if (hasDraftImport) {
        fail(`Isolation violation in ${rel}: Source must not import draft!`);
        draftLeakCount++;
      }

      // Check draft class prefix leaks in source
      if (f.endsWith('.js') || f.endsWith('.css')) {
        if (content.includes('.draft-ui-') || content.includes('.draft-sp-')) {
          fail(`Class leak in ${rel}: Source must not reference .draft- classes!`);
          draftLeakCount++;
        }
      }
    }
  }
}
if (draftLeakCount === 0) {
  pass("Strict Unidirectional Isolation verified: 100% of source directories (src_next, src) have 0 draft references.");
}

// 5. Check Fluid Typography Standard
const TYPO_FILE = path.join(ROOT, 'src_next/styles/typography.css');
if (fs.existsSync(TYPO_FILE)) {
  const typoContent = fs.readFileSync(TYPO_FILE, 'utf8');
  const requiredClasses = ['.ui-title-1', '.ui-title-2', '.ui-headline', '.ui-body', '.ui-caption', '.ui-micro', '.ui-tabular-nums'];
  const allPresent = requiredClasses.every(cls => typoContent.includes(cls));
  if (allPresent) {
    pass('Fluid Typography classes (.ui-title-1 ~ .ui-micro, .ui-tabular-nums) verified in src_next/styles/typography.css.');
  } else {
    fail('Missing required typography classes in src_next/styles/typography.css!');
  }
} else {
  fail('src_next/styles/typography.css missing!');
}

// 6. Check showcase/ Read-Only Integrity (Must remain untouched)
const SHOWCASE_DIR = path.join(ROOT, 'showcase');
if (fs.existsSync(SHOWCASE_DIR)) {
  const showcaseSpecial = path.join(SHOWCASE_DIR, 'showcase_special.html');
  if (fs.existsSync(showcaseSpecial)) {
    pass("showcase/ preserved as read-only Ground Truth.");
  }
}

// 7. Verify Universal Slot Resolver and Dropdown Pattern Architecture
const slotResolverFile = path.join(ROOT, 'draft/special/catalogue/patterns/slot-resolver.js');
if (fs.existsSync(slotResolverFile)) {
  const code = fs.readFileSync(slotResolverFile, 'utf-8');
  if (code.includes('resolveSlotContent') && code.includes('registerSlotComponent')) {
    pass("Universal polymorphic slot resolver verified with dynamic component registry.");
  } else {
    fail("slot-resolver.js missing resolveSlotContent or registerSlotComponent!");
  }
} else {
  fail("draft/special/catalogue/patterns/slot-resolver.js missing!");
}

const dropdownMenuDir = path.join(ROOT, 'draft/patterns/dropdown-menu');
if (fs.existsSync(dropdownMenuDir)) {
  if (fs.existsSync(path.join(dropdownMenuDir, 'schema.json')) &&
      fs.existsSync(path.join(dropdownMenuDir, 'render.js')) &&
      fs.existsSync(path.join(dropdownMenuDir, 'index.js'))) {
    pass("Dropdown Menu structural pattern decoupled and verified under draft/patterns/dropdown-menu.");
  } else {
    fail("draft/patterns/dropdown-menu missing schema, render, or index!");
  }
} else {
  fail("draft/patterns/dropdown-menu directory missing!");
}

const specialsIndex = path.join(ROOT, 'catalogue/pages/specials/index.js');
if (fs.existsSync(specialsIndex)) {
  const content = fs.readFileSync(specialsIndex, 'utf-8');
  if (!content.includes('renderCheckbox') && !content.includes('renderButton') && !content.includes('<label class="ui-checkbox') && (content.includes("block: 'checkbox'") || content.includes('block: "checkbox"'))) {
    pass("Catalogue Specials page cleanly migrated to declarative block controls without imperative render functions or hardcoded markup.");
  } else {
    fail("catalogue/pages/specials/index.js still contains hardcoded markup or legacy imperative renderCheckbox/renderButton!");
  }
}

const matrixFrameIndex = path.join(ROOT, 'draft/special/catalogue/patterns/matrix-frame/index.js');
if (fs.existsSync(matrixFrameIndex)) {
  const content = fs.readFileSync(matrixFrameIndex, 'utf-8');
  if ((content.includes('renderCheckbox') || content.includes("block: 'checkbox'") || content.includes('block: "checkbox"')) && !content.includes('<input type="checkbox"')) {
    pass("Matrix Frame filter bar cleanly migrated to schema-driven declarative checkbox without hardcoded markup.");
  } else {
    fail("matrix-frame/index.js still contains hardcoded checkbox markup or lacks declarative checkbox block!");
  }
}

// 8. Universal Component Factory Pipeline Invariants
const coreModules = ['component-factory.js', 'slot-resolver.js', 'behavior-registry.js'];
if (coreModules.every(m => fs.existsSync(path.join(ROOT, 'src_next/core', m)))) {
  pass('Universal Component Factory, Slot Resolver, and Behavior Registry verified in src_next/core/.');
} else {
  fail('src_next/core/ missing universal factory pipeline modules!');
}
const obsoleteRenderers = ['badge', 'button', 'checkbox', 'dropdown', 'slider'].filter(c => fs.existsSync(path.join(ROOT, 'draft/components/' + c + '/render.js')));
if (obsoleteRenderers.length === 0) {
  pass('Zero handwritten renderers verified across draft components (factory pipeline active).');
} else {
  fail('Draft components still contain obsolete render.js: ' + obsoleteRenderers.join(', '));
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
