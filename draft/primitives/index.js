import { containerSchema, renderContainer } from './container/index.js';
import { stackSchema, renderStack } from './stack/index.js';
import { rowSchema, renderRow } from './row/index.js';
import { centerPlaceholderSchema, renderCenterPlaceholder } from './center-placeholder/index.js';

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

export default draftPrimitives;
