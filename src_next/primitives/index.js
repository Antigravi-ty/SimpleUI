import { containerSchema } from './container/index.js';
import { cardSchema } from './card/index.js';
import { wellSchema } from './well/index.js';
import { stackRowSchema } from './stack-row/index.js';

export {
  containerSchema,
  cardSchema,
  wellSchema,
  stackRowSchema
};

export const primitives = {
  container: containerSchema,
  card: cardSchema,
  well: wellSchema,
  'stack-row': stackRowSchema
};

export default primitives;
