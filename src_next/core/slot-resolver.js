import { getSchema } from './engine.js';
import { componentFactory } from './component-factory.js';
import { bindAllBehaviors } from './behavior-registry.js';

/**
 * Universal Polymorphic Slot Resolver & Semantic Interpreter.
 * 
 * Implements polymorphic interpretation of:
 * 1. Functions / dynamic factories -> evalResult -> recursive interpret
 * 2. Dynamic Promises / async specs -> placeholder -> hydrate
 * 3. Arrays -> DocumentFragment recursive aggregation
 * 4. Native DOM Node -> Pass through untouched
 * 5. JavaScript Links / External Modules -> dynamic ESM import & hydration
 * 6. Patterns -> Macro expansion via Pattern Registry & recursive interpret
 * 7. Object Declarations:
 *    - explicit render()
 *    - schema references ($ref / schema)
 *    - declarative component specs (block / component)
 *    - layout primitives (container, row, box, stack, page)
 *    - text nodes, common keys
 * 8. Strings -> HTML fragment or TextNode
 * 9. Primitives (Number, Boolean) -> TextNode
 */

export const componentRegistry = new Map();
export const patternRegistry = new Map();
export const moduleRegistry = new Map();

/**
 * Register a component renderer to allow declarative spec resolution in slots.
 * @param {string} name - Component or block identifier (e.g., 'checkbox', 'button')
 * @param {Function} renderer - Component factory function (e.g., renderCheckbox)
 */
export function registerSlotComponent(name, renderer) {
  if (name && typeof renderer === 'function') {
    componentRegistry.set(String(name).toLowerCase(), renderer);
  }
}

/**
 * Retrieve a registered component renderer.
 * @param {string} name - Component name
 * @returns {Function|undefined}
 */
export function getSlotComponent(name) {
  return componentRegistry.get(String(name).toLowerCase());
}

/**
 * Register a high-order pattern renderer (e.g., 'matrix-frame', 'standard-frame').
 * @param {string} name - Pattern identifier
 * @param {Function} renderer - Pattern factory / macro function
 */
export function registerPattern(name, renderer) {
  if (name && typeof renderer === 'function') {
    patternRegistry.set(String(name).toLowerCase(), renderer);
  }
}

/**
 * Retrieve a registered pattern renderer.
 * @param {string} name - Pattern identifier
 * @returns {Function|undefined}
 */
export function getPattern(name) {
  return patternRegistry.get(String(name).toLowerCase());
}

/**
 * Register a preloaded JavaScript module for synchronous link resolution.
 * @param {string} url - Script / module URL or path
 * @param {object|Function} mod - Module object or export function
 */
export function registerModule(url, mod) {
  if (url && mod) {
    moduleRegistry.set(url, mod);
  }
}

/**
 * Retrieve a registered JavaScript module.
 * @param {string} url - Module URL or path
 * @returns {object|Function|undefined}
 */
export function getModule(url) {
  return moduleRegistry.get(url);
}

/**
 * interpret - Universal semantic interpreter and polymorphic reducer.
 * 
 * @param {any} input - Arbitrary input (Spec object, Node, string, function, array, Promise)
 * @param {object} [context={}] - Contextual state, store, subSchemas, engine, patterns, modules
 * @returns {Node|null} Resolved DOM Node, DocumentFragment, or null
 */
export function interpret(input, context = {}) {
  if (input === null || input === undefined || input === false) {
    return null;
  }

  // 1. Dynamic getter / Factory function
  if (typeof input === 'function') {
    try {
      const evalResult = input(context);
      return interpret(evalResult, context);
    } catch (err) {
      console.error('[SemanticInterpreter] Error evaluating dynamic function:', err);
      const errNode = document.createElement('span');
      errNode.style.color = 'var(--ui-color-danger, #e53e3e)';
      errNode.textContent = '[Interpretation Error]';
      return errNode;
    }
  }

  // 2. Dynamic Promise / Asynchronous Spec Resolution
  if (input && typeof input.then === 'function') {
    const placeholder = document.createElement(context.placeholderTag || 'div');
    placeholder.className = 'ui-async-placeholder';
    input.then((resolvedVal) => {
      const node = interpret(resolvedVal, context);
      if (node) {
        if (placeholder.parentNode) {
          placeholder.replaceWith(node);
        } else {
          placeholder.appendChild(node);
        }
      }
    }).catch((err) => {
      console.error('[SemanticInterpreter] Error resolving async spec:', err);
      placeholder.textContent = '[Interpretation Error]';
    });
    return placeholder;
  }

  // 3. Arrays (Recursive aggregation into a DocumentFragment)
  if (Array.isArray(input)) {
    const fragment = document.createDocumentFragment();
    input.forEach((item) => {
      const childNode = interpret(item, context);
      if (childNode) fragment.appendChild(childNode);
    });
    return fragment;
  }

  // 4. Native DOM Node (HTMLElement, SVGElement, DocumentFragment, Text)
  const isNode = (typeof Node !== 'undefined' && input instanceof Node) ||
                 (input && typeof input.nodeType === 'number');
  if (isNode) {
    return input;
  }

  // 5. Object Declarations
  if (typeof input === 'object') {
    // 5.1 JavaScript Link / External Module Resolution
    // Interprets external JS links specified in JSON (via script, module, or .js in src)
    const scriptSrc = input.script || input.module || (typeof input.src === 'string' && input.src.endsWith('.js') ? input.src : null);
    if (scriptSrc) {
      const mountEl = document.createElement(input.tag || 'div');
      if (input.className) mountEl.className = input.className;
      if (input.id) mountEl.id = input.id;
      if (input.attributes && typeof input.attributes === 'object') {
        for (const [k, v] of Object.entries(input.attributes)) mountEl.setAttribute(k, v);
      }
      mountEl.dataset.script = scriptSrc;

      const executeModule = (mod) => {
        const renderer = mod.render || mod.default || mod;
        const evaluated = typeof renderer === 'function' ? renderer(input.props || input, context) : renderer;
        const resolved = interpret(evaluated, context);
        if (resolved) {
          if (mountEl.parentNode) {
            mountEl.replaceWith(resolved);
          } else {
            mountEl.innerHTML = '';
            mountEl.appendChild(resolved);
          }
          if (resolved.nodeType === 1) {
            bindAllBehaviors(resolved);
            if (context.store && typeof context.store.initEventDelegation === 'function') {
              context.store.initEventDelegation(resolved);
            }
          }
        }
      };

      const cached = moduleRegistry.get(scriptSrc) || (context.modules && context.modules[scriptSrc]);
      if (cached) {
        executeModule(cached);
        return mountEl;
      }

      import(/* @vite-ignore */ scriptSrc)
        .then((mod) => {
          moduleRegistry.set(scriptSrc, mod);
          executeModule(mod);
        })
        .catch((err) => {
          console.error(`[SemanticInterpreter] Error loading JS module link "${scriptSrc}":`, err);
          mountEl.textContent = `[Failed to load script: ${scriptSrc}]`;
        });

      return mountEl;
    }

    // 5.2 Explicit render method
    if (typeof input.render === 'function') {
      return interpret(input.render(context), context);
    }

    // 5.3 High-Order Pattern Resolution (macro expansion)
    const patternName = input.pattern ? String(input.pattern).toLowerCase() : null;
    if (patternName) {
      if (patternName.endsWith('.js')) {
        return interpret({ script: input.pattern, props: input.props || input, ...input }, context);
      }
      const patternRenderer = (context.patterns && context.patterns[patternName]) || getPattern(patternName);
      if (typeof patternRenderer === 'function') {
        const patternProps = { ...input, ...(input.props || {}) };
        const patternResult = patternRenderer(patternProps, context);
        const resolved = interpret(patternResult, context);
        if (input.id && resolved && resolved.setAttribute) resolved.id = input.id;
        if (input.className && resolved && resolved.classList) {
          resolved.classList.add(...input.className.split(' ').filter(Boolean));
        }
        return resolved;
      }
    }

    const store = context.store;

    // 5.4 Subschema References ($ref or schema: '...')
    const refKey = input.$ref || (typeof input.schema === 'string' ? input.schema : null);
    if (refKey) {
      const subSchemas = context.subSchemas;
      const resolver = context.resolver;
      const sub = (subSchemas && typeof subSchemas.get === 'function' ? subSchemas.get(refKey) : (subSchemas ? subSchemas[refKey] : null)) ||
                  (typeof resolver === 'function' ? resolver(refKey) : null);
      if (sub) {
        const subEl = interpret(sub, context);
        if (subEl && subEl.setAttribute) {
          if (input.className && subEl.classList) subEl.classList.add(...input.className.split(' ').filter(Boolean));
          if (input.id) subEl.id = input.id;
        }
        return subEl;
      }
    }

    // 5.5 Declarative Component Spec by block or component name
    const compName = (input.block || input.component || '').toLowerCase();
    if (compName) {
      const bindKey = input.bind || input.props?.bind;
      const initialStoreVal = (store && bindKey) ? store.get(bindKey) : undefined;
      const props = { ...input, ...(input.props || {}) };
      if (initialStoreVal !== undefined) {
        props.value = initialStoreVal;
      }
      if (bindKey) {
        props.attributes = { ...(props.attributes || {}), 'data-bind': bindKey };
      }

      // Priority 1: Dynamic component factory registry
      const registeredRenderer = getSlotComponent(compName);
      if (typeof registeredRenderer === 'function') {
        const compResult = registeredRenderer(props, context);
        const el = interpret(compResult, context);
        if (input.id && el && el.setAttribute) el.id = input.id;
        if (bindKey && el && el.setAttribute) el.setAttribute('data-bind', bindKey);
        if (input.action && el && el.setAttribute) el.setAttribute('data-action', input.action);
        return el;
      }

      // Priority 2: Engine or global Schema Registry + ComponentFactory
      const engine = context.engine;
      const schema = (engine && typeof engine.getBlock === 'function' ? engine.getBlock(compName) : null) || getSchema(compName);
      if (schema) {
        const behavior = engine?.getBehavior ? engine.getBehavior(compName) : null;
        const el = componentFactory(schema, props, behavior, context);
        if (input.id && el && el.setAttribute) el.id = input.id;
        if (bindKey && el && el.setAttribute) el.setAttribute('data-bind', bindKey);
        if (input.action && el && el.setAttribute) el.setAttribute('data-action', input.action);
        return el;
      }
    }

    // 5.6 Declarative Table Primitives (table, thead, tbody, tr, th, td)
    const isTableType = input.type === 'table' || input.type === 'thead' || input.type === 'tbody' || input.type === 'tr' || input.type === 'th' || input.type === 'td' ||
                        input.tag === 'table' || input.tag === 'thead' || input.tag === 'tbody' || input.tag === 'tr' || input.tag === 'th' || input.tag === 'td';
    if (isTableType) {
      const defaultTag = input.type === 'table' ? 'table' : (input.type || input.tag || 'table');
      const el = document.createElement(input.tag || defaultTag);
      if (input.className) el.className = input.className;
      if (input.id) el.id = input.id;
      if (input.action) el.setAttribute('data-action', input.action);
      if (input.attributes && typeof input.attributes === 'object') {
        for (const [k, v] of Object.entries(input.attributes)) el.setAttribute(k, v);
      }
      if (input.colSpan) el.colSpan = input.colSpan;
      if (input.rowSpan) el.rowSpan = input.rowSpan;

      // Handle declarative table head (head / thead)
      if (input.head) {
        const theadSpec = Array.isArray(input.head)
          ? { type: 'thead', children: input.head.map(h => (h?.type ? h : { type: 'tr', cells: h })) }
          : (input.head.type ? input.head : { type: 'thead', ...input.head });
        const theadEl = interpret(theadSpec, context);
        if (theadEl) el.appendChild(theadEl);
      }

      // Handle declarative table rows (rows / tbody)
      if (Array.isArray(input.rows)) {
        const tbodyEl = el.tagName === 'TABLE' ? document.createElement('tbody') : el;
        for (const row of input.rows) {
          const rowSpec = Array.isArray(row)
            ? { type: 'tr', cells: row }
            : (row && typeof row === 'object' && row.type ? row : { type: 'tr', ...(row || {}) });
          const trEl = interpret(rowSpec, context);
          if (trEl) tbodyEl.appendChild(trEl);
        }
        if (tbodyEl !== el) el.appendChild(tbodyEl);
      }

      // Handle table cells in a row (cells)
      if (Array.isArray(input.cells)) {
        for (const cell of input.cells) {
          const cellSpec = (cell && typeof cell === 'object' && (cell.type === 'td' || cell.type === 'th' || cell.tag === 'td' || cell.tag === 'th'))
            ? cell
            : { type: 'td', content: cell };
          const cellEl = interpret(cellSpec, context);
          if (cellEl) el.appendChild(cellEl);
        }
      }

      // Handle standard nested children
      if (Array.isArray(input.children)) {
        for (const child of input.children) {
          const childEl = interpret(child, context);
          if (childEl) el.appendChild(childEl);
        }
      } else if (input.content !== undefined && !input.cells && !input.rows && !input.head) {
        const contentEl = interpret(input.content, context);
        if (contentEl) el.appendChild(contentEl);
      }

      return el;
    }

    // 5.7 Layout Primitives & Root Page Composition (container, row, box, stack, page, arbitrary tagged wrapper)
    const isLayoutType = input.type === 'container' || input.type === 'row' || input.type === 'box' || input.type === 'stack' || input.type === 'page' || input.$schema === 'page-composition' ||
                         Boolean(input.tag && (input.children !== undefined || input.content !== undefined || input.className || input.id));
    if (isLayoutType) {
      const el = document.createElement(input.tag || 'div');
      const defaultClass = input.type === 'row' ? 'ui-layout-row' : (input.type === 'stack' ? 'ui-layout-stack' : (input.type === 'box' ? 'ui-layout-box' : ''));
      const classes = [input.className || defaultClass];
      if (input.gap) classes.push(`ui-layout--gap-${input.gap}`);
      if (input.justify) classes.push(`ui-layout--justify-${input.justify}`);
      if (input.align) classes.push(`ui-layout--align-${input.align}`);
      const filteredClasses = classes.filter(Boolean).join(' ');
      if (filteredClasses) el.className = filteredClasses;
      if (input.id) el.id = input.id;
      if (input.action) el.setAttribute('data-action', input.action);
      if (input.bind) el.setAttribute('data-bind', input.bind);
      if (input.attributes && typeof input.attributes === 'object') {
        for (const [k, v] of Object.entries(input.attributes)) el.setAttribute(k, v);
      }
      if (input.label) {
        const lbl = document.createElement('span');
        lbl.className = input.labelClass || 'ui-layout-label';
        lbl.textContent = input.label;
        el.appendChild(lbl);
      }
      if (input.bindText) el.setAttribute('data-bind-text', input.bindText);
      if (Array.isArray(input.children)) {
        for (const child of input.children) {
          const childEl = interpret(child, context);
          if (childEl) el.appendChild(childEl);
        }
      } else if (input.content !== undefined) {
        const contentEl = interpret(input.content, context);
        if (contentEl) el.appendChild(contentEl);
      } else if (input.text !== undefined) {
        const textVal = (store && input.bindText && store.get(input.bindText) !== undefined)
          ? store.get(input.bindText)
          : input.text;
        el.textContent = textVal;
      }
      return el;
    }

    // 5.7 Declarative Text Spec
    if (input.text !== undefined && input.tag) {
      const el = document.createElement(input.tag);
      if (input.className) el.className = input.className;
      if (input.id) el.id = input.id;
      if (input.action) el.setAttribute('data-action', input.action);
      if (input.bindText) el.setAttribute('data-bind-text', input.bindText);
      if (input.attributes && typeof input.attributes === 'object') {
        for (const [k, v] of Object.entries(input.attributes)) el.setAttribute(k, v);
      }
      const textVal = (store && input.bindText && store.get(input.bindText) !== undefined)
        ? store.get(input.bindText)
        : input.text;
      el.textContent = textVal;
      return el;
    }

    // 5.8 Fallback common content keys
    if (input.content !== undefined) return interpret(input.content, context);
    if (input.text !== undefined) return interpret(input.text, context);
    if (input.children !== undefined) return interpret(input.children, context);
    if (input.label !== undefined) return interpret(input.label, context);

    // Default object serialization
    return document.createTextNode(JSON.stringify(input));
  }

  // 6. Strings: Detect HTML markup vs Pure Text
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
      const template = document.createElement('template');
      template.innerHTML = trimmed;
      return template.content.cloneNode(true);
    }
    return document.createTextNode(input);
  }

  // 7. Numbers & Booleans
  return document.createTextNode(String(input));
}

/**
 * resolveSlotContent - Universal polymorphic slot resolver (delegates to interpret).
 * Kept for complete backward compatibility.
 */
export function resolveSlotContent(slotInput, context = {}) {
  return interpret(slotInput, context);
}
