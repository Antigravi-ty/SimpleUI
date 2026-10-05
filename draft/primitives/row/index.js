import './styles/index.css';
import { interpret } from '@src_next/core/slot-resolver.js';
export { default as rowSchema } from './schema.json';

export function renderRow(options = {}, context = {}) {
  const { id, className = '', gap = 'md', justify, align, children = [], attributes = {} } = options;
  const classes = ['draft-ui-row', `draft-ui-row--gap-${gap}`];
  if (justify) classes.push(`draft-ui-row--${justify}`);
  if (align) classes.push(`draft-ui-row--align-${align}`);
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
