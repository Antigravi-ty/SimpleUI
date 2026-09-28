import { getSchema } from './engine.js';

/**
 * Universal Signal Engine - Bidirectional data flow coordinator between DOM and State Store.
 * Reads and writes values strictly through schema.io contracts with zero component-specific if branches.
 */

export class SignalEngine {
  /**
   * Resolve Schema for an element via metadata or registry lookup.
   * @param {Element} element
   * @returns {object|null}
   */
  static resolveSchema(element) {
    if (!element) return null;
    if (element._uiSchema) return element._uiSchema;
    const blockName = element.dataset?.block;
    if (blockName) {
      const s = getSchema(blockName);
      if (s) return s;
    }
    // Try matching classes against registered schemas
    for (const cls of element.classList) {
      const clean = cls.replace(/^draft-/, '');
      const s = getSchema(clean);
      if (s) return s;
      const base = clean.replace(/--.*$/, '').replace(/^ui-/, '');
      const s2 = getSchema(base);
      if (s2) return s2;
    }
    return null;
  }

  /**
   * Extract reactive value from DOM element (UI -> Store).
   * @param {Element} element
   * @param {Event} [event=null]
   * @param {Map} [adapters=null]
   * @returns {any}
   */
  static getValue(element, event = null, adapters = null) {
    if (!element) return undefined;

    // Check custom adapters first
    if (adapters) {
      for (const [selector, adapter] of adapters) {
        if (element.matches(selector) && typeof adapter.getValue === 'function') {
          const v = adapter.getValue(element, event);
          if (v !== undefined) return v;
        }
      }
    }

    const schema = this.resolveSchema(element);
    const ioModel = schema?.io?.model;

    if (ioModel) {
      const target = ioModel.selector === ':root' || !ioModel.selector
        ? element
        : (element.querySelector(ioModel.selector) || element);

      let rawVal;
      if (ioModel.prop && target[ioModel.prop] !== undefined) {
        rawVal = target[ioModel.prop];
      } else if (ioModel.attr) {
        rawVal = target.getAttribute(ioModel.attr);
      } else if (event?.target && event.target !== element) {
        rawVal = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      }

      if (rawVal !== undefined) {
        if (ioModel.type === 'number') {
          const num = Number(rawVal);
          return isNaN(num) ? rawVal : num;
        }
        if (ioModel.type === 'boolean') {
          return Boolean(rawVal);
        }
        return rawVal;
      }
    }

    // Generic fallbacks for standard HTML controls
    if (event?.detail && event.detail.value !== undefined) {
      return event.detail.value;
    }
    if (event?.target?.type === 'checkbox') {
      return event.target.checked;
    }
    if (element.type === 'checkbox') {
      return element.checked;
    }
    if (event?.target?.value !== undefined && event.target.value !== '') {
      const num = Number(event.target.value);
      return isNaN(num) ? event.target.value : num;
    }
    if (element.value !== undefined && element.value !== '') {
      const num = Number(element.value);
      return isNaN(num) ? element.value : num;
    }

    return element.textContent.trim();
  }

  /**
   * Apply reactive value to DOM element (Store -> UI).
   * @param {Element} element
   * @param {any} value
   * @param {Map} [adapters=null]
   */
  static setValue(element, value, adapters = null) {
    if (!element) return;

    // Check custom adapters first
    if (adapters) {
      for (const [selector, adapter] of adapters) {
        if (element.matches(selector) && typeof adapter.setValue === 'function') {
          adapter.setValue(element, value);
          return;
        }
      }
    }

    const schema = this.resolveSchema(element);
    const io = schema?.io;

    // Group-level binding (e.g. selective-group / radio list)
    if (io?.group) {
      const groupDef = io.group;
      const items = element.querySelectorAll(groupDef.itemSelector || groupDef.selector || '.ui-selective-card');
      items.forEach(card => {
        const itemVal = card.getAttribute(groupDef.matchAttr || 'data-value');
        const isMatch = String(itemVal) === String(value);
        if (groupDef.classSync) card.classList.toggle(groupDef.classSync, isMatch);
        if (groupDef.attrSync) card.setAttribute(groupDef.attrSync, String(isMatch));
      });
      return;
    }

    const ioModel = io?.model;
    if (ioModel) {
      // 1. Multi-target write rules
      if (Array.isArray(ioModel.write)) {
        for (const rule of ioModel.write) {
          const dest = rule.selector === ':root' ? element : element.querySelector(rule.selector);
          if (!dest) continue;
          if (rule.style) {
            dest.style[rule.style] = rule.unit ? `${value}${rule.unit}` : String(value);
          }
          if (rule.text) {
            dest.textContent = rule.text.replace('{value}', String(value));
          }
          if (rule.attr) {
            dest.setAttribute(rule.attr, String(value));
          }
        }
      }

      // 2. Direct selector model property
      if (ioModel.selector) {
        const dest = ioModel.selector === ':root' ? element : (element.querySelector(ioModel.selector) || element);
        if (dest && ioModel.prop) {
          if (dest !== document.activeElement && dest[ioModel.prop] != value) {
            dest[ioModel.prop] = ioModel.type === 'number' ? Number(value) : value;
          }
        }
        if (dest && ioModel.attr) {
          dest.setAttribute(ioModel.attr, String(value));
        }
      }

      // 3. Class synchronization
      if (ioModel.classSync) {
        element.classList.toggle(ioModel.classSync, Boolean(value));
      }

      // 4. Display text formatting
      if (ioModel.display && ioModel.display.selector) {
        const disp = element.querySelector(ioModel.display.selector);
        if (disp) {
          const unit = element.dataset.unit || '';
          const fmt = ioModel.display.format || '{value}';
          disp.textContent = fmt.replace('{value}', String(value)).replace('{unit}', unit);
        }
      }
      return;
    }

    // Generic fallback for plain inputs / elements
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
      if (element.type === 'checkbox') {
        element.checked = Boolean(value);
      } else if (element !== document.activeElement && element.value != value) {
        element.value = String(value);
      }
    } else {
      element.textContent = String(value);
    }
  }
}
