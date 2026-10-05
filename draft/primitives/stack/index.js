import './styles/index.css';
import { interpret } from '@src_next/core/slot-resolver.js';
export { default as stackSchema } from './schema.json';

export function renderStack(options = {}, context = {}) {
  const { id, className = '', gap = 'md', align, children = [], attributes = {} } = options;
  const classes = ['draft-ui-stack', `draft-ui-stack--gap-${gap}`];
  if (align) classes.push(`draft-ui-stack--align-${align}`);
  if (className) classes.push(className);

  const el = document.createElement('div');
  el.className = classes.join(' ');
  if (id) el.id = id;
  for (const [k, v] of Object.entries(attributes)) {
    el.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      const trimmed = child.trim();
      if (/<[a-z][\s\S]*>/i.test(trimmed)) {
        const item = document.createElement('div');
        item.innerHTML = child;
        el.appendChild(item);
      } else {
        const item = document.createElement('div');
        item.textContent = child;
        el.appendChild(item);
      }
    } else {
      const childEl = interpret(child, context);
      if (childEl) el.appendChild(childEl);
    }
  }
  return el;
}
