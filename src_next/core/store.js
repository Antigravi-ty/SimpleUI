import { SignalEngine } from './signal-engine.js';
import { defaultActionEngine } from './action-engine.js';

export { defaultActionEngine, registerAction, dispatchAction } from './action-engine.js';

/**
 * SimpleUIStore - Central Reactive State Store & State Synchronization Hub.
 * 
 * High-performance state architecture:
 * 1. State Externalization: Lightweight in-memory reactive state dictionary.
 * 2. Store -> UI: Subscriptions automatically synchronize all bound DOM elements via SignalEngine.
 * 3. UI -> Store: Single root event delegation listener captures changes without per-element listeners.
 * 4. Action Delegation: Integrates with ActionEngine for decoupled declarative action routing.
 */

const componentAdapters = new Map();

/**
 * Register custom component store adapter for bidirectional binding.
 * @param {string} selector - CSS class or selector identifying the component
 * @param {object} adapter - { getValue(el, event), setValue(el, val) }
 */
export function registerStoreAdapter(selector, adapter) {
  componentAdapters.set(selector, adapter);
}

export class SimpleUIStore {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
    this.globalListeners = new Set();
    this.boundRoots = new WeakSet();
  }

  get(key, defaultValue = undefined) {
    return this.state[key] !== undefined ? this.state[key] : defaultValue;
  }

  set(key, value, { silent = false } = {}) {
    const prev = this.state[key];
    if (prev === value) return;
    this.state[key] = value;

    if (!silent) {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.forEach(cb => cb(value, prev, key));
      }
      this.globalListeners.forEach(cb => cb(key, value, prev));
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    if (this.state[key] !== undefined) {
      callback(this.state[key], undefined, key);
    }
    return () => {
      const set = this.listeners.get(key);
      if (set) set.delete(callback);
    };
  }

  subscribeAll(callback) {
    this.globalListeners.add(callback);
    return () => this.globalListeners.delete(callback);
  }

  getState() {
    return { ...this.state };
  }

  registerAction(actionName, handler) {
    defaultActionEngine.register(actionName, (payload) => {
      return handler({ ...payload, store: this }, this);
    });
    return this;
  }

  dispatchAction(actionName, payload = {}) {
    return defaultActionEngine.dispatch(actionName, { ...payload, store: this });
  }

  initEventDelegation(root = document) {
    defaultActionEngine.init(root);

    if (this.boundRoots.has(root)) return;
    this.boundRoots.add(root);

    // 1. UI -> Store Value Synchronization (via SignalEngine)
    const handleValueEvent = (event) => {
      if (event.defaultPrevented) return;
      const target = event.target.closest('[data-bind]');
      if (!target) return;
      if (target.closest('[data-prevent-default="true"]')) return;

      const key = target.dataset.bind;
      const val = SignalEngine.getValue(target, event, componentAdapters);
      if (val !== undefined) {
        this.set(key, val);
      }
    };

    root.addEventListener('change', handleValueEvent, true);
    root.addEventListener('input', handleValueEvent, true);
    root.addEventListener('step', handleValueEvent, true);
    root.addEventListener('toggle', handleValueEvent, true);
    root.addEventListener('select', handleValueEvent, true);

    // 2. Store -> UI (DOM Synchronization via SignalEngine & State Subscribers)
    this.subscribeAll((key, val) => {
      // Synchronize text labels
      root.querySelectorAll(`[data-bind-text="${key}"]`).forEach(el => {
        el.textContent = String(val);
      });

      // Synchronize bound controls via SignalEngine
      root.querySelectorAll(`[data-bind="${key}"]`).forEach(host => {
        SignalEngine.setValue(host, val, componentAdapters);
      });
    });
  }
}

export const defaultStore = new SimpleUIStore();
