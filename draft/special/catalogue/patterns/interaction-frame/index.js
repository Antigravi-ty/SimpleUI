import './style.css';
import { getSchemaBadgeClass } from '../helpers.js';
import interactionFrameSchema from './schema.json';

export { interactionFrameSchema };

const DEFAULT_INTERACTION_CONTROLS = {
  block: 'checkbox',
  props: {
    label: 'Interactive Option',
    size: 'sm',
    modifier: 'neutral',
    checked: true,
    attributes: { style: 'margin: 0; user-select: none;' }
  }
};

/**
 * renderInteractionFrame - Pure declarative Interaction catalogue staging macro.
 * Consumes the 3-stage container structural pattern and emits a pure declarative
 * Spec tree ({ pattern: 'three-stage', header, content, footer }).
 * Zero handwritten DOM manipulation.
 */
export function renderInteractionFrame(options = {}, context = {}) {
  const {
    id,
    title = 'Interaction Frame',
    badge = '.draft-sp-cata-interaction-frame',
    status = 'draft',
    badgeClass = options.badgeClass || getSchemaBadgeClass(badge),
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

  // 1. Declarative Header Slot Spec
  const toSee = redirectLink?.toSee || '';
  const checkText = redirectLink?.checkText || redirectLink?.linkText || 'documentation';
  const targetUrl = redirectLink?.url || '#';
  const prefixText = toSee ? `To see ${toSee}, check ` : (redirectLink?.prefixText || '');

  const showStatus = Boolean(options.hasStatusIndicator ?? (statusIndicator !== null || hasShortcutFocus));
  const defaultStatus = hasShortcutFocus ? 'Click to Focus' : 'Status: Ready';
  const statusContent = typeof statusIndicator === 'string' ? statusIndicator : defaultStatus;

  const headerSpec = {
    type: 'box',
    className: 'sp-cata-frame__header',
    children: [
      {
        type: 'box',
        className: 'sp-cata-frame__header-left',
        children: [
          {
            type: 'row',
            className: 'sp-cata-frame__title-row',
            children: [
              { tag: 'h3', className: 'sp-cata-frame__title', text: title },
              badge ? { block: 'badge', size: 'sm', className: badgeClass, content: badge } : null
            ].filter(Boolean)
          },
          { tag: 'p', className: 'sp-cata-frame__desc', text: description },
          (isRedirectAllowed && redirectLink) ? {
            tag: 'p',
            className: 'sp-cata-frame__redirect',
            children: [
              prefixText ? { tag: 'span', text: prefixText } : null,
              {
                tag: 'a',
                className: 'sp-cata-frame__redirect-link',
                attributes: { href: targetUrl },
                text: `${checkText} ↗`
              }
            ].filter(Boolean)
          } : null,
          controls ? {
            type: 'container',
            className: 'draft-sp-cata-interaction-frame__controls',
            content: controls
          } : null
        ].filter(Boolean)
      },
      showStatus ? {
        type: 'box',
        className: 'draft-sp-cata-interaction-frame__header-right',
        children: [
          {
            block: 'badge',
            modifier: 'neutral',
            size: 'sm',
            className: 'draft-sp-cata-interaction-frame__status-badge',
            content: statusContent
          }
        ]
      } : null
    ].filter(Boolean)
  };

  // 2. Declarative Staging Well Spec
  const wellSpec = {
    type: 'container',
    className: 'sp-cata-frame__well',
    content: stageContent
  };

  // 3. Declarative Footer Spec
  const showFooter = Boolean((options.hasFooter ?? options.haveFooter ?? true) && footerText);
  const footerSpec = showFooter ? {
    tag: 'span',
    attributes: {
      style: 'font-size: var(--ui-font-xs); color: var(--ui-text-muted);'
    },
    text: footerText
  } : null;

  return {
    pattern: 'three-stage',
    id,
    className: `draft-sp-cata-interaction-frame sp-cata-frame ${className}`.trim(),
    attributes: {
      ...(hasShortcutFocus ? { tabindex: '0', 'aria-label': `${title} (Keyboard Focusable)` } : {}),
      ...attributes
    },
    header: headerSpec,
    content: wellSpec,
    footer: footerSpec
  };
}
