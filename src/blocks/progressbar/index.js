import schema from './schema.json';
import './styles/index.css';
import { initProgressBar } from './behavior.js';

export { initProgressBar };
export default {
  name: 'progressbar',
  schema,
  behavior: initProgressBar,
  selector: '.ui-progressbar'
};
