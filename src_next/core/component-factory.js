import { resolveSlotContent, registerSlotComponent } from './slot-resolver.js';
import { registerSchema } from './engine.js';

/**
 * Universal component assembly pipeline.
 *
 * Implements the mathematical formula:
 * DOM Node = Pipeline(Schema, Props, Behavior)
 *
 * Steps:
 * 1. Calculate Variants & States
 * 2. Calculate BEM Classes
 * 3. Resolve Template Definition
 * 4. Calculate Attributes
 * 5. Template Token Replacement
 * 6. Slot Resolution & Placement
 * 7. Schema IO State & Collection Reflection
 * 8. Attach Headless Behavior & Bridge Events
 *
 * @param {object} schema - Block / component schema definition
 * @param {object|string} [options={}] - Component options / props or direct text string
 * @param {Function} [behavior=null] - Headless behavior initialization function
 * @param {object} [context={}] - Resolution context
 * @returns {HTMLElement} Fully instantiated and bound DOM element
 */
export function componentFactory(schema, options = {}, behavior = null, context = {}) {
  const opts = typeof options === 'string'
    ? { content: options, text: options, label: options }
    : (options || {});

  const blockName = (schema.block || schema.name || '').toLowerCase();
  const prefix = schema.prefix || `ui-${blockName || 'component'}`;

  // Register schema in global registry
  if (blockName) {
    registerSchema(blockName, schema);
  }

  // 1. Calculate Variants & States
  const size = opts.size || schema.defaultSize || 'md';
  const modifier = opts.modifier || opts.variant || 'neutral';
  const elementVariant = opts.element || (opts.standalone ? 'standalone' : (opts.pill ? 'pill' : 'standard'));

  // 2. Calculate Classes
  const classList = [prefix];

  // Dual-class support: If prefix has an incubator namespace (e.g. prefix contains "-ui-"),
  // also add canonical class names (e.g. ui-btn, ui-btn--sm)
  const canonicalPrefix = prefix.replace(/^[a-z0-9]+-(ui-[a-z0-9-]+)/, '$1');
  const isNamespaced = canonicalPrefix !== prefix;

  if (isNamespaced) {
    classList.push(canonicalPrefix);
    if (size) classList.push(`${canonicalPrefix}--${size}`);
    if (modifier) classList.push(`${canonicalPrefix}--${modifier}`);
  }

  if (size) classList.push(`${prefix}--${size}`);
  if (modifier) classList.push(`${prefix}--${modifier}`);

  if (elementVariant && elementVariant !== 'standard') {
    classList.push(`${prefix}--${elementVariant}`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--${elementVariant}`);
  }

  // Boolean state classes
  if (opts.disabled) {
    classList.push(`${prefix}--disabled`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--disabled`);
  }
  if (opts.checked) {
    classList.push(`${prefix}--checked`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--checked`);
  }
  if (opts.indeterminate) {
    classList.push(`${prefix}--indeterminate`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--indeterminate`);
  }
  if (opts.standalone) {
    classList.push(`${prefix}--standalone`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--standalone`);
  }
  if (opts.pill) {
    classList.push(`${prefix}--pill`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--pill`);
  }
  if (opts.open) {
    classList.push(`${prefix}--open`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--open`);
  }
  if (opts.align) {
    classList.push(`${prefix}--align-${opts.align}`);
    if (isNamespaced) classList.push(`${canonicalPrefix}--align-${opts.align}`);
  }
  if (opts.className) {
    classList.push(opts.className);
  }

  const uniqueClasses = Array.from(new Set(classList.filter(Boolean))).join(' ');

  // 3. Resolve Template Definition
  let elemDef = null;
  if (Array.isArray(schema.elements) && schema.elements.length > 0) {
    elemDef = schema.elements.find(e => e.name === elementVariant) ||
              schema.elements.find(e => e.name === 'standard') ||
              schema.elements[0];
  }
  const rawTemplate = elemDef?.template || schema.template;

  // 4. Calculate Attributes
  const attrList = [];
  if (opts.disabled) {
    attrList.push('disabled');
    attrList.push('aria-disabled="true"');
  }
  if (opts.checked) {
    attrList.push('checked');
    attrList.push('aria-checked="true"');
  }
  if (opts.indeterminate) {
    attrList.push('aria-checked="mixed"');
  }
  if (opts.open) {
    attrList.push('aria-expanded="true"');
  }
  if (opts.ariaLabel || opts['aria-label']) {
    attrList.push(`aria-label="${opts.ariaLabel || opts['aria-label']}"`);
  }
  if (opts.name) {
    attrList.push(`name="${opts.name}"`);
  }
  if (opts.attributes && typeof opts.attributes === 'object') {
    for (const [k, v] of Object.entries(opts.attributes)) {
      attrList.push(`${k}="${v}"`);
    }
  }

  const attributesStr = attrList.join(' ');

  // 5. Template Token Replacement
  const slotMarker = '<slot data-slot="default"></slot>';
  let renderedHtml = rawTemplate || `<div class="{classes}" {attributes}>${slotMarker}</div>`;

  const tokenReplacements = {
    classes: uniqueClasses,
    attributes: attributesStr,
    'slot:default': slotMarker,
    ariaLabel: opts.ariaLabel || opts['aria-label'] || elemDef?.ariaLabel || '',
    ariaChecked: opts.checked ? 'true' : (opts.indeterminate ? 'mixed' : 'false'),
    ariaDisabled: opts.disabled ? 'true' : 'false',
    ariaExpanded: opts.open ? 'true' : 'false',
    triggerText: opts.triggerLabel || opts.triggerText || opts.label || opts.text || elemDef?.triggerText || 'Select option',
    min: opts.min ?? 0,
    max: opts.max ?? 100,
    step: opts.step ?? 1,
    value: opts.value ?? 50,
    ...opts
  };

  for (const [k, v] of Object.entries(tokenReplacements)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      renderedHtml = renderedHtml.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  // Parse HTML
  const tpl = document.createElement('template');
  tpl.innerHTML = renderedHtml.trim();
  const rootEl = tpl.content.firstElementChild;
  if (!rootEl) {
    throw new Error(`[ComponentFactory] Failed to generate DOM node for schema ${schema.prefix || schema.block}`);
  }

  // Ensure Canonical Metadata Identity
  rootEl.dataset.block = blockName;
  rootEl._uiSchema = schema;

  // Ensure root ID & custom attributes
  if (opts.id) rootEl.id = opts.id;
  if (opts.attributes && typeof opts.attributes === 'object') {
    for (const [k, v] of Object.entries(opts.attributes)) {
      rootEl.setAttribute(k, v);
    }
  }

  // Class enrichment for internal sub-elements (e.g. prefix__box, prefix__input)
  if (isNamespaced) {
    const canonicalBase = canonicalPrefix;
    rootEl.querySelectorAll(`[class*="${canonicalBase}__"]`).forEach((sub) => {
      const classStr = typeof sub.className === 'string'
        ? sub.className
        : (sub.className && typeof sub.className.baseVal === 'string'
            ? sub.className.baseVal
            : (sub.getAttribute ? (sub.getAttribute('class') || '') : ''));
      const match = classStr.match(new RegExp(`${canonicalBase}__([a-z0-9-]+)`));
      if (match && match[1]) {
        const subClass = `${prefix}__${match[1]}`;
        if (sub.classList && typeof sub.classList.contains === 'function') {
          if (!sub.classList.contains(subClass)) {
            sub.classList.add(subClass);
          }
        } else if (typeof sub.setAttribute === 'function' && !classStr.includes(subClass)) {
          sub.setAttribute('class', `${classStr} ${subClass}`.trim());
        }
      }
    });
  }

  // 6. Default Slot Resolution & Placement
  const defaultSlotPlaceholder = rootEl.querySelector('slot[data-slot="default"]');
  const collectionDef = schema.collection;
  const itemsList = opts[collectionDef?.itemsKey || 'items'];
  const hasCollectionItems = Array.isArray(itemsList) && itemsList.length > 0;
  const rawContent = opts.children ?? opts.content ?? opts.text ?? opts.label ??
    (opts.placeholder ? `<div class="${prefix}__container ui-${blockName}__container"><span class="${prefix}__placeholder ui-${blockName}__placeholder">${opts.placeholder}</span></div>` :
     elementVariant === 'icon-only' ? '★' :
     opts.disabled ? (blockName === 'button' ? 'Disabled' : '') :
     (hasCollectionItems ? '' : (elemDef?.defaultText || '')));

  if (defaultSlotPlaceholder) {
    if (rawContent !== undefined && rawContent !== null && rawContent !== '') {
      const resolved = resolveSlotContent(rawContent, { root: rootEl, ...context, ...opts });
      if (resolved) {
        defaultSlotPlaceholder.replaceWith(resolved);
      } else {
        defaultSlotPlaceholder.remove();
      }
    } else {
      defaultSlotPlaceholder.remove();
    }
  }

  // 7. Named Slots Resolution (Declarative Schema Slots)
  if (schema.slots && typeof schema.slots === 'object') {
    for (const [slotKey, slotDef] of Object.entries(schema.slots)) {
      if (slotKey === 'default') continue;
      const slotVal = opts[slotKey] !== undefined ? opts[slotKey] : (opts.slots && opts.slots[slotKey]);
      if (slotVal !== undefined && slotVal !== null) {
        const targetEl = slotDef.selector === ':root' ? rootEl : rootEl.querySelector(slotDef.selector);
        if (targetEl) {
          const resolved = resolveSlotContent(slotVal, { root: rootEl, slotName: slotKey, ...context });
          if (resolved) {
            if (slotDef.replace || (resolved instanceof HTMLElement && resolved.tagName === targetEl.tagName)) {
              if (targetEl.className) resolved.className = `${resolved.className} ${targetEl.className}`.trim();
              targetEl.replaceWith(resolved);
            } else {
              targetEl.innerHTML = '';
              targetEl.appendChild(resolved);
            }
          }
        }
      }
    }
  }

  // 8. Schema Collection & Dynamic Items Reflection
  if (hasCollectionItems) {
    const container = (collectionDef?.target && collectionDef.target !== ':root')
      ? rootEl.querySelector(collectionDef.target) || rootEl
      : rootEl;

    // Only auto-render items if container is suitable
    if (collectionDef || container.classList.contains(`${prefix}__menu`) || container === rootEl) {
      // Clean up lingering slot markers and placeholder nodes without wiping valid slot children
      const slotInside = container.querySelector('slot[data-slot="default"]');
      if (slotInside) slotInside.remove();
      const placeholderInside = container.querySelector(`.${prefix}__placeholder, .ui-${blockName}__placeholder`);
      if (placeholderInside) placeholderInside.remove();
      itemsList.forEach((item, idx) => {
        const isAnchor = Boolean(item.href);
        const itemTag = isAnchor ? 'a' : (collectionDef?.itemTag || 'button');
        const itemEl = document.createElement(itemTag);
        if (itemTag === 'button') itemEl.type = 'button';
        if (isAnchor) itemEl.href = item.href;
        if (collectionDef?.role) itemEl.setAttribute('role', collectionDef.role);

        const itemVal = item.value !== undefined ? item.value : (item.id !== undefined ? item.id : item.label);
        const isSelected = opts.value !== undefined ? (String(itemVal) === String(opts.value)) : (item.active || idx === 0);

        const baseClass = collectionDef?.itemClass
          ? collectionDef.itemClass.replace('{prefix}', prefix)
          : `${prefix}__item ui-${blockName}__item`;
        const activeClass = collectionDef?.activeClass
          ? collectionDef.activeClass.replace('{prefix}', prefix)
          : `${prefix}__item--active ui-${blockName}__item--active`;

        const canonicalItemClass = (blockName === 'dropdown' && !baseClass.includes('ui-dropdown__item')) ? ' ui-dropdown__item' : '';
        itemEl.className = `${baseClass}${canonicalItemClass} ${isSelected ? activeClass : ''}`.trim();
        itemEl.setAttribute('aria-selected', String(isSelected));
        itemEl.setAttribute('tabindex', isSelected ? '0' : '-1');
        itemEl.setAttribute('data-value', String(itemVal));
        if (item.id) itemEl.dataset.page = item.id;

        const labelText = item.label !== undefined ? item.label : (typeof item === 'string' ? item : (item.text || ''));
        const iconVal = item.icon || item.iconSvg || null;
        const mode = item.contentMode || opts.contentMode || (opts.element && opts.element !== 'standard' ? opts.element : (iconVal && !labelText ? 'icon-only' : (iconVal ? 'leading-icon' : 'text')));

        if (mode === 'icon-only' || item.iconOnly || (!labelText && iconVal)) {
          itemEl.setAttribute('aria-label', labelText || String(itemVal));
          if (iconVal instanceof Node) itemEl.appendChild(iconVal);
          else if (typeof iconVal === 'string') {
            const span = document.createElement('span');
            span.className = `${prefix}__icon`;
            span.innerHTML = iconVal;
            itemEl.appendChild(span);
          }
        } else if (mode === 'trailing-icon' || item.iconPosition === 'trailing') {
          if (labelText) {
            const span = document.createElement('span');
            span.textContent = labelText;
            itemEl.appendChild(span);
          }
          if (iconVal instanceof Node) itemEl.appendChild(iconVal);
          else if (typeof iconVal === 'string') {
            const span = document.createElement('span');
            span.className = `${prefix}__icon`;
            span.innerHTML = iconVal;
            itemEl.appendChild(span);
          }
        } else if (iconVal) {
          if (iconVal instanceof Node) itemEl.appendChild(iconVal);
          else if (typeof iconVal === 'string') {
            const span = document.createElement('span');
            span.className = `${prefix}__icon`;
            span.innerHTML = iconVal;
            itemEl.appendChild(span);
          }
          if (labelText) {
            const span = document.createElement('span');
            span.textContent = labelText;
            itemEl.appendChild(span);
          }
        } else {
          if (labelText) itemEl.textContent = labelText;
        }

        if (item.badge) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'ui-badge ui-badge--neutral ui-badge--sm ui-dropdown__item-badge--plain';
          badgeSpan.textContent = item.badge;
          itemEl.appendChild(badgeSpan);
        }

        itemEl.addEventListener('click', (e) => {
          if (typeof item.onClick === 'function') item.onClick(item, e);
          if (typeof opts.onSelect === 'function') opts.onSelect(item, e);
        });

        container.appendChild(itemEl);
      });
    }
  }

  // 9. Schema IO Model State Synchronization
  if (opts.unit) {
    rootEl.dataset.unit = opts.unit;
  }

  const ioModel = schema.io?.model;
  if (ioModel?.selector) {
    const subEl = rootEl.querySelector(ioModel.selector);
    if (subEl) {
      if (opts.name && 'name' in subEl) subEl.name = opts.name;
      if (opts.checked !== undefined && 'checked' in subEl) subEl.checked = Boolean(opts.checked);
      if (opts.disabled !== undefined && 'disabled' in subEl) subEl.disabled = Boolean(opts.disabled);
      if (opts.indeterminate !== undefined && 'indeterminate' in subEl) subEl.indeterminate = Boolean(opts.indeterminate);
      if (opts.value !== undefined && 'value' in subEl) subEl.value = String(opts.value);
    }
  }

  if (ioModel?.display?.selector) {
    const disp = rootEl.querySelector(ioModel.display.selector);
    if (disp) {
      const initialVal = opts.value ?? 50;
      const fmt = ioModel.display.format || '{value}';
      disp.textContent = fmt.replace('{value}', String(initialVal)).replace('{unit}', opts.unit || '');
    }
  }

  // 10. Attach Headless Behavior
  const effectiveBehavior = behavior || schema.behavior;
  if (typeof effectiveBehavior === 'function') {
    try {
      effectiveBehavior(rootEl);
    } catch (err) {
      console.error(`[ComponentFactory] Error running behavior on ${prefix}:`, err);
    }
  }

  // 11. Event Wiring & Controlled Callback Bridging
  if (typeof opts.onClick === 'function') {
    rootEl.addEventListener('click', (e) => {
      if (opts.disabled || rootEl.disabled || rootEl.classList.contains(`${prefix}--disabled`)) {
        e.preventDefault();
        return;
      }
      opts.onClick(e, rootEl);
      if (typeof opts.onStateChange === 'function') {
        opts.onStateChange({ type: 'click', target: rootEl });
      }
    });
  }

  if (typeof opts.onChange === 'function') {
    const input = rootEl.querySelector('input');
    if (input) {
      input.addEventListener('change', (e) => {
        opts.onChange(input.type === 'checkbox' ? input.checked : input.value, e, rootEl);
      });
    } else {
      rootEl.addEventListener('change', (e) => {
        const val = e.detail?.value !== undefined ? e.detail.value : (e.detail?.checked !== undefined ? e.detail.checked : e.target.value);
        opts.onChange(val, e, rootEl);
      });
    }
  }

  if (typeof opts.onInput === 'function') {
    const input = rootEl.querySelector('input');
    if (input) {
      input.addEventListener('input', (e) => {
        opts.onInput(Number(input.value), e, rootEl);
      });
    }
  }

  if (typeof opts.onSelect === 'function') {
    rootEl.addEventListener('select', (e) => {
      opts.onSelect(e.detail, e);
    });
  }

  if (typeof opts.onToggle === 'function') {
    rootEl.addEventListener('toggle', (e) => {
      opts.onToggle(e.detail?.open, e);
    });
  }

  return rootEl;
}

/**
 * Higher-order component factory creator.
 *
 * Automatically registers the component into the SlotResolver registry
 * and returns an executable factory function.
 *
 * @param {object} schema - Component schema.json
 * @param {Function} [behavior=null] - Headless behavior.js
 * @returns {Function} Callable factory function (options) => HTMLElement
 */
export function createComponentFactory(schema, behavior = null) {
  const factory = function renderComponent(options = {}, context = {}) {
    return componentFactory(schema, options, behavior, context);
  };

  const compName = (schema.block || schema.name || '').toLowerCase();
  if (compName) {
    registerSlotComponent(compName, factory);
  }

  return factory;
}

/**
 * Universal declarative renderer.
 *
 * @param {object} spec - Component specification ({ type: 'button', props: { ... } })
 * @param {object} [context={}]
 * @returns {Node|null}
 */
export function render(spec, context = {}) {
  return resolveSlotContent(spec, context);
}
