import { bindAllBehaviors } from '../index.js';
import { interpret } from './slot-resolver.js';

/**
 * PageComposer - Thin declarative coordinator delegating recursive execution
 * to the universal semantic interpreter.
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
    const root = this.renderNode(pageSchema, { store, ...options });
    if (root && root.nodeType === 1) { // Element node
      bindAllBehaviors(root);
      if (store && typeof store.initEventDelegation === 'function') {
        store.initEventDelegation(root);
      }
    }
    return root;
  }

  renderNode(node, context = {}) {
    if (!node) return null;
    return interpret(node, {
      store: this.store,
      engine: this.engine,
      subSchemas: this.subSchemas,
      resolver: this.resolver,
      ...context
    });
  }

  renderBlockNode(node, context = {}) {
    return this.renderNode(node, context);
  }
}
