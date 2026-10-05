import schema from './schema.json';
import './styles/index.css';
import { initPanel } from './behavior.js';

export { initPanel };
export default {
  name: 'panel',
  schema,
  behavior: initPanel,
  selector: '.ui-panel'
};
