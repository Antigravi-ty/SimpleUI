import schema from './schema.json' with { type: 'json' };
import './styles/index.css';
import { initSegmentedControl } from './behavior.js';

export { schema as segmentedControlSchema, initSegmentedControl };

export default {
  name: 'segmented-control',
  schema,
  behavior: initSegmentedControl,
  selector: `.${schema.prefix}`
};
