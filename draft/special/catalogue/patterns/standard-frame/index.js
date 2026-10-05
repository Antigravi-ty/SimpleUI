import './style.css';
import { getSchemaBadgeClass } from '../helpers.js';
import standardFrameSchema from './schema.json';

export { standardFrameSchema };

/**
 * renderStandardFrame - Pure declarative Standard catalogue staging frame macro.
 * 
 * Consumes the 3-stage container structural pattern and emits a pure declarative
 * Spec tree ({ pattern: 'three-stage', header, content, footer }).
 * Zero handwritten DOM manipulation.
 */
export function renderStandardFrame(options = {}, context = {}) {
  const {
    id,
    title = 'Title',
    badge = '.draft-sp-cata-standard-frame',
    status = 'draft',
    badgeClass = options.badgeClass || getSchemaBadgeClass(badge),
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

  // 1. Declarative Header Slot Spec
  const toSee = redirectLink?.toSee || '';
  const checkText = redirectLink?.checkText || redirectLink?.linkText || 'documentation';
  const targetUrl = redirectLink?.url || '#';
  const prefixText = toSee ? `To see ${toSee}, check ` : (redirectLink?.prefixText || '');

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
          } : null
        ].filter(Boolean)
      }
    ]
  };

  // 2. Declarative Staging Well Spec
  const allowExternalMutations = options.allowExternalMutations !== undefined
    ? Boolean(options.allowExternalMutations)
    : (options.preventDefault !== undefined ? !options.preventDefault : true);

  const isNoPadding = noPadding || wellPadding === 'none' || padding === 'none' || padding === 0 || padding === '0';
  const wellAttributes = {};
  if (!allowExternalMutations) {
    wellAttributes['data-prevent-default'] = 'true';
  }

  const wellSpec = {
    type: 'container',
    className: isNoPadding ? 'sp-cata-frame__well sp-cata-frame__well--no-padding' : 'sp-cata-frame__well',
    attributes: wellAttributes,
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

  // 4. Return Pure Declarative Three-Stage Container Spec
  return {
    pattern: 'three-stage',
    id,
    className: `draft-sp-cata-standard-frame sp-cata-frame ${className}`.trim(),
    attributes,
    header: headerSpec,
    content: wellSpec,
    footer: footerSpec
  };
}
