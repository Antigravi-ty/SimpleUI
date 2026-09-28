# SimpleUI — Draft Incubator (草稿孵化区)

This directory houses incubating componentsprimitivespatternsand animations in active design.

## 1. Directory Structure & Taxonomy
- **General Incubator Layers** (1:1 isomorphic with `src_next/`):
  - `draft/components/` → graduates to `src_next/components/` (`Core [Stable]`)
  - `draft/primitives/` → graduates to `src_next/primitives/` (`Core [Stable]`)
  - `draft/patterns/`   → graduates to `src_next/patterns/` (`Core [Stable]`)
  - `draft/animations/` → graduates to `src_next/animations/` (`Core [Stable]`)
- **Special Scenario Incubators** (`draft/special/<domain>/`):
  - `draft/special/catalogue/patterns/` (`standard-frame``matrix-frame``interaction-frame`)
  - Houses incubating assets designed for specific sub-systems (e.g. Catalogue staging frames with `draft-sp-cata-*` prefixes).
  - When finalizeddetached from draft dependenciesthese graduate to the respective domain's solid source (e.g. `draft/special/catalogue/`).

## 2. Strict Unidirectional Isolation Rule (单向依赖铁律)
- **Source can NEVER depend on Draft**:
  - `src_next/**``src/**`and `draft/special/catalogue/**` are production/solidified source libraries. They are **STRICTLY PROHIBITED** from importing anything from `draft/**` or containing `.draft-` class names. Automated CI checks strictly fail if violated.
- **Pages/Viewports MAY consume Draft**:
  - Showcase & Catalogue showroom pages (`catalogue/pages/**``showcase/**`) act as display canvasesconsumers. They may import both solidified sourcesincubating drafts for previewingverification.
