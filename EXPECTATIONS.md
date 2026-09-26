# SimpleUI — Design & Behavioral Expectations

This document outlines core intended architectural and behavioral contracts across SimpleUI components and layouts.

---

## 1. Dropdown Menus: Strict Mutual Exclusivity (Intended Design)

- **Specification**: All dropdown menus across the entire document/page are **strictly mutually exclusive** (`mutually exclusive`).
- **Behavior**: Opening any dropdown menu (`.ui-dropdown`) immediately triggers the closure of any other currently opened dropdown menu across the document.
- **Rationale & Intent**: Under Apple Human Interface Guidelines (HIG) and desktop windowing paradigms, having multiple unpinned context/action menus open simultaneously creates visual clutter, introduces competing focus states, breaks keyboard navigation traps (`Escape`, arrow keys), and degrades the user experience. Therefore, single-active-menu exclusivity is an **intended, foundational design constraint**.

---

## 2. Checkbox Default States

- **Standard Checkbox** (`.ui-checkbox` with label): Defaults to **checked** (`checked = true`, `.ui-checkbox--checked`). This follows affirmative opt-in guidelines for user-facing consent and feature toggles in modern workflows.
- **Standalone Checkbox** (`.ui-checkbox--standalone`): Defaults to **unchecked** (`checked = false`) so that table rows, bulk operation bars, or raw selectors start from an unselected baseline.

---

## 3. Slider Numeric Input Detail

- **Numeric Input Field** (`.ui-slider__num-input`): The native browser up/down spinner arrows (`::-webkit-outer-spin-button`, `::-webkit-inner-spin-button`, `-moz-appearance: textfield`) are intentionally **hidden/removed**.
- **Rationale**: Direct numerical typing paired with direct thumb sliding delivers an uncluttered, high-precision control without distracting vertical spin arrows.

---

## 4. Top-Right Navigation Dropdown

- **Alignment**: Must be strictly **right-aligned** (`right-aligned`), extending towards the left into available screen space (`right: 0`, `left: auto`), preventing horizontal viewport clipping.
- **Text & Padding**: The trigger and menu items have generous left and right padding (`padding: 0 var(--ui-space-3)`).
- **Navigation Scope**: Strictly switches between the four unified presentation layers:
  1. **Components** (`/index.html`)
  2. **Widgets** (`showcase/structural_patterns.html`)
  3. **Workspaces** (`showcase/viewport_paradigms.html`)
  4. **Animations** (`showcase/animations.html`)
- **Self-Navigation Interception**: Clicking the currently active view will **never** refresh or re-navigate the page (`preventDefault`), preserving local state smoothly.

---

## 5. Selective Card & Selection Paradigms

- **Single Selection (Mutually Exclusive)**: When configured in radio-like mode (`data-selection-mode="single"` or `role="radiogroup"`), selective cards within the group are mutually exclusive (e.g. 3-choose-1). Selecting one unselects all sibling options.
- **Multi-Selection**: When in default multi-select mode, individual cards toggle independently.
- **Layout Adaptability**:
  - **Auto Layout** (`.ui-selective-group--auto`): Cards wrap naturally based on available width; if 5 fit on row 1, the 6th moves to row 2.
  - **Balanced Layout** (`.ui-selective-group--balanced`): The grid prioritizes balanced symmetry (e.g., 3×2 or 2×3 for 6 cards), deliberately preventing an awkward single orphaned card from dangling alone on the final row.

---

## 6. Reference Designs

- **Access Point**: Dedicated reference designs are decoupled from top-level showcase navigation and are accessed exclusively from the bottom-left sidebar link (`want to view more demos? ↗`).
- **Structure**: The reference designs page is an uncluttered directory list of scenario links with directional indicators (`↗`), without heavy embedded previews.
- **History Back Navigation**: Both the reference designs directory and dedicated demo pages (`floating_window`, `multi_level_menu`) feature top-left back buttons powered by native browser history (`window.history.back()`).

---

## 7. 3-Stage Widget Panel & Accessible Description

- **Structure**: Standard 3-stage container (`.ui-panel`):
  1. **Header**: Title, badge, and default top-left back button (`.ui-panel__back-btn`).
  2. **Content**: Slot for arbitrary controls, forms, or JSON sub-schemas.
  3. **Footer**: Live accessible description region (`.ui-panel__desc`, `aria-live="polite"`).
- **Dynamic Accessible Description**: When the user hovers (`mouseenter`) or focuses (`focusin`) any control with `data-description` or `aria-description`, the footer description dynamically updates to explain the target. Moving pointer away restores the default guidance text.
- **Flexible Action Placement**: Supports placing an optional back button in the footer (`.ui-panel__footer-back`) for workflows requiring bottom actions.
- **Keyboard Navigation**: Pressing `Escape` triggers the panel back behavior natively.

---

## 8. Reactive Numerical State & Event Delegation Bus

- **State Externalization**: Maintain application values in an in-memory reactive store (`SimpleUIStore`), avoiding query overhead on hidden or dynamically generated DOM trees.
- **Global Event Delegation**: A single root listener captures bubbling events from any control with `data-bind="<key>"`, automatically synchronizing store values.
- **No `display: none` Pre-rendering**: Avoid pre-mounting hundreds of offscreen DOM menus. Store them as compact JSON schemas and mount/unmount lazily on demand.

---

## 9. Dynamic Virtual Canvas Scaling & 18:9 Safe Area Layout (Intended Design & HIG Trade-off)

- **Specification**:
  - The UI layout is anchored to a virtual projection canvas (`Wrender`), derived from the effective safe display area (`Wsafe = Wwindow - insets - safeAreaMargin`).
  - **18:9 Maximum Aspect Ratio Constraint**: If the safe display area is wider than 18:9 (`Wsafe > Hsafe * 2.0`), the rendering zone is clamped to `Wrender = Hsafe * 2.0` and centered horizontally with symmetric pillarboxing.
  - **Portrait Orientation Interception**: If the safe display is taller than wide (`Wsafe < Hsafe`, i.e., vertical aspect ratio < 1.0), the page is intercepted with a full-screen warning modal ("Use it at your own risk") dismissible only via an explicit Danger Subtle push-button (`.ui-btn--danger-subtle`, "I got it").
  - **Dynamic Root Scale Factor**: Scale is strictly width-dependent: `ScaleFactor = (Wrender / 1920) * (UserScale / 100)`. UI elements dynamically scale proportionally, decoupling layout geometry from vertical chin discrepancies.
  - **Interface Safe Margin Offset**: Supports a margin adjustment between `-5%` and `+10%` around hardware display borders.
  - **Accessibility Compensation**: The top-right header provides a drag-only UI Scale Slider (25% to 200%, with manual text input disabled). On first launch, automated heuristic detection probes `systemFontScale` and `zoomScale` to seed a personalized baseline scale.
- **Rationale & Intent (Departure from Apple HIG)**:
  - *Conflict*: Apple HIG specifies point-based (`pt`) fixed sizing paired with system Dynamic Type. Proportional width scaling can cause typography to deviate from fixed minimum point sizes.
  - *Specialized Industrial & Laptop Scenario*: Across modern laptop generations, physical screen widths remain identical (e.g., 1440px / 1920px) while transitioning from 16:9 to 16:10 aspect ratios via reduced bottom bezels ("chins"). Anchoring UI scale exclusively to width ensures identical visual sizing between 16:9 and 16:10 form factors, and eliminates physical size drift across 24-inch 1080P, 2K, and 4K displays.
  - *Deliberate Trade-off*: To guarantee unified physical ergonomics in specialized multi-display environments, SimpleUI makes a deliberate design trade-off by adopting a virtual canvas engine with user-controlled scale compensation in place of native OS Dynamic Type.

---

## 10. Panel & Container Background Hierarchy (Intended Design & HIG Alignment)

- **Specification**:
  - The footer region of standard 3-stage containers (`.ui-panel__footer`) strictly utilizes the secondary grouped surface token (`var(--ui-color-neutral-50)`), **never** the document page background (`var(--ui-bg-page)`).
  - On demonstration and showcase pages (`showcase/structural_patterns.html`), interactive widgets are hosted inside dedicated staging container cards (`.widgets-preview-card` with `.widgets-preview-card__stage`).
- **Rationale & Intent (HIG Conformance)**:
  - Under Apple macOS/iOS Human Interface Guidelines for panels, sheets, and dialogs, window bodies use primary surface (`var(--ui-bg-surface)`), while toolbars and footers use secondary grouped backgrounds (`var(--ui-color-neutral-50)`).
  - Using the outer document background (`var(--ui-bg-page)`) for container footers caused visual blending and border bleeding where the panel footer merged into the surrounding canvas.
  - Adopting `.widgets-preview-card` establishes clear visual layering: Page Canvas (`var(--ui-bg-page)`) → Showcase Card Surface (`var(--ui-bg-surface)`) → Preview Stage Well (`var(--ui-color-neutral-100)`) → Panel Window (`var(--ui-bg-surface)`) → Inset Footer (`var(--ui-color-neutral-50)`).

---

## 11. Live Preview Paradigm & Tab Shortcut Key (Intended Design & HIG Trade-off)

- **Specification**:
  - **Interaction Model**: Centered setting/inspector window can be toggled into a compact, right-center docked pill via the `Tab` key or explicit trigger buttons.
  - **Standardized 3-Stage Morph Animation**:
    1. **Stage 1 (Fade Out, 100ms)**: Window or dock content fades to opacity 0 (`.ui-morph-content--faded`).
    2. **Stage 2 (Container Morph, 150ms)**: DOM views switch while hidden. Container geometry morphs between center window (`width: 540px, height: 380px, left: 50%`) and right-center dock (`width: 195px, height: 42px, left: calc(100% - 24px)`) using Apple ease (`cubic-bezier(0.2, 0.8, 0.25, 1)`).
    3. **Stage 3 (Fade In, 100ms)**: New view content fades in smoothly.
  - **Dock Anatomy & Micro-interaction**:
    - The collapsed dock features a left chevron arrow (`←`), vertical separator line (`|`), "Live Preview" label, and `Tab` shortcut key pill.
    - **Hover Vitality**: Hovering the dock triggers a subtle leftward glide of the chevron arrow (`transform: translateX(-4px)`), providing intuitive affordance that expanding will open towards the center.
  - **Declarative Schema Generation**: The paradigm is fully declarative (`src/schemas/pages/live_preview.json`), allowing developers and agents to inject customized content while preserving standardized docking behavior.
- **Rationale & Intent (Departure from Apple HIG & Trade-off Analysis)**:
  - *Conflict*: Apple HIG and W3C WAI-ARIA strictly reserve the `Tab` key for focus traversal across interactive controls. Global hijacking of `Tab` risks interfering with standard keyboard accessibility and screen-reader focus loops.
  - *Specialized Canvas / Workstation Workflow*: In professional workstation environments (e.g. 3D viewports in Blender, canvas inspection in Final Cut Pro / Photoshop, HUD overlays in real-time simulations), `Tab` is the universally accepted industry standard for toggling tool overlays to inspect background canvas elements without distraction.
  - *Deliberate Trade-off & Guardrails*:
    1. `Tab` toggling is automatically inhibited when the user is actively focused on an editable text input or textarea.
    2. The shortcut binding is fully configurable via `shortcutKey` / `data-shortcut` (e.g. `Cmd+P`, `Escape`), enabling projects to adapt to accessibility requirements when deployed in non-canvas web contexts.

---

## 12. Textual Constraints & Semantic Slot Guidelines (文字约束与语义插槽规范)

- **Specification**:
  - **Universal System Actions (Buttons & Triggers)**: Interactive buttons strictly use `"Action"` (or fundamental system verbs like `"Done"`, `"Cancel"`, `"Back"`). Never domain-specific or commercial phrases like `"Submit Order"` or `"Pay Now"`.
  - **Selection Controls (Checkbox, Toggler, Radio)**: Option labels strictly use `"Option title"` (not situational descriptions like `"Enable feature"` or `"Remember me"`). This makes the semantic slot immediately self-evident.
  - **Structural Cards (Selective Card, Content Card)**: Title slot strictly uses `"Option Title"`, description slot strictly uses `"Relative description"`. For large spacious containers where visual typography density is tested, standard `"Lorem ipsum dolor sit amet, consectetur adipiscing elit."` is used. Commercial plan names (e.g., `"Pro Plan"`, `"Dedicated compute capacity"`) are strictly prohibited.
  - **Badges & Tags**: Status badges strictly use `"Badge"`, neutral status words (`"Active"`), or count badges (`"99+"`).
  - **Headings & Titles**: Default title slots strictly use `"Title"`.
  - **Content Bodies**: General container content slots use `"Custom content"` or `"Lorem ipsum dolor sit amet, consectetur adipiscing elit."`.
  - **Footers & Captions**: Auxiliary description slots strictly use `"Relative description"`.
  - **Underlined Text & Functional Links**: Use role-based neutral descriptors reflecting structural purpose (e.g., `"System reference link"`, `"View documentation"`).
- **Rationale & Intent**:
  - In a design system showcase, arbitrary marketing copy creates chromatic and cognitive noise.
  - Enforcing either **Universal System Actions** or **Neutral Semantic Slots** allows developers, reviewers, and AI agents to instantly identify which file, element, or slot governs a particular visual defect without navigating domain distractions.
