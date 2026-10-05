/**
 * Universal Action Engine - Declarative Event Delegation & Action Bus.
 * 
 * Intercepts user interactions (clicks, commands) via root-level event delegation
 * on [data-action] elements and routes them to registered action handlers without
 * per-element event listeners or private closures.
 */

export class ActionEngine {
  constructor() {
    this.handlers = new Map();
    this.boundRoots = new WeakSet();
  }

  /**
   * Register an action handler function for an action name.
   * @param {string} actionName
   * @param {Function} handler - ({ element, event, actionEngine, ...payload }) => void
   */
  register(actionName, handler) {
    if (actionName && typeof handler === 'function') {
      this.handlers.set(actionName, handler);
    }
    return this;
  }

  /**
   * Unregister an action handler.
   * @param {string} actionName
   */
  unregister(actionName) {
    this.handlers.delete(actionName);
    return this;
  }

  /**
   * Dispatch an action by name with optional payload.
   * @param {string} actionName
   * @param {object} [payload={}]
   */
  dispatch(actionName, payload = {}) {
    const handler = this.handlers.get(actionName);
    if (typeof handler === 'function') {
      try {
        return handler({ actionEngine: this, ...payload });
      } catch (err) {
        console.error(`[ActionEngine] Error executing action "${actionName}":`, err);
      }
    }
    return undefined;
  }

  /**
   * Attach global root event delegation for [data-action].
   * @param {ParentNode} [root=document]
   */
  init(root = document) {
    if (this.boundRoots.has(root)) return;
    this.boundRoots.add(root);

    const handleActionClick = (event) => {
      if (event.defaultPrevented) return;
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      if (actionEl.closest('[data-prevent-default="true"]')) return;
      const actionName = actionEl.getAttribute('data-action');
      if (actionName) {
        this.dispatch(actionName, {
          element: actionEl,
          event
        });
      }
    };

    root.addEventListener('click', handleActionClick);
  }
}

export const defaultActionEngine = new ActionEngine();

export function registerAction(actionName, handler) {
  return defaultActionEngine.register(actionName, handler);
}

export function dispatchAction(actionName, payload = {}) {
  return defaultActionEngine.dispatch(actionName, payload);
}
