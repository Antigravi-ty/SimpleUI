import schema from './schema.json';
import './styles/index.css';
import { initStepper } from './behavior.js';

export { initStepper };
export default {
  name: 'stepper',
  schema,
  behavior: initStepper,
  selector: '.ui-stepper'
};
