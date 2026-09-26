import './styles/index.css';
export { default as stackSchema } from './schema.json';

export function renderStack(options = {}) {
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
      const item = document.createElement('div');
      item.innerHTML = child;
      el.appendChild(item);
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  }
  return el;
}
