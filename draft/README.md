# SimpleUI — Draft Incubator (草稿孵化区)

This directory houses incubating components, primitives, patterns, and animations in active design.

## Lifecycle Promotion Architecture
- Structure is 1:1 isomorphic with `src_next/`:
  - `draft/components/` → graduates to `src_next/components/` (`Core [Stable]`)
  - `draft/primitives/` → graduates to `src_next/primitives/` (`Core [Stable]`)
  - `draft/patterns/`   → graduates to `src_next/patterns/` (`Core [Stable]`)
  - `draft/animations/` → graduates to `src_next/animations/` (`Core [Stable]`)
- If an incubating item is finalized as a scenario-specific construct rather than generic, it migrates to `catalogue/special/<layer>/` (`Showcase [Special]`).
- Status is derived automatically from storage location without requiring manual state file juggling.
