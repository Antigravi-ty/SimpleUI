import { threeStageSchema, dropdownMenuSchema } from '@draft/patterns/index.js';
import { getSchemaBadge } from '@draft/special/catalogue/patterns/helpers.js';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

const slotsText = Object.keys(threeStageSchema.slots || {})
  .map(s => s === 'footer' ? '(optional)footer' : s.charAt(0).toUpperCase() + s.slice(1))
  .join(' • ') || 'Header • Content • (optional)footer';

export const patternsPageSpec = {
  type: 'container',
  className: 'catalogue-page catalogue-page--patterns',
  attributes: {
    style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
  },
  children: [
    // 1. Three-Stage Container: Decoupled header, content, and optional footer
    {
      pattern: 'standard-frame',
      props: {
        id: threeStageSchema.id,
        title: threeStageSchema.title || 'Three-Stage Container',
        badge: getSchemaBadge(threeStageSchema),
        status: threeStageSchema.status,
        description: threeStageSchema.description,
        stageContent: {
          pattern: 'three-stage',
          header: { pattern: 'center-placeholder', content: 'Header Slot' },
          content: { pattern: 'center-placeholder', content: 'Content Body Slot' },
          footer: { pattern: 'center-placeholder', content: '(optional) Footer Slot' }
        },
        footerText: slotsText
      }
    },
    // 2. Dropdown Menu Pattern: Vertical structured list pattern
    {
      pattern: 'standard-frame',
      props: {
        id: dropdownMenuSchema.id,
        title: dropdownMenuSchema.title || 'Dropdown Menu',
        badge: getSchemaBadge(dropdownMenuSchema),
        status: dropdownMenuSchema.status,
        description: dropdownMenuSchema.description,
        stageContent: {
          pattern: 'container',
          className: 'sp-cata-stage-harness--menu',
          content: {
            pattern: 'dropdown-menu',
            items: [
              { id: 'item-overview', label: 'Overview' },
              { id: 'item-settings', label: 'Settings' },
              { id: 'item-analytics', label: 'Analytics', badge: 'New' },
              { divider: true },
              { id: 'item-archived', label: 'Archived Projects', disabled: true },
              { id: 'item-delete', label: 'Delete Project', danger: true }
            ]
          }
        },
        footerText: 'Menu List Pattern • Item States (Active / Disabled / Danger) • Suffix Badges & Dividers'
      }
    }
  ]
};

export function renderPatternsPage() {
  return interpret(patternsPageSpec);
}
