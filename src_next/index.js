import { components, initCheckbox, initDropdown, initProgressBar, initSegmentedControl, initSelectiveCard, initSelectiveGroup, initSlider, initStepper, initTabs, initToggler } from './components/index.js';
import { primitives } from './primitives/index.js';
import { patterns, initPanel } from './patterns/index.js';
import { animations, executeMorphTransition, initLivePreview } from './animations/index.js';

export {
  components,
  primitives,
  patterns,
  animations
};

const registry = new Map([
  ['.ui-checkbox', initCheckbox],
  ['.ui-dropdown', initDropdown],
  ['.ui-panel', initPanel],
  ['.ui-progressbar', initProgressBar],
  ['.ui-segmented-control', initSegmentedControl],
  ['.ui-selective-card', initSelectiveCard],
  ['.ui-selective-group', initSelectiveGroup],
  ['.ui-slider', initSlider],
  ['.ui-stepper', initStepper],
  ['.ui-tabs', initTabs],
  ['.ui-toggler', initToggler]
]);

export function registerBehavior(selector, initFn) {
  registry.set(selector, initFn);
}

export function bindAllBehaviors(container = document) {
  for (const [selector, initFn] of registry.entries()) {
    container.querySelectorAll(selector).forEach(initFn);
  }
}

export function destroyBehaviors(container = document) {
  for (const selector of registry.keys()) {
    container.querySelectorAll(selector).forEach((el) => {
      if (typeof el._uiCleanup === 'function') {
        el._uiCleanup();
        delete el._uiCleanup;
      }
    });
  }
}

export default {
  components,
  primitives,
  patterns,
  animations,
  bindAllBehaviors
};
