import './style.css';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import standardFrameSchema from './schema.json';

export { standardFrameSchema };

/**
 * renderStandardFrame - Standard catalogue staging frame (.draft-sp-cata-standard-frame).
 * Consumes the 3-stage container pattern and renders Title, Badge, Description,
 * optional Description Hyperlink, and Staging Well without top-right controls.
 */
export function renderStandardFrame(options = {}) {
  const {
    id,
    title = 'Title',
    badge = '.draft-sp-cata-standard-frame',
    status = 'draft',
    badgeClass = status === 'draft' ? 'ui-badge--neutral' : 'ui-badge--primary-subtle',
    description,
    hasRedirectReference = false,
    haveRedirectReference = false,
    redirectLink,
    stageContent,
    footerText,
    wellPadding = 'normal',
    padding,
    noPadding = false,
    className = '',
    attributes = {}
  } = options;

  if (description === undefined || description === null || description === '') {
    throw new Error('[CatalogueSpecialStandardFrame] "description" is required in frame configuration.');
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

  // 1. Construct Frame Header Node
  const headerNode = document.createElement('div');
  headerNode.className = 'sp-cata-frame__header';

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

  headerNode.appendChild(leftCol);

  // 2. Construct Staging Well Content Node
  const isNoPadding = noPadding || wellPadding === 'none' || padding === 'none' || padding === 0 || padding === '0';
  const well = document.createElement('div');
  well.className = isNoPadding ? 'sp-cata-frame__well sp-cata-frame__well--no-padding' : 'sp-cata-frame__well';

  if (typeof stageContent === 'string') {
    well.innerHTML = stageContent;
  } else if (stageContent instanceof HTMLElement) {
    well.appendChild(stageContent);
  }

  // 3. Delegate to Three-Stage Container Structural Pattern
  return renderThreeStageContainer({
    id,
    className: `draft-sp-cata-standard-frame sp-cata-frame ${className}`.trim(),
    attributes,
    header: headerNode,
    content: well,
    footer: footerText ? `<span style="font-size: var(--ui-font-xs); color: var(--ui-text-muted);">${footerText}</span>` : null
  });
}
