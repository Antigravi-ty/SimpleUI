import './styles/index.css';
export { default as rowSchema } from './schema.json';

export function renderRow(options = {}) {
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
      const item = document.createElement('div');
      item.innerHTML = child;
      el.appendChild(item);
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  }
  return el;
}
