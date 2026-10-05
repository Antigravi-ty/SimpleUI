import './styles/index.css';
import { interpret } from '@src_next/core/slot-resolver.js';
export { default as centerPlaceholderSchema } from './schema.json';

export function renderCenterPlaceholder(options = {}, context = {}) {
  const { id, className = '', content = '', attributes = {} } = options;
  const el = document.createElement('div');
  el.className = `draft-ui-center-placeholder ${className}`.trim();
  if (id) el.id = id;
  for (const [k, v] of Object.entries(attributes)) {
    el.setAttribute(k, v);
  }
  if (typeof content === 'string') {
    el.innerHTML = content;
  } else if (content) {
    const resolved = interpret(content, context);
    if (resolved) el.appendChild(resolved);
  }
  return el;
}
