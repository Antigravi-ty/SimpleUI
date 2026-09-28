import { interpret } from '@src_next/core/slot-resolver.js';

export const animationsPageSpec = {
  type: 'container',
  className: 'catalogue-page catalogue-page--animations',
  children: [
    {
      type: 'box',
      attributes: {
        style: 'padding: var(--ui-space-12) var(--ui-space-6); text-align: center; color: var(--ui-text-muted); font-size: var(--ui-font-sm);'
      },
      children: [
        {
          tag: 'p',
          attributes: {
            style: 'margin: 0 0 var(--ui-space-2) 0; font-weight: var(--ui-weight-medium); color: var(--ui-text-main);'
          },
          text: 'No Incubating Animations'
        },
        {
          tag: 'p',
          attributes: {
            style: 'margin: 0; font-size: var(--ui-font-xs);'
          },
          text: 'Draft animation primitives and transitions will appear here once registered.'
        }
      ]
    }
  ]
};

export function renderAnimationsPage() {
  return interpret(animationsPageSpec);
}
