import schema from './schema.json';
import './styles/index.css';
import { initTabs } from './behavior.js';

export { initTabs };
export default {
  name: 'tabs',
  schema,
  behavior: initTabs,
  selector: '.ui-tabs'
};
