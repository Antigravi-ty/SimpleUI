#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  console.error('Usage: node scripts/create_block.js <block_name> [--prefix=ui-custom] [--elements=elem1,elem2]');
  process.exit(1);
}

const blockName = args[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
const pascalName = blockName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
let prefix = `ui-${blockName}`, customElements = [];

for (const arg of args.slice(1)) {
  if (arg.startsWith('--prefix=')) prefix = arg.split('=')[1];
  if (arg.startsWith('--elements=')) customElements = arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean);
}

const blockDir = path.join(ROOT, 'src/blocks', blockName);
const stylesDir = path.join(blockDir, 'styles');
const elemDir = path.join(stylesDir, 'elements');
const schemaFile = path.join(blockDir, 'schema.json');

if (fs.existsSync(blockDir)) {
  console.error(`Error: Block '${blockName}' already exists at src/blocks/${blockName}!`);
  process.exit(1);
}
fs.mkdirSync(elemDir, { recursive: true });

// 1. Generate Block Schema
const elementsSchema = [
  { name: "standard", label: "Standard", selector: "", defaultText: pascalName, template: `<div class="{classes}" {attributes}>{slot:default}</div>` }
];
for (const elem of customElements) {
  elementsSchema.push({
    name: elem, label: elem.charAt(0).toUpperCase() + elem.slice(1), selector: `__${elem}`, defaultText: elem,
    template: `<div class="{classes}" {attributes}>{slot:default}</div>`
  });
}

const schemaData = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "block": blockName, "prefix": prefix, "description": `Decoupled atomic ${blockName} component`,
  "sizes": ["sm", "md", "lg"], "defaultSize": "md",
  "props": { "disabled": { "type": "boolean", "default": false } },
  "events": ["click"], "modifiers": ["neutral", "primary", "disabled"],
  "stateMappings": { "disabled": { "attributes": "disabled", "aria-disabled": "true" } },
  "elements": elementsSchema
};
fs.writeFileSync(schemaFile, JSON.stringify(schemaData, null, 2) + '\n');

// 2. Generate Atomic CSS Files
fs.writeFileSync(path.join(stylesDir, 'base.css'), `.${prefix} {
  display: inline-flex; align-items: center; justify-content: center;
  font-family: inherit; font-weight: var(--ui-weight-medium);
  border-radius: var(--ui-radius-md); border: 1px solid transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease; user-select: none;
}
.${prefix}:focus-visible { outline: 2px solid var(--ui-color-primary); outline-offset: 2px; }
`);

fs.writeFileSync(path.join(stylesDir, 'sizes.css'), `.${prefix}--sm { padding: var(--ui-space-1) var(--ui-space-2); font-size: var(--ui-font-sm); }
.${prefix}--md { padding: var(--ui-space-2) var(--ui-space-3); font-size: var(--ui-font-base); }
.${prefix}--lg { padding: var(--ui-space-3) var(--ui-space-4); font-size: var(--ui-font-lg); }
`);

fs.writeFileSync(path.join(stylesDir, 'variants.css'), `.${prefix}--neutral {
  background-color: var(--ui-color-neutral-100); color: var(--ui-text-main); border-color: var(--ui-border-subtle);
}
.${prefix}--primary { background-color: var(--ui-color-primary); color: var(--ui-color-primary-contrast); }
.${prefix}--disabled, .${prefix}:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
`);

let elementImports = '';
const elementsManifest = {};
for (const elem of customElements) {
  fs.writeFileSync(path.join(elemDir, `${elem}.css`), `.${prefix}__${elem} { display: inline-flex; align-items: center; }\n`);
  elementImports += `@import './elements/${elem}.css';\n`;
  elementsManifest[elem] = `src/blocks/${blockName}/styles/elements/${elem}.css`;
}

fs.writeFileSync(path.join(stylesDir, 'index.css'), `@import './base.css';\n@import './sizes.css';\n@import './variants.css';\n${elementImports}`);

// 3. Generate Behavior
fs.writeFileSync(path.join(blockDir, 'behavior.js'), `export function init${pascalName}(element) {
  if (element._uiBound) return;
  element._uiBound = true;
  element._uiCleanup = () => { delete element._uiBound; };
}
`);

// 4. Generate Block index.js
fs.writeFileSync(path.join(blockDir, 'index.js'), `import schema from './schema.json';
import './styles/index.css';
import { init${pascalName} } from './behavior.js';

export { init${pascalName} };
export default {
  name: '${blockName}',
  schema,
  behavior: init${pascalName},
  selector: '.${prefix}'
};
`);

// 5. Update agent_manifest.json
const manifestPath = path.join(ROOT, 'src/schemas/agent_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
manifest.routing.blocks[blockName] = {
  entry: `src/blocks/${blockName}/index.js`,
  schema: `src/blocks/${blockName}/schema.json`,
  base: `src/blocks/${blockName}/styles/base.css`,
  sizes: `src/blocks/${blockName}/styles/sizes.css`,
  variants: `src/blocks/${blockName}/styles/variants.css`,
  elements: elementsManifest
};
if (!manifest.routing.behaviors) manifest.routing.behaviors = {};
manifest.routing.behaviors[blockName] = `src/blocks/${blockName}/behavior.js`;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\x1b[32m✔ Successfully scaffolded block '${blockName}' under src/blocks/${blockName}\x1b[0m`);
