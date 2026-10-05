import { containerSchema } from './container/index.js';
import { stackSchema } from './stack/index.js';
import { rowSchema } from './row/index.js';
import { centerPlaceholderSchema } from './center-placeholder/index.js';

export {
  containerSchema,
  stackSchema,
  rowSchema,
  centerPlaceholderSchema
};

export const primitives = {
  container: containerSchema,
  stack: stackSchema,
  row: rowSchema,
  'center-placeholder': centerPlaceholderSchema
};

export default primitives;
