import schema from './schema.json' with { type: 'json' };
import './styles/index.css';
import { resolveSlotContent } from '../../special/catalogue/patterns/slot-resolver.js';

/**
 * renderDropdownMenu - Structural pattern for vertical interactive menu lists.
 * 
 * @param {object|Array} [options={}] - Options object or direct items array
 * @returns {HTMLDivElement} Rendered menu DOM element
 */
export function renderDropdownMenu(options = {}) {
  const opts = Array.isArray(options) ? { items: options } : options;
  const {
    id,
    items = [],
    onSelect,
    className = '',
    attributes = {}
  } = opts;

  const menu = document.createElement('div');
  const prefix = schema.prefix || 'draft-ui-dropdown-menu';
  menu.className = `${prefix} ui-dropdown-menu ${className}`.trim();
  menu.setAttribute('role', 'menu');
  if (id) menu.id = id;

  for (const [k, v] of Object.entries(attributes)) {
    menu.setAttribute(k, v);
  }

  items.forEach(item => {
    if (item.type === 'divider' || item.divider) {
      const divider = document.createElement('hr');
      divider.className = `${prefix}__divider ui-dropdown-menu__divider`;
      menu.appendChild(divider);
      return;
    }

    const isAnchor = Boolean(item.href);
    const itemEl = document.createElement(isAnchor ? 'a' : 'button');
    if (!isAnchor) itemEl.type = 'button';
    else itemEl.href = item.href;

    const itemClasses = [`${prefix}__item`, 'ui-dropdown-menu__item', 'ui-dropdown__item'];
    if (item.active) itemClasses.push(`${prefix}__item--active ui-dropdown-menu__item--active`);
    if (item.danger) itemClasses.push(`${prefix}__item--danger ui-dropdown-menu__item--danger`);
    if (item.disabled) {
      itemClasses.push(`${prefix}__item--disabled ui-dropdown-menu__item--disabled`);
      itemEl.disabled = true;
      itemEl.setAttribute('aria-disabled', 'true');
    }
    itemEl.className = itemClasses.join(' ');
    itemEl.setAttribute('role', 'menuitem');
    if (item.id) itemEl.dataset.item = item.id;

    const leftGroup = document.createElement('span');
    leftGroup.style.cssText = 'display: inline-flex; align-items: center; gap: var(--ui-space-2);';

    if (item.icon) {
      const iconNode = resolveSlotContent(item.icon);
      if (iconNode) leftGroup.appendChild(iconNode);
    }

    const labelNode = resolveSlotContent(item.label || item.text || item.content || '');
    if (labelNode) leftGroup.appendChild(labelNode);
    itemEl.appendChild(leftGroup);

    if (item.badge) {
      const badgeNode = resolveSlotContent(item.badge);
      if (badgeNode) itemEl.appendChild(badgeNode);
    }

    itemEl.addEventListener('click', (e) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }
      if (typeof item.onClick === 'function') {
        item.onClick(item, e);
      }
      if (typeof onSelect === 'function') {
        onSelect(item, e);
      }
    });

    menu.appendChild(itemEl);
  });

  return menu;
}
