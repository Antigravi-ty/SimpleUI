import { renderContainer } from '@draft/primitives/container/index.js';
import { renderStack } from '@draft/primitives/stack/index.js';
import { renderRow } from '@draft/primitives/row/index.js';
import { renderCenterPlaceholder } from '@draft/primitives/center-placeholder/index.js';
import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';

export function renderPrimitivesPage() {
  const container = document.createElement('div');
  container.className = 'catalogue-page catalogue-page--primitives';

  // 1. Container Primitive - Pure centered text
  const containerContent = renderCenterPlaceholder({
    content: '<span class="ui-body">Container content</span>'
  });
  const containerSample = renderContainer({ content: containerContent });
  const containerFrame = renderStandardFrame({
    id: 'primitive-container',
    title: 'Container',
    badge: '.draft-ui-container',
    status: 'draft',
    description: 'Continuous squircle boundary with neutral surface, tokenized radius, and subtle border.',
    stageContent: containerSample,
    footerText: 'Radius: var(--ui-radius-lg) • Surface: var(--ui-bg-surface) • Border: var(--ui-border-subtle)'
  });
  container.appendChild(containerFrame);

  // 2. Vertical Stack Primitive - Clean centered text items
  const stackSample = renderStack({
    gap: 'md',
    children: [
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 1</span>' }),
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 2</span>' }),
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 3</span>' })
    ]
  });
  const stackFrame = renderStandardFrame({
    id: 'primitive-stack',
    title: 'Vertical Stack',
    badge: '.draft-ui-stack',
    status: 'draft',
    description: 'Auto-layout flex container grouping child elements along a vertical column with tokenized gap spacing.',
    stageContent: stackSample,
    footerText: 'Direction: column • Gap: var(--ui-space-3) • Alignment: stretch'
  });
  container.appendChild(stackFrame);

  // 3. Horizontal Stack Primitive - Clean centered text items
  const rowSample = renderRow({
    gap: 'md',
    justify: 'center',
    children: [
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 1</span>' }),
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 2</span>' }),
      renderCenterPlaceholder({ content: '<span class="ui-caption">Item 3</span>' })
    ]
  });
  const rowFrame = renderStandardFrame({
    id: 'primitive-row',
    title: 'Horizontal Stack',
    badge: '.draft-ui-row',
    status: 'draft',
    description: 'Auto-layout flex container distributing child elements along a horizontal row with tokenized gap spacing.',
    stageContent: rowSample,
    footerText: 'Direction: row • Gap: var(--ui-space-3) • Alignment: center'
  });
  container.appendChild(rowFrame);

  // 4. Center Placeholder Primitive - Clean centered text
  const placeholderSample = renderCenterPlaceholder({
    content: '<span class="ui-caption">Centered content</span>'
  });
  const placeholderFrame = renderStandardFrame({
    id: 'primitive-center-placeholder',
    title: 'Center Placeholder',
    badge: '.draft-ui-center-placeholder',
    status: 'draft',
    description: 'Neutral staging placeholder primitive providing geometry centering and clean visual boundaries.',
    stageContent: placeholderSample,
    footerText: 'Surface: var(--ui-bg-surface) • Border: 1px solid var(--ui-border-subtle) • Alignment: center'
  });
  container.appendChild(placeholderFrame);

  return container;
}
