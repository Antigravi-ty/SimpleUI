import schema from './schema.json' with { type: 'json' };
import './styles/index.css';
import { initCheckbox } from './behavior.js';

export { schema as checkboxSchema, initCheckbox };

export default {
  name: 'checkbox',
  schema,
  behavior: initCheckbox,
  selector: `.${schema.prefix}`
};
