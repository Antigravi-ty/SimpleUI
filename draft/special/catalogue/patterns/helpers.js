/**
 * getSchemaBadge - Automatically derive class badge text from schema metadata.
 * Prioritizes prefix, then first className token, then id.
 *
 * @param {object} schema - Block or composition JSON schema
 * @returns {string} Formatted dot-prefixed CSS class identifier (e.g. '.draft-ui-btn')
 */
export function getSchemaBadge(schema) {
  if (!schema) return '';
  if (schema.prefix) return `.${schema.prefix}`;
  if (schema.className) return `.${schema.className.trim().split(/\s+/)[0]}`;
  return schema.id ? `.${schema.id}` : '';
}

/**
 * getSchemaBadgeClass - Derive badge color modifier directly from badge text.
 * - Any .draft- (whether .draft-ui- or .draft-sp-) -> Neutral (gray)
 * - Solidified .sp- -> Purple subtle
 * - Standard Core Stable -> Primary subtle (blue)
 *
 * @param {object|string} schemaOrBadge - Schema object or dot-prefixed badge string
 * @returns {string} CSS modifier class
 */
export function getSchemaBadgeClass(schemaOrBadge) {
  if (!schemaOrBadge) return 'ui-badge--neutral';
  const badgeText = (typeof schemaOrBadge === 'string' ? schemaOrBadge : getSchemaBadge(schemaOrBadge)).toLowerCase();

  // 1. Any draft prefix is strictly draft incubator -> gray
  if (badgeText.includes('.draft-')) {
    return 'ui-badge--neutral';
  }

  // 2. Pure solidified special (.sp-) -> purple
  if (badgeText.startsWith('.sp-') || badgeText.includes('sp-cata-')) {
    return 'ui-badge--purple-subtle';
  }

  // 3. Stable component -> blue
  return 'ui-badge--primary-subtle';
}
