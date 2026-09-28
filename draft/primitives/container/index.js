import './styles/index.css';
import { interpret } from '@src_next/core/slot-resolver.js';
export { default as containerSchema } from './schema.json';

export function renderContainer(options = {}, context = {}) {
  const { id, className = '', content = '', children = [], attributes = {} } = options;
  const el = document.createElement('div');
  el.className = `draft-ui-container ${className}`.trim();
  if (id) el.id = id;
  for (const [k, v] of Object.entries(attributes)) {
    el.setAttribute(k, v);
  }
  if (typeof content === 'string' && content !== '') {
    el.innerHTML = content;
  } else if (content) {
    const resolved = interpret(content, context);
    if (resolved) el.appendChild(resolved);
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      const resolved = interpret(child, context);
      if (resolved) el.appendChild(resolved);
    }
  }
  return el;
}
