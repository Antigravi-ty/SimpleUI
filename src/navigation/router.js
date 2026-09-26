import actionsSchema from '../schemas/navigation/actions.json';
import { executeMorphTransition } from '../core/morph-transition.js';

export class UIRouter {
  constructor(options = {}) {
    this.actions = new Map(Object.entries(options.actions || actionsSchema.actions || {}));
    this.handlers = new Map();
    this.navigateHandler = options.onNavigate || ((target) => { window.location.href = target; });
    this.handleClick = this.handleClick.bind(this);
    this.init(options.root || document);
  }

  init(root) {
    this.root = root;
    this.root.addEventListener('click', this.handleClick);
  }

  registerAction(actionId, definition) {
    this.actions.set(actionId, definition);
    return this;
  }

  on(actionId, handler) {
    this.handlers.set(actionId, handler);
    return this;
  }

  handleClick(e) {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const actionKey = trigger.dataset.action;
    const action = this.actions.get(actionKey);

    if (this.handlers.has(actionKey)) {
      e.preventDefault();
      this.handlers.get(actionKey)(trigger, action);
      return;
    }
    if (!action) return;
    e.preventDefault();
    this.executeAction(action, trigger, actionKey);
  }

  executeAction(action, trigger, actionKey) {
    const root = this.root || document;

    switch (action.type) {
      case 'navigate':
        if (action.target) this.navigateHandler(action.target, trigger);
        break;
      case 'class_toggle':
      case 'toggle_class': {
        const target = action.targetSelector ? root.querySelector(action.targetSelector) : trigger;
        if (target && action.className) {
          const isActive = target.classList.toggle(action.className);
          if (action.toggleText && trigger) {
            trigger.textContent = isActive ? action.toggleText.active : action.toggleText.inactive;
          }
        }
        break;
      }
      case 'set_text': {
        const target = action.targetSelector ? root.querySelector(action.targetSelector) : trigger;
        if (target && action.text) {
          const prev = target.textContent;
          target.textContent = action.text;
          if (action.resetAfter) setTimeout(() => { target.textContent = prev; }, action.resetAfter);
        }
        break;
      }
      case 'drilldown_push':
      case 'drilldown_pop': {
        if (action.hideSelector) root.querySelectorAll(action.hideSelector).forEach(el => el.classList.add('is-hidden'));
        if (action.showSelector) root.querySelectorAll(action.showSelector).forEach(el => el.classList.remove('is-hidden'));
        if (action.title && action.titleSelector) {
          const titleEl = root.querySelector(action.titleSelector);
          if (titleEl) titleEl.textContent = action.title;
        }
        break;
      }
      case 'morph_transition': {
        const container = action.containerSelector ? root.querySelector(action.containerSelector) : root.querySelector('.ui-morph-panel');
        const content = action.contentSelector ? root.querySelector(action.contentSelector) : root.querySelector('.ui-morph-content');
        executeMorphTransition({
          container,
          content,
          width: action.width,
          height: action.height,
          onSwitch: () => {
            if (action.hideSelector) root.querySelectorAll(action.hideSelector).forEach(el => el.classList.add('is-hidden'));
            if (action.showSelector) root.querySelectorAll(action.showSelector).forEach(el => el.classList.remove('is-hidden'));
          }
        });
        break;
      }
      case 'sequence':
        for (const step of action.steps || []) this.executeAction(step, trigger, actionKey);
        break;
    }
  }

  destroy() {
    if (this.root) this.root.removeEventListener('click', this.handleClick);
    this.handlers.clear();
  }
}
