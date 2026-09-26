import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';
import { renderCenterPlaceholder } from '@draft/primitives/center-placeholder/index.js';

export function renderAnimationsPage() {
  const container = document.createElement('div');
  container.className = 'catalogue-page catalogue-page--animations';

  const animSample = renderCenterPlaceholder({
    content: '<span class="ui-body" style="color: var(--ui-text-muted);">Animations staging and transitions in incubation</span>'
  });

  const animFrame = renderStandardFrame({
    id: 'animation-staging',
    title: 'Animations Staging',
    badge: '.draft-ui-animation',
    status: 'draft',
    description: 'Incubating transitions, physics curves, and morph container animations.',
    stageContent: animSample,
    footerText: 'Easing: Apple ease • Live Preview & Morph Transitions'
  });
  container.appendChild(animFrame);

  return container;
}
