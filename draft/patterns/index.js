import { threeStageSchema, renderThreeStageContainer } from './three-stage/index.js';
import { dropdownMenuSchema, renderDropdownMenu } from './dropdown-menu/index.js';

export {
  threeStageSchema,
  renderThreeStageContainer,
  dropdownMenuSchema,
  renderDropdownMenu
};

export const draftPatterns = {
  'three-stage': threeStageSchema,
  'dropdown-menu': dropdownMenuSchema
};

export default draftPatterns;
