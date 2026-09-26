# SimpleUI - Agent Development & Contribution Guide

This guide defines the atomic decoupled architecture, directory semantics, and fast routing workflows for AI Agents.

---

## 1. Non-Negotiable Core Architectural Rules

1. **Strict One-Way Dependency Rule**:
   - `catalogue -> src/{blocks, core, tokens, navigation, styles}`.
   - `src/` is the core component and engine library. `src/` modules are **STRICTLY PROHIBITED** from importing or referencing `catalogue/` (automated verification asserts zero reverse imports).

2. **Block Colocation & Single-Folder Rule**:
   - Every block lives strictly in its own isolated directory: `src/blocks/<name>/` (`index.js`, `schema.json`, `behavior.js`, `styles/`).
   - When modifying a component, **ONLY** touch files within `src/blocks/<name>/`. Do NOT grep or modify global files.
   - Adding a new component = create `src/blocks/<name>/` folder + `index.js`. **Zero modification to central files**.

3. **Style Injection Single Source Rule**:
   - Each block's `index.js` encapsulates its own CSS via `import './styles/index.css'`.
   - `src/styles/index.css` ONLY imports design tokens and global baseline styles (`layout.css`, `motion.css`, `viewport.css`). It is strictly prohibited from aggregating block styles.

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
| Change block overall base style (e.g. button) | `src/blocks/<block>/styles/base.css` | `npm test` |
| Change block sizes | `src/blocks/<block>/styles/sizes.css` | `npm test` |
| Change block color/subtle variants | `src/blocks/<block>/styles/variants.css` | `npm test` |
| Change a specific element (e.g. thumb, track) | `src/blocks/<block>/styles/elements/<element>.css` | `npm test` |
| Change component schema / props / events | `src/blocks/<block>/schema.json` | `npm test` |
| Change component headless interaction logic | `src/blocks/<block>/behavior.js` | `npm test` |
| Change core render engine or composer | `src/core/engine.js` / `page-composer.js` | `npm test` |
| Catalogue SPA Shell Layout | `catalogue/schemas/shell.json` / `catalogue/specials/shell-layout.js` | `npm test` |
| Catalogue Stage & Application Entry | `catalogue/main.js` / `catalogue/index.html` | `npm test` |

---

## 3. Block Structural Standard

Every block under `src/blocks/<name>/` strictly follows this anatomy:
```text
src/blocks/<name>/
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
```
