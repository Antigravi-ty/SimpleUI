import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';
import { renderMatrixFrame } from '@catalogue/special/patterns/matrix-frame/index.js';
import { renderInteractionFrame } from '@catalogue/special/patterns/interaction-frame/index.js';
import { CatalogueShellLayout } from '@catalogue/special/shell/shell-layout/index.js';

export function renderSpecialPage() {
  const container = document.createElement('div');
  container.className = 'sp-cata-specials-page';
  container.style.cssText = 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;';

  // ----------------------------------------------------
  // Card 1: Standard Frame Spec (Showcased via Interaction Frame with live slot toggles)
  // ----------------------------------------------------
  const innerStandardContainer = document.createElement('div');
  innerStandardContainer.style.cssText = 'max-width: 680px; width: 100%;';

  let showRefLinkCard1 = true;
  let showDescCard1 = true;

  const updateInnerStandardFrame = () => {
    innerStandardContainer.innerHTML = '';
    const sample = renderStandardFrame({
      title: 'Title',
      badge: '.draft-ui-standard-frame',
      description: showDescCard1 ? 'Relative description' : '',
      hasRedirectReference: showRefLinkCard1,
      redirectLink: showRefLinkCard1 ? {
        toSee: '[Relative Component]',
        checkText: '[Relative Documentation]',
        prefixText: 'Optional: To see [Relative Component], check '
      } : null,
      stageContent: `
        <div style="background: var(--ui-bg-surface); border: 1px dashed var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-6); text-align: center; color: var(--ui-text-muted); font-size: var(--ui-font-sm); width: 100%;">
          Content Slot
        </div>
      `,
      footerText: 'Optional: Relative description'
    });
    innerStandardContainer.appendChild(sample);
  };
  updateInnerStandardFrame();

  const card1 = renderInteractionFrame({
    id: 'special-standard-frame',
    title: 'Standard Frame',
    badge: '.draft-sp-cata-standard-frame',
    status: 'draft',
    description: 'Canonical staging frame isolating Header, Staging Well, and Footer slots with optional reference links.',
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Three-Stage Container',
      checkText: 'documentation',
      url: '#/patterns'
    },
    controls: `
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" id="ctrl-card1-ref" style="margin: 0; user-select: none;">
        <input type="checkbox" class="ui-checkbox__input" checked />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Optional: Reference Link</span>
      </label>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" id="ctrl-card1-desc" style="margin: 0; user-select: none;">
        <input type="checkbox" class="ui-checkbox__input" checked />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Optional: Relative description</span>
      </label>
    `,
    stageContent: innerStandardContainer,
    footerText: 'Header Slot • Content Well Slot • Optional Footer Slot'
  });

  const chkRef1 = card1.querySelector('#ctrl-card1-ref input');
  if (chkRef1) {
    chkRef1.addEventListener('change', () => {
      showRefLinkCard1 = chkRef1.checked;
      card1.querySelector('#ctrl-card1-ref').classList.toggle('ui-checkbox--checked', showRefLinkCard1);
      updateInnerStandardFrame();
    });
  }
  const chkDesc1 = card1.querySelector('#ctrl-card1-desc input');
  if (chkDesc1) {
    chkDesc1.addEventListener('change', () => {
      showDescCard1 = chkDesc1.checked;
      card1.querySelector('#ctrl-card1-desc').classList.toggle('ui-checkbox--checked', showDescCard1);
      updateInnerStandardFrame();
    });
  }
  container.appendChild(card1);

  // ----------------------------------------------------
  // Card 2: Matrix Frame Spec (Showcased via Interaction Frame with real-time optional link toggle)
  // ----------------------------------------------------
  const innerMatrixContainer = document.createElement('div');
  innerMatrixContainer.style.cssText = 'max-width: 680px; width: 100%;';

  let showRefLinkCard2 = true;

  const updateInnerMatrixFrame = () => {
    innerMatrixContainer.innerHTML = '';
    const sample = renderMatrixFrame({
      title: 'Title',
      badge: '.draft-sp-cata-matrix-frame',
      description: 'Relative description',
      hasRedirectReference: showRefLinkCard2,
      redirectLink: showRefLinkCard2 ? {
        toSee: '[Relative Component]',
        checkText: '[Relative Documentation]',
        prefixText: 'Optional: To see [Relative Component], check '
      } : null,
      columns: ['Neutral', 'Outline', 'Primary', 'Success', 'Primary Subtle', 'Success Subtle'],
      rows: ['Type 1', 'Type 2'],
      renderCell: (row, col) => `
        <div class="draft-sp-cata-matrix-frame__slot-placeholder">
          [${row} × ${col}]
        </div>
      `
    });
    innerMatrixContainer.appendChild(sample);
  };
  updateInnerMatrixFrame();

  const card2 = renderInteractionFrame({
    id: 'special-matrix-frame',
    title: 'Matrix Frame',
    badge: '.draft-sp-cata-matrix-frame',
    status: 'draft',
    description: 'Multi-dimensional matrix staging frame rendering categorical modifier filter bar and 2D matrix table without footer.',
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Three-Stage Container',
      checkText: 'documentation',
      url: '#/patterns'
    },
    controls: `
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" id="ctrl-card2-ref" style="margin: 0; user-select: none;">
        <input type="checkbox" class="ui-checkbox__input" checked />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Optional: Reference Link</span>
      </label>
    `,
    stageContent: innerMatrixContainer,
    footerText: 'Header Slot • Categorical Modifier Filter Bar • 2D Matrix Table Slot (No Footer)'
  });

  const chkRef2 = card2.querySelector('#ctrl-card2-ref input');
  if (chkRef2) {
    chkRef2.addEventListener('change', () => {
      showRefLinkCard2 = chkRef2.checked;
      card2.querySelector('#ctrl-card2-ref').classList.toggle('ui-checkbox--checked', showRefLinkCard2);
      updateInnerMatrixFrame();
    });
  }
  container.appendChild(card2);

  // ----------------------------------------------------
  // Card 3: Interaction Frame Spec (Showcased via Interaction Frame with live shortcut & focus toggles)
  // ----------------------------------------------------
  const innerInteractionContainer = document.createElement('div');
  innerInteractionContainer.style.cssText = 'max-width: 680px; width: 100%;';

  let showRefLinkCard3 = true;
  let showShortcutFocusCard3 = true;

  const updateInnerInteractionFrame = () => {
    innerInteractionContainer.innerHTML = '';

    const demoStageBox = document.createElement('div');
    demoStageBox.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: var(--ui-space-3); padding: var(--ui-space-6); background: var(--ui-bg-surface); border: 1px dashed var(--ui-border-subtle); border-radius: var(--ui-radius-md); box-sizing: border-box; width: 100%; text-align: center;';

    const shortcutHint = document.createElement('p');
    shortcutHint.style.cssText = 'margin: 0; font-size: var(--ui-font-xs); color: var(--ui-text-muted);';
    shortcutHint.textContent = showShortcutFocusCard3
      ? 'Click inside this frame to activate shortcut listener, then press Tab to trigger:'
      : 'Shortcut listener is disabled (toggle Optional: Focus / Shortcut Listener to activate):';

    const demoTabBtn = document.createElement('button');
    demoTabBtn.type = 'button';
    demoTabBtn.className = 'ui-btn ui-btn--sm ui-btn--neutral';
    demoTabBtn.textContent = 'Tab Trigger (Press Tab)';
    demoTabBtn.style.transition = 'all 0.15s ease';

    let isTabActive = false;
    const toggleTabVisual = () => {
      isTabActive = !isTabActive;
      demoTabBtn.className = isTabActive ? 'ui-btn ui-btn--sm ui-btn--primary' : 'ui-btn ui-btn--sm ui-btn--neutral';
      demoTabBtn.textContent = isTabActive ? 'Tab Trigger (Active!)' : 'Tab Trigger (Press Tab)';
    };
    demoTabBtn.addEventListener('click', toggleTabVisual);

    demoStageBox.appendChild(shortcutHint);
    demoStageBox.appendChild(demoTabBtn);

    const innerSample = renderInteractionFrame({
      title: 'Title',
      badge: '.draft-sp-cata-interaction-frame',
      description: 'Relative description',
      hasRedirectReference: showRefLinkCard3,
      redirectLink: showRefLinkCard3 ? {
        toSee: '[Relative Component]',
        checkText: '[Relative Documentation]',
        prefixText: 'Optional: To see [Relative Component], check '
      } : null,
      controls: `
        <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" style="margin: 0; user-select: none;">
          <input type="checkbox" class="ui-checkbox__input" checked />
          <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
          <span class="ui-checkbox__label">Controls: Interactive Option</span>
        </label>
      `,
      hasShortcutFocus: showShortcutFocusCard3,
      stageContent: demoStageBox,
      footerText: 'Optional: Relative description'
    });

    if (showShortcutFocusCard3) {
      innerSample.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          toggleTabVisual();
        }
      });
    }

    innerInteractionContainer.appendChild(innerSample);
  };
  updateInnerInteractionFrame();

  const card3 = renderInteractionFrame({
    id: 'special-interaction-frame',
    title: 'Interaction Frame',
    badge: '.draft-sp-cata-interaction-frame',
    status: 'draft',
    description: 'Interactive staging frame locating control parameters directly beneath the description slot with optional status indicator.',
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Standard Frame',
      checkText: 'documentation',
      url: '#special-standard-frame'
    },
    controls: `
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" id="ctrl-card3-ref" style="margin: 0; user-select: none;">
        <input type="checkbox" class="ui-checkbox__input" checked />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Optional: Reference Link</span>
      </label>
      <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" id="ctrl-card3-focus" style="margin: 0; user-select: none;">
        <input type="checkbox" class="ui-checkbox__input" checked />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">Optional: Focus / Shortcut Listener</span>
      </label>
    `,
    stageContent: innerInteractionContainer,
    footerText: 'Header Slot • Controls Slot (Below Description) • Status Indicator • Content Slot'
  });

  const chkRef3 = card3.querySelector('#ctrl-card3-ref input');
  if (chkRef3) {
    chkRef3.addEventListener('change', () => {
      showRefLinkCard3 = chkRef3.checked;
      card3.querySelector('#ctrl-card3-ref').classList.toggle('ui-checkbox--checked', showRefLinkCard3);
      updateInnerInteractionFrame();
    });
  }
  const chkFocus3 = card3.querySelector('#ctrl-card3-focus input');
  if (chkFocus3) {
    chkFocus3.addEventListener('change', () => {
      showShortcutFocusCard3 = chkFocus3.checked;
      card3.querySelector('#ctrl-card3-focus').classList.toggle('ui-checkbox--checked', showShortcutFocusCard3);
      updateInnerInteractionFrame();
    });
  }
  container.appendChild(card3);

  // ----------------------------------------------------
  // Card 4: Catalogue Shell Layout Spec (Flush straight-edged viewport with sandboxed interactivity)
  // ----------------------------------------------------
  const shellViewport = document.createElement('div');
  shellViewport.style.cssText = 'width: 100%; height: 380px; position: relative; overflow: hidden; border-radius: 0; border: none; background: var(--ui-bg-page);';

  // Instantiate real CatalogueShellLayout: inherently self-contained & sandboxed when mounted inside a container
  const nestedShell = new CatalogueShellLayout({ activePage: 'components' });
  nestedShell.mount(shellViewport);

  const card4 = renderStandardFrame({
    id: 'special-shell-layout',
    title: 'Catalogue Shell Layout',
    badge: '.draft-sp-cata-shell-layout',
    status: 'draft',
    description: 'Application shell architecture establishing canonical 56px Header, Safe Area HUD, UI Scale, and 3-Tier Sidebar navigation.',
    wellPadding: 'none',
    stageContent: shellViewport,
    footerText: 'Canonical 56px Header • 240px 3-Tier Sidebar • Flush Edge Viewport'
  });
  container.appendChild(card4);

  return container;
}
