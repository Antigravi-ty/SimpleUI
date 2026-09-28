import schema from './schema.json';
import './styles/index.css';
import { initSelectiveCard } from './behavior.js';
import { initSelectiveGroup } from './behavior-group.js';

export { initSelectiveCard, initSelectiveGroup };
export default {
  name: 'selective-card',
  schema,
  behaviors: [
    { selector: '.ui-selective-card', init: initSelectiveCard },
    { selector: '.ui-selective-group', init: initSelectiveGroup }
  ]
};
