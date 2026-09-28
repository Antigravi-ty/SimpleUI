import { containerSchema, renderContainer } from './container/index.js';
import { stackSchema, renderStack } from './stack/index.js';
import { rowSchema, renderRow } from './row/index.js';
import { centerPlaceholderSchema, renderCenterPlaceholder } from './center-placeholder/index.js';
import { registerSlotComponent, registerPattern } from '@src_next/core/slot-resolver.js';

export {
  containerSchema,
  renderContainer,
  stackSchema,
  renderStack,
  rowSchema,
  renderRow,
  centerPlaceholderSchema,
  renderCenterPlaceholder
};

export const draftPrimitives = {
  container: containerSchema,
  stack: stackSchema,
  row: rowSchema,
  'center-placeholder': centerPlaceholderSchema
};

registerSlotComponent('center-placeholder', renderCenterPlaceholder);

registerPattern('container', renderContainer);
registerPattern('stack', renderStack);
registerPattern('row', renderRow);
registerPattern('center-placeholder', renderCenterPlaceholder);

export default draftPrimitives;
