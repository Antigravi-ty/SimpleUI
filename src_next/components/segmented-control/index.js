import schema from './schema.json';
import './styles/index.css';
import { initSegmentedControl } from './behavior.js';

export { initSegmentedControl };
export default {
  name: 'segmented-control',
  schema,
  behavior: initSegmentedControl,
  selector: '.ui-segmented-control'
};
