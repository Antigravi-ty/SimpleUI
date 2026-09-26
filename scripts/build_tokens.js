import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCHEMAS_TOKENS_DIR = path.join(ROOT, 'src/schemas/tokens');
const TOKENS_DIR = path.join(ROOT, 'src_next/tokens');

function compile() {
  if (!fs.existsSync(TOKENS_DIR)) {
    fs.mkdirSync(TOKENS_DIR, { recursive: true });
  }

  const tokenFiles = fs.readdirSync(SCHEMAS_TOKENS_DIR).filter(f => f.endsWith('.json'));
  const importedFiles = ['reset.css'];

  for (const file of tokenFiles) {
    const raw = fs.readFileSync(path.join(SCHEMAS_TOKENS_DIR, file), 'utf-8');
    const json = JSON.parse(raw);
    const category = json.category || path.basename(file, '.json');
    const outCssFile = `${category}.css`;

    let rootVars = [];
    let darkVars = [];

    for (const [key, data] of Object.entries(json.tokens || {})) {
      const varName = data.variable || `--ui-${category}-${key}`;
      const defaultVal = data.value || data.default || '';
      rootVars.push(`  ${varName}: ${defaultVal};`);

      if (data.dark) {
        darkVars.push(`  ${varName}: ${data.dark};`);
      }
    }

    let css = `/* Generated from src/schemas/tokens/${file} - DO NOT EDIT MANUALLY */\n`;
    css += `:root {\n${rootVars.join('\n')}\n}\n`;

    if (darkVars.length > 0) {
      css += `\n[data-theme="dark"] {\n${darkVars.join('\n')}\n}\n`;
    }

    fs.writeFileSync(path.join(TOKENS_DIR, outCssFile), css, 'utf-8');
    importedFiles.push(outCssFile);
    console.log(`Compiled ${file} -> src_next/tokens/${outCssFile}`);
  }

  // Generate index.css
  let indexCss = `/* SimpleUI Design Tokens Aggregator (Source Next) */\n`;
  for (const imp of importedFiles) {
    indexCss += `@import './${imp}';\n`;
  }
  fs.writeFileSync(path.join(TOKENS_DIR, 'index.css'), indexCss, 'utf-8');
  console.log(`Generated src_next/tokens/index.css`);
}

compile();
