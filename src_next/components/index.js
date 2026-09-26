import badge from './badge/index.js';
import button from './button/index.js';
import checkbox, { initCheckbox } from './checkbox/index.js';
import dropdown, { initDropdown } from './dropdown/index.js';
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
  progressbar,
  segmentedControl,
  selectiveCard,
  slider,
  stepper,
  tabs,
  toggler,
  initCheckbox,
  initDropdown,
  initProgressBar,
  initSegmentedControl,
  initSelectiveCard,
  initSelectiveGroup,
  initSlider,
  initStepper,
  initTabs,
  initToggler
};

export const components = {
  badge,
  button,
  checkbox,
  dropdown,
  progressbar,
  'segmented-control': segmentedControl,
  'selective-card': selectiveCard,
  slider,
  stepper,
  tabs,
  toggler
};

export default components;
