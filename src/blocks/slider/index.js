import schema from './schema.json';
import './styles/index.css';
import { initSlider } from './behavior.js';

export { initSlider };
export default {
  name: 'slider',
  schema,
  behavior: initSlider,
  selector: '.ui-slider'
};
