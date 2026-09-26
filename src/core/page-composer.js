import { bindAllBehaviors } from '../blocks/index.js';

/**
 * PageComposer - Declarative DOM assembly with recursive sub-schemas and reactive store binding.
 */
export class PageComposer {
  constructor(engine, options = {}) {
    this.engine = engine;
    this.subSchemas = new Map(Object.entries(options.subSchemas || {}));
    this.resolver = options.resolver || null;
    this.store = options.store || null;
  }

  registerSubSchema(id, schema) {
    this.subSchemas.set(id, schema);
    return this;
  }

  loadAutoDiscoveredPages(globModules) {
    for (const [path, mod] of Object.entries(globModules)) {
      const s = mod.default || mod;
      const key = s.id || path.replace(/^.*\/schemas\/pages\//, '').replace(/\.json$/, '');
      this.registerSubSchema(key, s);
    }
    return this;
  }

  renderPage(pageSchema, options = {}) {
    const store = options.store || this.store;
    const root = document.createElement(pageSchema.tag || 'div');
    if (pageSchema.id) root.id = pageSchema.id;
    if (pageSchema.className) root.className = pageSchema.className;
    if (pageSchema.attributes) {
      for (const [k, v] of Object.entries(pageSchema.attributes)) root.setAttribute(k, v);
    }
    for (const child of pageSchema.children || []) {
      const childEl = this.renderNode(child, { store });
      if (childEl) root.appendChild(childEl);
    }
    bindAllBehaviors(root);
    if (store && typeof store.initEventDelegation === 'function') {
      store.initEventDelegation(root);
    }
    return root;
  }

  renderNode(node, context = {}) {
    if (!node) return null;
    const store = context.store || this.store;
    const refKey = node.$ref || node.schema;
    if (refKey) {
      const sub = this.subSchemas.get(refKey) || (this.resolver ? this.resolver(refKey) : null);
      if (sub) {
        const subEl = this.renderPage(sub, { store });
        if (node.className) subEl.classList.add(...node.className.split(' ').filter(Boolean));
        if (node.id) subEl.id = node.id;
        return subEl;
      }
    }
    if (node.type === 'container' || node.type === 'row' || node.type === 'box' || node.type === 'stack') {
      const el = document.createElement(node.tag || 'div');
      el.className = node.className || (node.type === 'row' ? 'ui-layout-row' : 'ui-layout-box');
      if (node.id) el.id = node.id;
      if (node.label) {
        const lbl = document.createElement('span');
        lbl.className = node.labelClass || 'ui-layout-label';
        lbl.textContent = node.label;
        el.appendChild(lbl);
      }
      for (const child of node.children || []) {
        const childEl = this.renderNode(child, { store });
        if (childEl) el.appendChild(childEl);
      }
      return el;
    }
    if (node.block) return this.renderBlockNode(node, { store });
    if (node.text !== undefined) {
      const el = document.createElement(node.tag || 'span');
      if (node.className) el.className = node.className;
      if (node.id) el.id = node.id;
      if (node.action) el.setAttribute('data-action', node.action);
      if (node.bindText) el.setAttribute('data-bind-text', node.bindText);
      const textVal = (store && node.bindText && store.get(node.bindText) !== undefined)
        ? store.get(node.bindText)
        : node.text;
      el.textContent = textVal;
      return el;
    }
    return null;
  }

  renderBlockNode(node, context = {}) {
    const store = context.store || this.store;
    const s = this.engine ? this.engine.getBlock(node.block) : null;
    const prefix = s?.prefix || `ui-${node.block}`;
    const size = node.size || s?.defaultSize || 'md';
    const mod = node.modifier || '';
    const elemDef = s?.elements?.find(e => e.name === (node.element || 'standard')) || s?.elements?.[0];

    const bindKey = node.bind || node.props?.bind;
    const initialStoreVal = (store && bindKey) ? store.get(bindKey) : undefined;

    const classList = [prefix];
    if (size) classList.push(`${prefix}--${size}`);
    if (mod) classList.push(`${prefix}--${mod}`);
    if (elemDef?.selector) classList.push(`${prefix}${elemDef.selector}`);
    if (node.className) classList.push(node.className);

    const state = s && this.engine ? this.engine.resolveModifierAttributes(s, mod)
      : { attributesStr: '', ariaChecked: 'false', ariaDisabled: 'false' };
    const template = elemDef?.template || `<button type="button" class="{classes}" {attributes}>{slot:default}</button>`;
    const props = {};
    for (const [pk, pv] of Object.entries(s?.props || {})) if (pv.default !== undefined) props[pk] = pv.default;
    Object.assign(props, node.props || {});
    if (initialStoreVal !== undefined) props.value = initialStoreVal;

    const uniqueClasses = Array.from(new Set(classList.filter(Boolean))).join(' ');
    let html = template
      .replace(/\{classes\}/g, uniqueClasses)
      .replace(/\{slot:default\}/g, node.text !== undefined ? node.text : (elemDef?.defaultText ?? ''))
      .replace(/\{ariaLabel\}/g, node.ariaLabel || elemDef?.ariaLabel || '')
      .replace(/\{ariaChecked\}/g, initialStoreVal !== undefined ? String(Boolean(initialStoreVal)) : (node.checked !== undefined ? String(node.checked) : state.ariaChecked))
      .replace(/\{ariaDisabled\}/g, node.disabled ? 'true' : state.ariaDisabled)
      .replace(/\{attributes\}/g, state.attributesStr);
    for (const [pk, pv] of Object.entries(props)) html = html.replace(new RegExp(`\\{${pk}\\}`, 'g'), pv);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const el = wrapper.firstElementChild || wrapper;
    if (node.id) el.id = node.id;
    if (node.action) el.setAttribute('data-action', node.action);
    if (node.ariaLabel) el.setAttribute('aria-label', node.ariaLabel);
    if (bindKey) el.setAttribute('data-bind', bindKey);
    if (node.description || props.description) el.setAttribute('data-description', node.description || props.description);
    if (props.value !== undefined) {
      const input = el.querySelector('input') || (el.tagName === 'INPUT' ? el : null);
      if (input) input.value = props.value;
      const display = el.querySelector('[data-bind="value"], .ui-slider__value, .ui-stepper__value');
      if (display) display.textContent = props.value;
    }
    return el;
  }
}
