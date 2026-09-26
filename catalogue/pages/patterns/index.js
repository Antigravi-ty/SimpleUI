import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import { renderCenterPlaceholder } from '@draft/primitives/center-placeholder/index.js';
import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';

export function renderPatternsPage() {
  const container = document.createElement('div');
  container.className = 'catalogue-page catalogue-page--patterns';

  // Three-Stage Container: Clean centered text without "Slot" suffix
  const threeStageSample = renderThreeStageContainer({
    header: renderCenterPlaceholder({ content: '<span class="ui-headline">Header</span>' }),
    content: renderCenterPlaceholder({ content: '<span class="ui-body" style="color: var(--ui-text-muted);">Content</span>' }),
    footer: renderCenterPlaceholder({ content: '<span class="ui-caption" style="color: var(--ui-text-muted);">Footer</span>' })
  });

  const threeStageFrame = renderStandardFrame({
    id: 'pattern-three-stage',
    title: 'Three-Stage Container',
    badge: '.draft-ui-three-stage',
    status: 'draft',
    description: 'Pure 3-stage structural container pattern isolating Header, Content, and optional Footer slots.',
    stageContent: threeStageSample,
    footerText: 'Header Slot • Content Slot • Optional Footer Slot'
  });
  container.appendChild(threeStageFrame);

  return container;
}
