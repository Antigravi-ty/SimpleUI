import { CatalogueShellLayout } from '@catalogue/special/shell/shell-layout/index.js';
import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';
import { renderContainer } from '@draft/primitives/container/index.js';
import { renderStack } from '@draft/primitives/stack/index.js';
import { renderRow } from '@draft/primitives/row/index.js';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import { renderSpecialPage } from '@catalogue/special/pages/special-page/index.js';
import { bindAllBehaviors } from '@src_next/index.js';

const appRoot = document.getElementById('catalogue-root');
if (appRoot) {
  const shell = new CatalogueShellLayout();
  const { content, setActivePage } = shell.mount(appRoot);

  const renderView = () => {
    const rawHash = window.location.hash || '#/components';
    const hash = rawHash.split('?')[0];

    let pageId = 'components';
    if (hash === '#/primitives') {
      pageId = 'primitives';
    } else if (hash === '#/patterns' || hash === '#/structural-patterns') {
      pageId = 'patterns';
    } else if (hash === '#/animations') {
      pageId = 'animations';
    } else if (hash === '#/specials' || hash === '#/special' || hash.startsWith('#special-') || hash === '#/catalogue-special') {
      pageId = 'specials';
    } else {
      pageId = 'components';
    }

    setActivePage(pageId);
    content.innerHTML = '';

    if (pageId === 'primitives') {
      // 1. Container Primitive Standard Frame
      const containerSample = renderContainer({
        content: `
          <div style="max-width: 480px; width: 100%; text-align: center; margin: 0 auto;">
            <h4 style="margin: 0 0 var(--ui-space-2) 0; font-size: var(--ui-font-base); font-weight: var(--ui-weight-semibold); color: var(--ui-text-main);">Squircle Surface Container</h4>
            <p style="margin: 0; font-size: var(--ui-font-xs); color: var(--ui-text-muted); line-height: 1.6;">
              Solidified <code>.draft-ui-container</code> with tokenized continuous radius, border subtle, and neutral surface.
            </p>
          </div>
        `
      });

      const containerFrame = renderStandardFrame({
        id: 'primitive-container',
        title: 'Container',
        badge: '.draft-ui-container',
        status: 'draft',
        description: 'Continuous squircle boundary with neutral surface, tokenized radius, and subtle border.',
        stageContent: containerSample,
        footerText: 'Radius: var(--ui-radius-lg) • Surface: var(--ui-bg-surface) • Border: var(--ui-border-subtle)'
      });
      content.appendChild(containerFrame);

      // 2. Vertical Stack Primitive Standard Frame
      const stackSample = renderStack({
        gap: 'md',
        children: [
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main); width: 100%;">Vertical Stack Item 1</div>`,
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main); width: 100%;">Vertical Stack Item 2</div>`,
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main); width: 100%;">Vertical Stack Item 3</div>`
        ],
        attributes: { style: 'max-width: 440px; width: 100%;' }
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
      content.appendChild(stackFrame);

      // 3. Horizontal Stack Primitive Standard Frame
      const rowSample = renderRow({
        gap: 'md',
        justify: 'center',
        children: [
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3) var(--ui-space-4); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main);">Row Item 1</div>`,
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3) var(--ui-space-4); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main);">Row Item 2</div>`,
          `<div style="background: var(--ui-bg-surface); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-3) var(--ui-space-4); font-size: var(--ui-font-xs); text-align: center; color: var(--ui-text-main);">Row Item 3</div>`
        ],
        attributes: { style: 'max-width: 480px; width: 100%;' }
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
      content.appendChild(rowFrame);

      bindAllBehaviors(content);
    } else if (pageId === 'patterns') {
      // Structural Patterns: Three-Stage Container with header, content, and footer
      const pureThreeStageSample = renderThreeStageContainer({
        attributes: { style: 'max-width: 440px; width: 100%; box-shadow: var(--ui-shadow-md); background: var(--ui-bg-surface);' },
        header: `
          <div style="text-align: center; font-size: var(--ui-font-sm); font-weight: var(--ui-weight-semibold); color: var(--ui-text-main); padding: var(--ui-space-1) 0;">
            Header
          </div>
        `,
        content: `
          <div style="text-align: center; font-size: var(--ui-font-sm); color: var(--ui-text-muted); padding: var(--ui-space-6) 0;">
            Content
          </div>
        `,
        footer: `
          <div style="text-align: center; font-size: var(--ui-font-xs); color: var(--ui-text-muted); padding: var(--ui-space-1) 0;">
            Footer
          </div>
        `
      });

      const threeStageFrame = renderStandardFrame({
        id: 'pattern-three-stage',
        title: 'Three-Stage Container',
        badge: '.draft-ui-three-stage',
        status: 'draft',
        description: 'Pure 3-stage structural container pattern isolating Header, Content, and optional Footer slots.',
        stageContent: pureThreeStageSample,
        footerText: 'Header Slot • Content Slot • Optional Footer Slot'
      });
      content.appendChild(threeStageFrame);

      bindAllBehaviors(content);
    } else if (pageId === 'specials') {
      const specialPageEl = renderSpecialPage();
      content.appendChild(specialPageEl);
      bindAllBehaviors(content);

      const isSpecialAnchor = hash.startsWith('#special-');
      if (isSpecialAnchor) {
        setTimeout(() => {
          const targetEl = content.querySelector(hash);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  };

  window.addEventListener('hashchange', renderView);
  renderView();
}
