/**
 * BehaviorRegistry - Component lifecycle and interaction behavior manager.
 * 
 * Manages behavior attachment (init*) and teardown (destroy) across DOM trees,
 * preventing memory leaks on SPA route transitions.
 */

export class BehaviorRegistry {
  constructor() {
    this.registry = new Map();
  }

  /**
   * Register an interaction behavior function for a CSS selector.
   * @param {string} selector - CSS selector
   * @param {Function} initFn - Initialization behavior function (el) => void
   */
  register(selector, initFn) {
    if (selector && typeof initFn === 'function') {
      this.registry.set(selector, initFn);
    }
  }

  /**
   * Retrieve registered behavior function.
   * @param {string} selector
   * @returns {Function|undefined}
   */
  get(selector) {
    return this.registry.get(selector);
  }

  /**
   * Bind all registered behaviors within a container.
   * @param {ParentNode} [container=document]
   */
  bindAll(container = document) {
    for (const [selector, initFn] of this.registry.entries()) {
      container.querySelectorAll(selector).forEach((el) => {
        try {
          initFn(el);
        } catch (err) {
          console.error(`[BehaviorRegistry] Error binding ${selector}:`, err);
        }
      });
    }
  }

  /**
   * Clean up and destroy all bound behaviors within a container.
   * @param {ParentNode} [container=document]
   */
  destroyAll(container = document) {
    for (const selector of this.registry.keys()) {
      container.querySelectorAll(selector).forEach((el) => {
        if (typeof el._uiCleanup === 'function') {
          try {
            el._uiCleanup();
          } catch (err) {
            console.error(`[BehaviorRegistry] Error destroying ${selector}:`, err);
          }
          delete el._uiCleanup;
        }
      });
    }
  }
}

export const defaultBehaviorRegistry = new BehaviorRegistry();

export function registerBehavior(selector, initFn) {
  defaultBehaviorRegistry.register(selector, initFn);
}

export function bindAllBehaviors(container = document) {
  defaultBehaviorRegistry.bindAll(container);
}

export function destroyBehaviors(container = document) {
  defaultBehaviorRegistry.destroyAll(container);
}
