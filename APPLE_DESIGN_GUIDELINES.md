# Apple Design Guidelines (Pre-Liquid Glass Flat Era) & Interaction Standards

This document establishes the official design guidelines, interaction principles, and conflict resolution protocols for SimpleUI.

---

## 1. Visual Design Philosophy: Flat & Neutral

SimpleUI adheres to Apple's classic flat design era (pre-Liquid Glass / visionOS). The interface is unobtrusive, content-centric, and refined.

### 1.1 Neutral Color Palette Bias & Button Variant Hierarchy
- **Neutral Dominance & Zero-Saturation Rule**: The primary visual presentation strictly favors neutral grayscale tones (`--ui-color-neutral-0` through `neutral-900`, `--ui-bg-surface`, `--ui-border-subtle`).
  - **Zero-Saturation Constraint**: `neutral`, `outline`, and `ghost` variants MUST strictly employ zero-saturation grayscale styling (pure black, white, and grays). No chromatic dyes, color casts, or tinted hues may be introduced into neutral, outline, or ghost schemes unless explicitly dictated by platform accessibility needs.
  - **Color Tier Allocation**: Chromatic color tokens (`--ui-color-primary`, `--ui-color-success`, `--ui-color-warning`, `--ui-color-danger`) and their tinted counterparts (`*-subtle`) are strictly reserved for chromatic filled and subtle variants.
- **Control Hierarchy Order**: Controls prioritize `neutral` first, followed by `outline`, `ghost`, and only then chromatic colors.
- **Subtle (Tinted) Colors vs Filled Colors**:
  - In Apple HIG ([UIButtonConfiguration](https://developer.apple.com/documentation/uikit/uibuttonconfiguration)), button appearances are structured into **Filled** (prominent saturated solid background with contrast text) and **Tinted / Subtle** (soft translucent background tint with deep saturated foreground text).
  - SimpleUI implements both tiers across semantic colors:
    - Primary Blue: `--ui-btn--primary` (Deep Blue) and `--ui-btn--primary-subtle` (Light Blue)
    - Success Green: `--ui-btn--success` (Deep Green) and `--ui-btn--success-subtle` (Light Green)
    - Warning Yellow: `--ui-btn--warning` (Deep Yellow) and `--ui-btn--warning-subtle` (Light Yellow)
    - Danger Red: `--ui-btn--danger` (Deep Red) and `--ui-btn--danger-subtle` (Light Red)
- **Active Switch Default**: Conforming to Apple HIG, Toggle Switch (`ui-toggler`) defaults to Green (`--ui-color-success`) in the active checked state.

### 1.2 Typography & Metrics
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif`.
- **Tabular Numerals**: Numerical data displays (e.g. `ProgressBar`, `Stepper`, `Slider`) must use `font-variant-numeric: tabular-nums`.
- **Target Sizes**: Hit areas conform to Apple minimums: `sm` (28px), `md` (34px~36px), `lg` (42px~44px).
- **Curvature**: Apple rounded corners (`sm`: 6px, `md`: 8px, `lg`: 12px, `full`: 9999px).

### 1.3 Progress Indicators: Determinate vs Indeterminate
- **Determinate Progress Bar**: Used when task progress is measurable (0%~100%), rendering a static or linearly transitioning fill track.
- **Indeterminate Progress Bar**: Used when completion time cannot be calculated upfront (e.g., shader compilation, asset unpacking, background sync). Renders an animated gliding pill pulse looping continuously across the track.
- **Architectural Isolation**: Container resizing morph transitions belong to the global layout engine (`styles/motion.css`), while indeterminate scanning animations are isolated micro-animations (`elements/indeterminate.css`).

### 1.4 Continuous & Stepped Numeric Controls (Slider & Stepper)
- **Neutral Dragger**: Slider provides a neutral thumb variant (`--ui-slider--neutral`) using neutral dark gray tones (`--ui-color-neutral-700`) to avoid unnecessary visual noise.
- **Dual Stepper Architecture (Editable & Segmented Capsule)**:
  - **Editable Input Mode (Scheme Bravo)**: Features an independent, standalone text input field flanked by detached rounded decrement and increment buttons (`gap: var(--ui-space-1)`). Clean focus ring and direct keystroke editing support.
  - **Readonly Capsule Mode (Scheme Charlie + Delta)**: Features an integrated segmented capsule container rendered in Apple muted neutral background (`--ui-color-neutral-100`) with subtle border. Center value displays as a static tabular numerical label bounded by vertical separator lines on both sides (`border-left` and `border-right`), resolving harsh white brightness while preserving tactile segmentation.
  - **Color Tier Generation**: Stepper generates `neutral` (grayscale), `primary` (filled), and `primary-subtle` (tinted subtle) tiers.
- **Interaction Model (Direct Typing vs Dragging/Stepping)**:
  - **Dragging / Stepping**: Live real-time continuous feedback (`input` / `change` event).
  - **Direct Text Input**: Adheres to Apple HIG text field drafting rules:
    - Keystroke editing allows free text entry without jumping mid-typing.
    - Value is validated, clamped between `min` and `max`, and committed to the control on **Blur (`out of focus`)** or pressing **Enter**.
    - Pressing **Escape** cancels editing and reverts to the last committed value.

### 1.5 Checkbox & Tri-State Indeterminate Standards
- **Binary vs Mixed Selection**: Standard checkboxes toggle between checked and unchecked. Indeterminate (`.ui-checkbox--indeterminate`, `aria-checked="mixed"`) represents partial child selections.
- **Mutually Exclusive Iconography**: Apple HIG strictly prohibits checkmark and minus collision. When indeterminate, only the centered horizontal dash is displayed.
- **Tri-State Cycle & Restoration**: Interactive demonstration and tri-state models cycle predictably: `indeterminate` -> `checked` -> `unchecked` -> `indeterminate`, preventing permanent loss of the indeterminate state upon interaction.

---

## 2. Motion System: 3-Stage Morph Transition

Container state and hierarchy changes follow Apple's modular 3-stage morph sequence:

```text
User Action / State Trigger
  │
  ├── Stage 1: Content Fade Out (100ms)
  │     └─ .ui-morph-content adds .ui-morph-content--faded (opacity: 0, pointer-events: none)
  │
  ├── Stage 2: Container Resize (150ms)
  │     ├─ DOM view switch executed while hidden
  │     └─ Container (.ui-morph-panel) animates width & height using Apple Ease:
  │        cubic-bezier(0.2, 0.8, 0.25, 1)
  │
  └── Stage 3: Content Show Up (100ms)
        └─ .ui-morph-content removes .ui-morph-content--faded (opacity: 1)
```

- **Modular Separation**:
  - Tokens: Defined in `src/schemas/tokens/motion.json` (`--ui-motion-fade-duration`, `--ui-motion-resize-duration`, `--ui-motion-ease-apple`, `--ui-motion-indeterminate-duration`).
  - Styles: Purely handled in `src/styles/motion.css`.
  - Logic: Purely handled in `src/core/morph-transition.js` without hardcoded styling.

---

## 3. Terminology & Communication Protocol

Precise terminology ensures clarity and prevents attention dilution across human developers and AI agents.

### 3.1 Strict Domain Terminology
| Inaccurate / Vague Term | Standard Technical Term | BEM / Architectural Role |
|---|---|---|
| "unit", "item", "box" | **Component** / **Block** | Independent reusable block (e.g. `Button`, `ProgressBar`) |
| "sub-unit", "part" | **Element** | Internal constituent of a block (e.g. `__track`, `__fill`) |
| "style", "theme type" | **Modifier** | Variant modifier (e.g. `--neutral`, `--outline`, `--sm`) |
| "color variable", "size val" | **Design Token** | Atomic design value in SSOT (`src/schemas/tokens/`) |
| "wrapper", "frame" | **Container** / **Panel** | Dimension-morphing structural container (`.ui-morph-panel`) |
| "inner stuff", "page body" | **Content** / **View** | Fading visual payload (`.ui-morph-content`, `.ui-morph-view`) |
| "effect", "movement" | **Transition** / **Animation** | 3-stage morph transition or element micro-animation |
| "tagger" (mishearing) | **Toggler** / **Switch** | Binary toggle switch component (`ui-toggler`) |
| "unknown progress" | **Indeterminate ProgressBar** | Non-quantifiable progress indicator (`--indeterminate`) |
| "light/deep colors" | **Filled & Tinted (Subtle)** | Apple HIG button emphasis levels |

### 3.2 Language Convention
- Everyday communication and high-level summaries may use Chinese.
- All code-level references, component names, schema definitions, and technical parameters MUST be in accurate English, or Chinese with English in parentheses (e.g., 组件 (Component), 设计令牌 (Design Token)).

---

## 4. Interaction Conflict Resolution Protocol

When designing or extending menus, if any user request or design proposal conflicts with Apple Human Interface Guidelines:
1. **Immediate Identification**: Proactively point out the conflict before or during implementation.
2. **HIG Rationale**: Explain why the proposed interaction violates Apple guidelines (e.g., visual clutter, jarring color distraction, non-standard navigation gestures, lack of pressed feedback, or unergonomic touch targets).
3. **Compliant Solution**: Propose and provide the Apple HIG-compliant alternative that fulfills the user's underlying functional requirement while preserving platform elegance.

---

## 5. Architectural Trade-offs & Intended Design Deviations (DESIGN_INTENT)

For in-depth scenario justifications and trade-off analyses, refer to [DESIGN_INTENT.md](file:///workspace/SimpleUI/DESIGN_INTENT.md) and [EXPECTATIONS.md](file:///workspace/SimpleUI/EXPECTATIONS.md).

### 5.1 Dynamic Virtual Canvas Scaling vs Dynamic Type
- **Standard HIG Rule**: Apple HIG recommends fixed point metrics with OS Dynamic Type font scaling.
- **SimpleUI Specialized Context**: In multi-resolution laptop environments (eliminating physical size discrepancies across 16:9 and 16:10 aspect ratios) and industrial displays (consistent UI sizing across 24-inch 1080P, 2K, and 4K panels), SimpleUI deploys a **width-based virtual canvas scaling engine**.
- **Human Centered Compensation**:
  - Top-right header provides a drag-only **UI Scale Slider** (25% to 200%).
  - Automated first-visit accessibility heuristic detection seeds an optimal personalized initial scale.
  - Safe Area overlays and device preset simulations facilitate cross-form-factor visual verification.

### 5.2 Tab Shortcut Key for Canvas Live Preview vs Keyboard Focus Traversal
- **Standard HIG Rule**: Apple HIG and W3C WAI-ARIA strictly mandate that the `Tab` key is reserved for sequential focus navigation through interactive elements.
- **SimpleUI Specialized Context**: In workstation, canvas inspection, and parameter adjustment workflows (analogous to Final Cut Pro, Blender, or HUD configurations), frequent micro-adjustments require rapid full-canvas visual confirmation.
- **Human Centered Trade-off**:
  - The Live Preview paradigm implements a 3-stage morph collapse to the right-center edge via `Tab`.
  - To prevent accessibility collisions, text input elements inhibit this trigger, and the shortcut key can be freely rebound to alternative key combinations (`shortcutKey`).

### 5.3 Surface Layering & Grouped Inset Contrasts
- **Standard HIG Rule**: In Apple windowing architectures, secondary toolbars, status bars, and panel footers must never share the outer canvas or desktop wallpaper background.
- **Implementation**: Standard 3-stage container footers (`.ui-panel__footer`) strictly employ `--ui-color-neutral-50`, preventing background bleed when panels sit atop the `--ui-bg-page` canvas.
