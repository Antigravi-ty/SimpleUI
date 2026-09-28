import schema from './schema.json';
import './styles/index.css';
import { initCheckbox } from './behavior.js';

export { initCheckbox };
export default {
  name: 'checkbox',
  schema,
  behavior: initCheckbox,
  selector: '.ui-checkbox'
};
