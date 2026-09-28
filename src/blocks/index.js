import badge from './badge/index.js';
import button from './button/index.js';
import checkbox, { initCheckbox } from './checkbox/index.js';
import dropdown, { initDropdown } from './dropdown/index.js';
import panel, { initPanel } from './panel/index.js';
import progressbar, { initProgressBar } from './progressbar/index.js';
import segmentedControl, { initSegmentedControl } from './segmented-control/index.js';
import selectiveCard, { initSelectiveCard, initSelectiveGroup } from './selective-card/index.js';
import slider, { initSlider } from './slider/index.js';
import stepper, { initStepper } from './stepper/index.js';
import tabs, { initTabs } from './tabs/index.js';
import toggler, { initToggler } from './toggler/index.js';

export {
  badge,
  button,
  checkbox,
  dropdown,
  panel,
  progressbar,
  segmentedControl,
  selectiveCard,
  slider,
  stepper,
  tabs,
  toggler,
  initCheckbox,
  initDropdown,
  initPanel,
  initProgressBar,
  initSegmentedControl,
  initSelectiveCard,
  initSelectiveGroup,
  initSlider,
  initStepper,
  initTabs,
  initToggler
};

export const blocks = {
  badge,
  button,
  checkbox,
  dropdown,
  panel,
  progressbar,
  'segmented-control': segmentedControl,
  'selective-card': selectiveCard,
  slider,
  stepper,
  tabs,
  toggler
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

export default blocks;
