# SimpleUI

> Ultra-modular, agent-friendly, zero-framework CSS & JSON-driven UI library following Apple pre-Liquid Glass flat design principles.

## Features

- **⚡ Zero Runtime Overhead**: Pure modern CSS + Vanilla JS. 0 KB framework baggage, maximum performance.
- **🍎 Apple Flat Design Alignment**: Conforms to Apple HIG pre-Liquid Glass flat aesthetics, prioritizing neutral grays (`neutral-0` to `neutral-900`) and minimal chromatic noise.
- **🎬 3-Stage Apple Morph Animation**: Decoupled container resizing with Apple ease damping curve (`cubic-bezier(0.2, 0.8, 0.25, 1)`) and content fade transitions (100ms fade out -> 150ms resize -> 100ms fade in).
- **🌓 Robust Light & Dark Mode**: Full theme parity with tokenized background surfaces, borders, and typography across all components and demos.
- **🤖 Agent-First Architecture**: Every atomic module is split into focused files under 70 lines. Minimal context pollution for LLMs.
- **🧩 Universal Slot & Sub-Schema Composition**: `PageComposer` builds pages and multi-level hierarchies from declarative JSON with `$ref` support.
- **🧭 Declarative Navigation & Action Router**: `UIRouter` executes native action primitives (`navigate`, `drilldown_push`, `drilldown_pop`, `class_toggle`, `morph_transition`, `set_text`, `sequence`) directly from `actions.json`.
- **📐 2D Matrix Showcase**: Dynamically maps `Elements × Modifiers` into interactive preview matrices automatically.
- **🎨 Design Tokens SSOT**: Extracted from utility semantics into CSS Variables with automated compilation via `npm run build:tokens`.
- **🛡️ Auto-Verification**: Automated consistency checker (`npm test`) validating that JSON schemas, CSS selectors, design tokens, and agent manifests remain 100% synchronized.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Run verification test
npm test

# 4. Build design tokens
npm run build:tokens

# 5. Build for production
npm run build

# 6. Scaffold a new atomic block
npm run create:block <name> --elements=header,body

# 7. Fast routing helper for agents
npm run route <keyword>
```

---

## Showcase & Interactive Pages

- **Components Showcase (2D Matrix)**: `showcase/components.html`
- **Showcase Special (Private Composites)**: `showcase/showcase_special.html`
- **Layout & Container Primitives**: `showcase/primitives.html`
- **Structural Patterns & Dropdown Menu**: `showcase/structural_patterns.html`
- **Apple 3-Stage Morph Animation Demo**: `showcase/animations.html`
- **Viewport Paradigms (Floating Window, Live Preview)**: `showcase/viewport_paradigms.html`
- **Developer Reference & State Bus**: `showcase/developer.html`
- **Curated Demos Gallery**: `showcase/examples.html`

---

## Documentation

- [Apple Design Guidelines](./APPLE_DESIGN_GUIDELINES.md)
- [Agent Development Guide](./AGENT_GUIDE.md)
