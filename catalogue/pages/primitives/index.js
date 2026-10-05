import { containerSchema } from '@draft/primitives/container/index.js';
import { stackSchema } from '@draft/primitives/stack/index.js';
import { rowSchema } from '@draft/primitives/row/index.js';
import { centerPlaceholderSchema } from '@draft/primitives/center-placeholder/index.js';
import { getSchemaBadge } from '@draft/special/catalogue/patterns/helpers.js';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

const formatTokens = (tokens = {}, extra = {}) => {
  const merged = { ...tokens, ...extra };
  return Object.entries(merged)
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
    .join(' • ');
};

export const primitivesPageSpec = {
  type: 'container',
  className: 'catalogue-page catalogue-page--primitives',
  attributes: {
    style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
  },
  children: [
    // 1. Container Primitive: Continuous squircle boundary
    {
      pattern: 'standard-frame',
      props: {
        id: containerSchema.id,
        title: containerSchema.title || 'Container',
        badge: getSchemaBadge(containerSchema),
        status: containerSchema.status,
        description: containerSchema.description,
        stageContent: {
          pattern: 'container',
          content: { pattern: 'center-placeholder', content: 'Container Content' }
        },
        footerText: formatTokens(containerSchema.tokens)
      }
    },
    // 2. Vertical Stack Primitive
    {
      pattern: 'standard-frame',
      props: {
        id: stackSchema.id,
        title: stackSchema.title || 'Vertical Stack',
        badge: getSchemaBadge(stackSchema),
        status: stackSchema.status,
        description: stackSchema.description,
        stageContent: {
          pattern: 'stack',
          gap: 'md',
          children: [
            { pattern: 'center-placeholder', content: 'Item 1' },
            { pattern: 'center-placeholder', content: 'Item 2' },
            { pattern: 'center-placeholder', content: 'Item 3' }
          ]
        },
        footerText: formatTokens({ direction: 'column', gap: stackSchema.tokens?.gap, alignment: 'stretch' })
      }
    },
    // 3. Horizontal Stack Primitive
    {
      pattern: 'standard-frame',
      props: {
        id: rowSchema.id,
        title: rowSchema.title || 'Horizontal Stack',
        badge: getSchemaBadge(rowSchema),
        status: rowSchema.status,
        description: rowSchema.description,
        stageContent: {
          pattern: 'row',
          gap: 'md',
          justify: 'center',
          children: [
            { pattern: 'center-placeholder', content: 'Item 1' },
            { pattern: 'center-placeholder', content: 'Item 2' },
            { pattern: 'center-placeholder', content: 'Item 3' }
          ]
        },
        footerText: formatTokens({ direction: 'row', gap: rowSchema.tokens?.gap, alignment: 'center' })
      }
    },
    // 4. Center Placeholder Primitive
    {
      pattern: 'standard-frame',
      props: {
        id: centerPlaceholderSchema.id,
        title: centerPlaceholderSchema.title || 'Center Placeholder',
        badge: getSchemaBadge(centerPlaceholderSchema),
        status: centerPlaceholderSchema.status,
        description: centerPlaceholderSchema.description,
        stageContent: {
          pattern: 'center-placeholder',
          content: 'Center Placeholder'
        },
        footerText: formatTokens(centerPlaceholderSchema.tokens, { alignment: 'center' })
      }
    }
  ]
};

export function renderPrimitivesPage() {
  return interpret(primitivesPageSpec);
}
