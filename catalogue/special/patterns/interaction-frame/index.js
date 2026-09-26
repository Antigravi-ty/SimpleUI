import './style.css';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import interactionFrameSchema from './schema.json';

export { interactionFrameSchema };

const DEFAULT_INTERACTION_CONTROLS = `
  <label class="ui-checkbox ui-checkbox--sm ui-checkbox--checked" style="margin: 0; user-select: none;">
    <input type="checkbox" checked />
    <span>Interactive Option</span>
  </label>
`;

/**
 * renderInteractionFrame - Interaction catalogue staging frame (.draft-sp-cata-interaction-frame).
 * Consumes the 3-stage container pattern.
 * Header layout: Horizontal stack with left column (Title, Description, Controls beneath)
 * and right column for optional visual status indicator (Shortcut/Focus indicator).
 */
export function renderInteractionFrame(options = {}) {
  const {
    id,
    title = 'Interaction Frame',
    badge = '.draft-sp-cata-interaction-frame',
    status = 'draft',
    badgeClass = status === 'draft' ? 'ui-badge--neutral' : 'ui-badge--primary-subtle',
    description,
    hasRedirectReference = false,
    haveRedirectReference = false,
    redirectLink,
    controls = DEFAULT_INTERACTION_CONTROLS,
    statusIndicator = null,
    hasShortcutFocus = false,
    stageContent,
    footerText,
    className = '',
    attributes = {}
  } = options;

  if (description === undefined || description === null || description === '') {
    throw new Error('[CatalogueSpecialInteractionFrame] "description" is required in frame configuration.');
  }

  // Explicit safety check for description hyperlink
  const isRedirectAllowed = Boolean(hasRedirectReference || haveRedirectReference);
  if (redirectLink !== undefined && redirectLink !== null) {
    if (!isRedirectAllowed) {
      throw new Error(
        '[Frame Conflict] Passing "redirectLink" detected, but "hasRedirectReference" is false or undefined. Did you forget to set hasRedirectReference: true?'
      );
    }
  }

  // 1. Construct Frame Header Node (Horizontal Stack)
  const headerNode = document.createElement('div');
  headerNode.className = 'sp-cata-frame__header';

  // Left Column (Vertical Stack)
  const leftCol = document.createElement('div');
  leftCol.className = 'sp-cata-frame__header-left';

  const titleRow = document.createElement('div');
  titleRow.className = 'sp-cata-frame__title-row';

  const titleEl = document.createElement('h3');
  titleEl.className = 'sp-cata-frame__title';
  titleEl.textContent = title;
  titleRow.appendChild(titleEl);

  if (badge) {
    const badgeEl = document.createElement('span');
    badgeEl.className = `ui-badge ${badgeClass} ui-badge--sm`;
    badgeEl.textContent = badge;
    titleRow.appendChild(badgeEl);
  }
  leftCol.appendChild(titleRow);

  const descEl = document.createElement('p');
  descEl.className = 'sp-cata-frame__desc';
  descEl.textContent = description;
  leftCol.appendChild(descEl);

  // Render Description Hyperlink if permitted
  if (isRedirectAllowed && redirectLink) {
    const redirectP = document.createElement('p');
    redirectP.className = 'sp-cata-frame__redirect';

    const toSee = redirectLink.toSee || '';
    const checkText = redirectLink.checkText || redirectLink.linkText || 'documentation';
    const targetUrl = redirectLink.url || '#';
    const prefixText = toSee ? `To see ${toSee}, check ` : (redirectLink.prefixText || '');

    redirectP.innerHTML = `${prefixText}<a href="${targetUrl}" class="sp-cata-frame__redirect-link">${checkText} ↗</a>`;

    const aEl = redirectP.querySelector('a');
    if (aEl && targetUrl.startsWith('#')) {
      aEl.addEventListener('click', (e) => {
        const rawTarget = targetUrl.replace(/^#/, '');
        const target = document.getElementById(rawTarget) || document.querySelector(targetUrl);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', targetUrl);
        }
      });
    }
    leftCol.appendChild(redirectP);
  }

  // Controls Slot: strictly placed under description!
  if (controls) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'draft-sp-cata-interaction-frame__controls';
    if (typeof controls === 'string') {
      controlsContainer.innerHTML = controls;
    } else if (controls instanceof HTMLElement) {
      controlsContainer.appendChild(controls);
    }
    leftCol.appendChild(controlsContainer);
  }
  headerNode.appendChild(leftCol);

  // Right Column: Minimum content width for status indicator badge
  let statusBadgeEl = null;
  if (statusIndicator !== null || hasShortcutFocus) {
    const rightCol = document.createElement('div');
    rightCol.className = 'draft-sp-cata-interaction-frame__header-right';

    statusBadgeEl = document.createElement('span');
    statusBadgeEl.className = 'ui-badge ui-badge--neutral ui-badge--sm draft-sp-cata-interaction-frame__status-badge';
    statusBadgeEl.textContent = typeof statusIndicator === 'string' ? statusIndicator : 'Click to Focus';
    rightCol.appendChild(statusBadgeEl);

    headerNode.appendChild(rightCol);
  }

  // 2. Construct Staging Well Content Node
  const well = document.createElement('div');
  well.className = 'sp-cata-frame__well';
  if (typeof stageContent === 'string') {
    well.innerHTML = stageContent;
  } else if (stageContent instanceof HTMLElement) {
    well.appendChild(stageContent);
  }

  // 3. Delegate to Three-Stage Container Structural Pattern
  const containerEl = renderThreeStageContainer({
    id,
    className: `draft-sp-cata-interaction-frame sp-cata-frame ${className}`.trim(),
    attributes: {
      ...(hasShortcutFocus ? { tabindex: '0', 'aria-label': `${title} (Keyboard Focusable)` } : {}),
      ...attributes
    },
    header: headerNode,
    content: well,
    footer: footerText ? `<span style="font-size: var(--ui-font-xs); color: var(--ui-text-muted);">${footerText}</span>` : null
  });

  // Wire Focus / Shortcut indicator if requested
  if (hasShortcutFocus && statusBadgeEl) {
    const setFocusState = (active) => {
      containerEl.classList.toggle('is-active-focused', active);
      if (active) {
        statusBadgeEl.className = 'ui-badge ui-badge--primary ui-badge--sm draft-sp-cata-interaction-frame__status-badge';
        statusBadgeEl.textContent = '● Active';
      } else {
        statusBadgeEl.className = 'ui-badge ui-badge--neutral ui-badge--sm draft-sp-cata-interaction-frame__status-badge';
        statusBadgeEl.textContent = 'Click to Focus';
      }
    };

    containerEl.addEventListener('focusin', () => setFocusState(true));
    containerEl.addEventListener('focusout', (e) => {
      if (!containerEl.contains(e.relatedTarget)) {
        setFocusState(false);
      }
    });
  }

  return containerEl;
}
