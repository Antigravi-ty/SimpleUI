import schema from './schema.json' with { type: 'json' };
import { renderDropdownMenu } from './render.js';

export { schema as dropdownMenuSchema, renderDropdownMenu };

export default {
  name: 'dropdown-menu',
  schema,
  render: renderDropdownMenu
};
