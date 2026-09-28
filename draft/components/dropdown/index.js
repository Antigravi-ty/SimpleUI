import schema from './schema.json' with { type: 'json' };
import './styles/index.css';
import { initDropdown } from './behavior.js';

export { schema as dropdownSchema, initDropdown };

export default {
  name: 'dropdown',
  schema,
  behavior: initDropdown,
  selector: `.${schema.prefix}`
};
