# SimpleUI - Agent Development & Contribution Guide

This guide defines the atomic decoupled architecture, directory semantics, and fast routing workflows for AI Agents.

---

## 1. Non-Negotiable Core Architectural Rules

1. **Strict One-Way Dependency Rule**:
   - `catalogue -> src_next/{components, core, tokens, patterns, styles}` and `draft/**`.
   - `catalogue/` is the showroom consumption layer and is fully decoupled from legacy `src/`.
   - Production source libraries (`src/` and `src_next/`) are **STRICTLY PROHIBITED** from importing or referencing `catalogue/` (automated verification asserts zero reverse imports).

2. **Block Colocation & Single-Folder Rule**:
   - Every block lives strictly in its own isolated directory:
     - Incubating / draft components: `draft/components/<name>/` (`index.js`, `schema.json`, `styles/`, etc.)
     - Solidified production components: `src_next/components/<name>/` (`index.js`, `schema.json`, `styles/`, etc.)
     - Legacy components: `src/blocks/<name>/` (`index.js`, `schema.json`, `behavior.js`, `styles/`)
   - When modifying a component, **ONLY** touch files within its mapped directory. Do NOT grep or modify global files.
   - Adding a new component = create the component folder + `index.js`. **Zero modification to central files**.

3. **Style Injection Single Source Rule**:
   - Each block encapsulates its own CSS via `import './styles/index.css'`.
   - `src/styles/index.css` and `src_next/styles/index.css` ONLY import design tokens and global baseline styles (`layout.css`, `motion.css`, `viewport.css`). They are strictly prohibited from aggregating block styles.

4. **Strict Source-Draft Isolation Rule**:
   - All source libraries (`src_next/**`, `src/**`) represent solidified production source code.
   - Source modules are **STRICTLY PROHIBITED** from importing or referencing `draft/**` or declaring `.draft-` prefixed class names (verified automatically in CI via `npm run test:parity`).
   - Page viewports (`catalogue/pages/**`) represent the showroom consumption layer and MAY consume both solidified sources and incubating drafts.

---

## 2. Fast Modification Routing Matrix (Zero Attention Dilution)

When fulfilling a specific user request, look up `src/schemas/agent_manifest.json` or run `npm run route "<keyword>" [--json]` and ONLY touch the mapped single-purpose file:

| Intention / Request | Sole Target Path | Verification |
|---|---|---|
| Change a global color, font, or spacing | `src/schemas/tokens/colors.json` | `npm run build:tokens && npm test` |
| Change motion timing or easing curve | `src/schemas/tokens/motion.json` | `npm run build:tokens && npm test` |
| Change control dimensions (height, thumb) | `src/schemas/tokens/components.json` | `npm run build:tokens && npm test` |
| Change layout primitives (stack, menu, grid) | `src/styles/layout.css` | `npm test` |
| Change morph container / transition style | `src/styles/motion.css` | `npm test` |
| Change block overall base style (e.g. button) | `draft/components/<block>/styles/base.css` or `src_next/components/<block>/styles/base.css` | `npm test && npm run test:parity` |
| Change block sizes | `draft/components/<block>/styles/sizes.css` or `src_next/components/<block>/styles/sizes.css` | `npm test && npm run test:parity` |
| Change block color/subtle variants | `draft/components/<block>/styles/variants.css` or `src_next/components/<block>/styles/variants.css` | `npm test && npm run test:parity` |
| Change a specific element (e.g. thumb, track) | `draft/components/<block>/styles/elements/<element>.css` or `src_next/...` | `npm test && npm run test:parity` |
| Change component schema / props / events | `draft/components/<block>/schema.json` or `src_next/components/<block>/schema.json` | `npm test && npm run test:parity` |
| Change component headless interaction logic | `draft/components/<block>/behavior.js` or `src_next/components/<block>/behavior.js` | `npm test && npm run test:parity` |
| Change core render engine or composer | `src_next/core/engine.js` / `page-composer.js` | `npm test && npm run test:parity` |
| Catalogue SPA Shell Layout | `draft/special/catalogue/shell-layout/index.js` / `schema.json` / `style.css` | `npm test && npm run test:parity` |
| Catalogue Stage & Application Entry | `catalogue/main.js` / `catalogue/index.html` | `npm test && npm run test:parity` |

---

## 3. Block Structural Standard

Every block under `src/blocks/<name>/`, `src_next/components/<name>/`, or `draft/components/<name>/` strictly follows this anatomy:
```text
<component-root>/
├── index.js             # Unique entry point (imports schema, styles, behavior)
├── schema.json          # Block JSON Schema (attributes, modifiers, elements, props)
├── behavior.js          # Headless interaction binding (if interactive)
└── styles/
    ├── index.css        # Aggregates base, sizes, variants, elements
    ├── base.css         # Structural geometry, flex/grid, focus outline
    ├── sizes.css        # sm / md / lg padding and typography
    ├── variants.css     # neutral (leftmost!), primary, danger, etc.
    └── elements/        # Atomic sub-element stylesheets
```

---

## 4. Verification & Testing

Always verify full compliance before committing:
```bash
npm run build:tokens
npm test
npm run test:parity
npm run build
```
