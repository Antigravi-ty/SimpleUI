# SimpleUI — Design Intent & Architectural Trade-offs

This document formalizes intentional design departures, specialized engineering compromises, and trade-offs made within SimpleUI against conventional design systems and the Apple Human Interface Guidelines (HIG).

---

## 1. Dynamic Virtual Canvas Scaling & Width-Anchored UI Scale

### 1.1 The Specialized Hardware Scenario
Modern laptop and display ecosystems present a unique challenge:
1. **16:9 vs 16:10 Laptop Bezel Discrepancies**: Laptops of the same physical display width (e.g., 13-inch, 14-inch, or 16-inch laptops) have shifted from 16:9 to 16:10 panels by narrowing the bottom bezel ("chin"). The available horizontal workspace remains identical, while vertical height slightly increases. Standard responsive CSS tied to height or viewport minimums alters layout proportions unpredictably.
2. **Fixed Physical Size Across 1080P, 2K, and 4K**: A standard 24-inch or 27-inch desktop monitor can have resolutions of 1920×1080, 2560×1440, or 3840×2160. Under standard web CSS, interfaces look dramatically different unless rendered at consistent physical scale.

### 1.2 The Intentional Departure from Apple HIG
- **Apple HIG Principle**: Apple mandates fixed point (`pt`) typography and UI dimensions, delegating user legibility solely to OS-level Dynamic Type sliders.
- **SimpleUI Design Choice**: SimpleUI adopts a **Virtual Canvas Scaling Engine** where all element metrics (controls, rem typography, spacing) are anchored to the effective render width (`Wrender`) scaled by a global `ScaleFactor`:
  $$\text{ScaleFactor} = \frac{W_{\text{render}}}{1920} \times \frac{\text{UserScale}}{100}$$
- **Accessibility Compensation**:
  - A dedicated **UI Scale Slider** (25% to 200%) is placed in the top-right header, providing continuous drag adjustment without manual numeric input clutter.
  - **First-Visit Heuristic Detection**: On initial launch, the system automatically detects `systemFontScale` (via computed medium font size) and browser `zoomScale`, setting a personalized baseline default scale.

---

## 2. 18:9 Viewport Clamping & Ultra-Wide Pillarboxing

- **Constraint**: The maximum horizontal aspect ratio for rendered content is strictly constrained to **18:9 (2.0 : 1)**:
  $$W_{\text{render}} = \min(W_{\text{safe}}, H_{\text{safe}} \times 2)$$
- **Behavior**: On ultra-wide (e.g. 21:9 or 32:9) screens, the interface is centered with symmetric pillarbox margins (`--ui-pillarbox-width`), preventing interface sprawl and extreme horizontal travel distance.

---

## 3. Portrait Viewport Interception (Portrait Gate)

- **Constraint**: SimpleUI does not guarantee layout ergonomics on vertical or portrait displays ($W_{\text{safe}} < H_{\text{safe}}$).
- **Behavior**: A full-screen blocking overlay triggers on portrait orientation:
  - Title: *"Use it at your own risk"*
  - Rationale: Transparently explains that the interface is engineered for horizontal laptop/desktop displays.
  - Escape Hatch: Features a `.ui-btn--danger-subtle` ("I got it") push-button, enabling users to dismiss the barrier and proceed at their own discretion.

---

## 4. Safe Area Insets & Interface Safe Margin

- **Hardware Insets**: Incorporates native `env(safe-area-inset-*)` (Notch, Dynamic Island, Home Bar) alongside simulated device presets (iPad 4:3, Laptop 16:9, Mobile 18:9, Ultra-Wide 21:9).
- **Interface Safe Margin Offset**: Supports an adjustable safety margin between **-5% and +10%**:
  - Positive values (+1% to +10%) add protective padding inwards.
  - Negative values (-1% to -5%) permit dense, boundary-spanning interfaces when peripheral clipping is acceptable.
- **HUD Telemetry Overlay**: Accessible via the top-right header `[Safe Area]` toggle button for real-time inspection.
