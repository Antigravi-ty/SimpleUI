import button, { buttonSchema } from './button/index.js';
import checkbox, { checkboxSchema, initCheckbox } from './checkbox/index.js';
import badge, { badgeSchema } from './badge/index.js';
import dropdown, { dropdownSchema, initDropdown } from './dropdown/index.js';
import slider, { sliderSchema, initSlider } from './slider/index.js';
import segmentedControl, { segmentedControlSchema, initSegmentedControl } from './segmented-control/index.js';

export {
  buttonSchema,
  checkboxSchema,
  initCheckbox,
  badgeSchema,
  dropdownSchema,
  initDropdown,
  sliderSchema,
  initSlider,
  segmentedControlSchema,
  initSegmentedControl
};

export const draftComponents = {
  button,
  checkbox,
  badge,
  dropdown,
  slider,
  'segmented-control': segmentedControl
};

export default draftComponents;
