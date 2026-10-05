import './styles/index.css';
import { resolveSlotContent } from '../../special/catalogue/patterns/slot-resolver.js';
export { default as threeStageSchema } from './schema.json';

/**
 * Pure 3-stage container structural pattern:
 * Divides layout into top (header), middle (content), and optional bottom (footer).
 */
export function renderThreeStageContainer(options = {}, context = {}) {
  const { id, className = '', header, content, footer, attributes = {} } = options;

  const containerEl = document.createElement('section');
  containerEl.className = `draft-ui-three-stage ${className}`.trim();
  if (id) containerEl.id = id;
  for (const [k, v] of Object.entries(attributes)) {
    containerEl.setAttribute(k, v);
  }

  // 1. Header (Top)
  if (header !== undefined && header !== null && header !== false) {
    const headerEl = document.createElement('div');
    headerEl.className = 'draft-ui-three-stage__header';
    const resolved = resolveSlotContent(header, context);
    if (resolved) headerEl.appendChild(resolved);
    containerEl.appendChild(headerEl);
  }

  // 2. Content (Middle)
  if (content !== undefined && content !== null && content !== false) {
    const contentEl = document.createElement('div');
    contentEl.className = 'draft-ui-three-stage__content';
    const resolved = resolveSlotContent(content, context);
    if (resolved) contentEl.appendChild(resolved);
    containerEl.appendChild(contentEl);
  }

  // 3. Footer (Bottom, Optional)
  if (footer !== undefined && footer !== null && footer !== false && footer !== '') {
    const footerEl = document.createElement('div');
    footerEl.className = 'draft-ui-three-stage__footer';
    const resolved = resolveSlotContent(footer, context);
    if (resolved) footerEl.appendChild(resolved);
    containerEl.appendChild(footerEl);
  }

  return containerEl;
}
