import schema from './schema.json';
import './styles/index.css';
import { initDropdown } from './behavior.js';

export { initDropdown };
export default {
  name: 'dropdown',
  schema,
  behavior: initDropdown,
  selector: '.ui-dropdown'
};
