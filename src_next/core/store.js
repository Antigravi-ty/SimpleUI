/**
 * SimpleUIStore - Central Reactive State Store & Bidirectional Event Delegation Bus.
 * 
 * High-performance state architecture:
 * 1. State Externalization: Lightweight in-memory reactive state dictionary.
 * 2. Store -> UI: Subscriptions automatically synchronize all bound DOM elements.
 * 3. UI -> Store: Single root event delegation listener captures changes without per-element listeners.
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
    this.eventDelegationBound = false;
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

  initEventDelegation(root = document) {
    if (this.eventDelegationBound) return;
    this.eventDelegationBound = true;

    // 1. UI -> Store (Event Delegation)
    const handleEvent = (event) => {
      const target = event.target.closest('[data-bind]');
      if (!target) return;

      const key = target.dataset.bind;
      let val;

      // Check custom adapters first
      for (const [selector, adapter] of componentAdapters) {
        if (target.matches(selector) && typeof adapter.getValue === 'function') {
          val = adapter.getValue(target, event);
          if (val !== undefined) break;
        }
      }

      if (val === undefined) {
        if (event.detail && event.detail.value !== undefined) {
          val = event.detail.value;
        } else if (event.target.type === 'checkbox') {
          val = event.target.checked;
        } else if (target.classList.contains('ui-toggler')) {
          val = target.classList.contains('ui-toggler--checked');
        } else if (event.target.value !== undefined && event.target.value !== '') {
          val = isNaN(Number(event.target.value)) ? event.target.value : Number(event.target.value);
        } else if (target.value !== undefined && target.value !== '') {
          val = isNaN(Number(target.value)) ? target.value : Number(target.value);
        } else {
          val = target.textContent.trim();
        }
      }

      this.set(key, val);
    };

    root.addEventListener('change', handleEvent, true);
    root.addEventListener('input', handleEvent, true);
    root.addEventListener('step', handleEvent, true);
    root.addEventListener('toggle', handleEvent, true);
    root.addEventListener('select', handleEvent, true);

    // 2. Store -> UI (DOM Synchronization)
    this.subscribeAll((key, val) => {
      // Synchronize text labels
      root.querySelectorAll(`[data-bind-text="${key}"]`).forEach(el => {
        el.textContent = String(val);
      });

      // Synchronize bound controls
      root.querySelectorAll(`[data-bind="${key}"]`).forEach(host => {
        // Check registered adapters
        for (const [selector, adapter] of componentAdapters) {
          if (host.matches(selector) && typeof adapter.setValue === 'function') {
            adapter.setValue(host, val);
            return;
          }
        }

        // Built-in Sliders
        if (host.classList.contains('ui-slider')) {
          host.querySelectorAll('input').forEach(input => {
            if (input !== document.activeElement && input.value != val) input.value = val;
          });
          const valDisplay = host.querySelector('.ui-slider__value');
          if (valDisplay) valDisplay.textContent = val;
        }

        // Built-in Steppers
        if (host.classList.contains('ui-stepper')) {
          const valDisplay = host.querySelector('.ui-stepper__value');
          if (valDisplay) valDisplay.textContent = val;
        }

        // Built-in Togglers
        if (host.classList.contains('ui-toggler')) {
          const isTrue = Boolean(val);
          host.classList.toggle('ui-toggler--checked', isTrue);
          host.setAttribute('aria-checked', String(isTrue));
        }

        // Built-in Progressbars
        if (host.classList.contains('ui-progressbar')) {
          const fill = host.querySelector('.ui-progressbar__fill');
          if (fill) fill.style.width = `${Math.min(100, Math.max(0, Number(val) || 0))}%`;
          host.setAttribute('aria-valuenow', String(val));
        }

        // Built-in Checkboxes
        if (host.classList.contains('ui-checkbox')) {
          const isChecked = Boolean(val);
          host.classList.toggle('ui-checkbox--checked', isChecked);
          const cb = host.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = isChecked;
        }

        // Built-in Selective Cards
        if (host.classList.contains('ui-selective-group')) {
          host.querySelectorAll('.ui-selective-card').forEach(card => {
            const isMatch = card.dataset.value === String(val);
            card.classList.toggle('ui-selective-card--selected', isMatch);
            card.setAttribute('aria-checked', String(isMatch));
          });
        }
      });
    });
  }
}

export const defaultStore = new SimpleUIStore();
