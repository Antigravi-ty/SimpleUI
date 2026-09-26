import './styles/index.css';
export { default as threeStageSchema } from './schema.json';

/**
 * Pure 3-stage container structural pattern:
 * Divides layout into top (header), middle (content), and optional bottom (footer).
 */
export function renderThreeStageContainer(options = {}) {
  const { id, className = '', header, content, footer, attributes = {} } = options;

  const containerEl = document.createElement('section');
  containerEl.className = `draft-ui-three-stage ${className}`.trim();
  if (id) containerEl.id = id;
  for (const [k, v] of Object.entries(attributes)) {
    containerEl.setAttribute(k, v);
  }

  // 1. Header (Top)
  if (header !== undefined && header !== null) {
    const headerEl = document.createElement('div');
    headerEl.className = 'draft-ui-three-stage__header';
    if (typeof header === 'string') {
      headerEl.innerHTML = header;
    } else if (header instanceof HTMLElement) {
      headerEl.appendChild(header);
    }
    containerEl.appendChild(headerEl);
  }

  // 2. Content (Middle)
  const contentEl = document.createElement('div');
  contentEl.className = 'draft-ui-three-stage__content';
  if (typeof content === 'string') {
    contentEl.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentEl.appendChild(content);
  }
  containerEl.appendChild(contentEl);

  // 3. Footer (Bottom, Optional)
  if (footer !== undefined && footer !== null && footer !== false && footer !== '') {
    const footerEl = document.createElement('div');
    footerEl.className = 'draft-ui-three-stage__footer';
    if (typeof footer === 'string') {
      footerEl.innerHTML = footer;
    } else if (footer instanceof HTMLElement) {
      footerEl.appendChild(footer);
    }
    containerEl.appendChild(footerEl);
  }

  return containerEl;
}
