import schema from './schema.json';
import './styles/index.css';
import { initToggler } from './behavior.js';

export { initToggler };
export default {
  name: 'toggler',
  schema,
  behavior: initToggler,
  selector: '.ui-toggler'
};
